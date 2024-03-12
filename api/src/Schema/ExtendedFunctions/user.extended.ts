import * as bcrypt from "bcrypt";
import { ValidationErrorFactory, errorFactory } from "../../Util/Factories";
import mongoose from "mongoose";
import { MakeValidator } from "../../Domains/Common";
import Joi from "joi";
import { isValidationError } from "../../Types/error"
import { IUser, IUserDocument, TVerified, TVerifiedSupported, UserModel, verifiedEnum, verifiedSupportedEnum } from "../Types/user.schema.types";
import { BSONError } from 'bson';
import { PEGIRating, TPEGIRating } from "../../Domains/Event/validation";
import { IEvent } from "../Types/event.schema.types";
import { ITicketTypes } from "../Types/ticketTypes.schema.types";
import { IBoughTicket } from "../../Domains/TicketTypes/types";
import { ITransactions, ITransactionsDocument } from "../Types/transactions.schema.types";
import { IUserUpdateFrom } from "../../Domains/User/types";


export async function encryptPassword(this: IUser, password?: string): Promise<String> {

    const saltRounds: number = Number.parseInt(process.env.saltRounds || "11");
    try {
        const hashPassword = await bcrypt.hash(password ?? this.password as string, saltRounds);
        this.password = hashPassword;
        return this.password;
    } catch (error) {
        console.log("[-] Bcrypt Error", error);
        throw errorFactory({
            msg: "Bcrypt Error",
            statusCode: 418,
            type: "system"
        });

    }
}

export async function checkPassword(this: IUser, password: string): Promise<boolean> {

    try {
        const gate = await bcrypt.compare(password, this.password as string);
        if (gate === false) {
            throw ValidationErrorFactory({
                msg: "Invalid Email or Password",
                statusCode: 404,
                type: "Validation"
            }, "")
        }
        return gate;
    } catch (error: any) {

        if (isValidationError(error)) {
            throw error;
        }
        console.log("[-] Bcrypt Error", error);
        throw errorFactory({
            msg: "Bcrypt Error",
            statusCode: 418,
            type: "system"
        });
    }
}

export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getUserByEmail(this: mongoose.Model<IUser>, email: string): Promise<mongoose.Document<unknown, UserModel, IUser> & IUser & { _id: mongoose.Types.ObjectId; } | null> {
    const user = await this.findOne({ email });
    if (user == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Email or Password",
            statusCode: 404,
            type: "Validation"
        }, "")
    }
    return user;
}

export async function getUserByWalletAccounts(this: mongoose.Model<IUser>, walletAccounts: string[]): Promise<mongoose.Document<unknown, UserModel, IUser> & IUser & { _id: mongoose.Types.ObjectId; } | null> {

    const user = await this.findOne({
        walletAccounts: {
            $in: walletAccounts
        }
    });
    if (user == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Wallet Address",
            statusCode: 404,
            type: "Validation"
        }, "walletAccounts")
    }
    return user;
}

export async function getUserById(this: mongoose.Model<IUser>, _id: string): Promise<mongoose.Document<unknown, UserModel, IUser> & IUser & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const user = await this.findById(new mongoose.Types.ObjectId(_id));
        if (user == null) {
            throw ValidationErrorFactory({
                msg: "User not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return user;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }

}

export async function applyUserVerify(this: IUser, key: TVerified): Promise<IUser> {
    try {
        if (!Object.values(verifiedEnum).includes(key)) {
            throw ValidationErrorFactory({
                msg: "Invalid Key for Verification",
                statusCode: 404,
                type: "Validation"
            }, "key")
        }
        this.verified = key;
        await this.save()
        return this;
    } catch (error: any) {

        if (isValidationError(error)) {
            throw error;
        }
        console.log("[-] applyUserVerify", error);
        throw errorFactory({
            msg: "mongoose",
            statusCode: 418,
            type: "system"
        });

    }
}
export async function getByVerifiedKey(this: mongoose.Model<IUser>, key: TVerifiedSupported, value: string): Promise<mongoose.Document<unknown, UserModel, IUser> & IUser & { _id: mongoose.Types.ObjectId; } | null> {

    try {
        var user;

        if (key == 'email' || key == 'phone') {
            user = await this.findOne({
                $and: [{
                    [key]: value,
                    verified: key
                }]

            });
        }
        else if (key == 'wallet') {
            user = await this.findOne({
                $and: [{
                    walletAccounts: {
                        $in: [value]
                    },
                    verified: 'wallet'
                }]

            });
        }

        if (user == null) {
            throw ValidationErrorFactory({
                msg: "Invalid Key for Verification",
                statusCode: 404,
                type: "Validation"
            }, "key")
        }
        return user;

    } catch (error: any) {
        if (isValidationError(error)) {
            throw error;
        }
        console.log("[-] getByVerifiedKey", error);
        throw errorFactory({
            msg: "mongoose",
            statusCode: 418,
            type: "system"
        });
    }
}
export function checkVerifiedBy(this: IUser, key: TVerifiedSupported): boolean {
    try {

        if (!Object.values(verifiedSupportedEnum).includes(key)) {
            throw ValidationErrorFactory({
                msg: "Invalid Key for Verification",
                statusCode: 404,
                type: "Validation"
            }, "key")
        }
        if (this.verified === key) {
            return true;
        }
        return false;
    } catch (error: any) {
        throw error
    }

}
export function getPEGIRating(this: IUser): TPEGIRating {

    const currentDate = new Date();
    const age = currentDate.getFullYear() - this.dateOfBirth.getFullYear();

    for (const rating of PEGIRating.slice().reverse()) {
        const ageRequirement = parseInt(rating.split(" ")[1]);
        if (age >= ageRequirement) {
            return rating as TPEGIRating;
        }
    }

    return "PEGI 7";
}

export async function addEvent(this: mongoose.Model<IUser>, _id: string, event: IEvent, boughTicket: IBoughTicket, walletAccount: string): Promise<{ transaction: ITransactionsDocument, user: IUserDocument } | null> {

    try {
        const user = await this.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(_id), walletAccounts: { $in: [walletAccount] } }, {
            $push: {
                transactions: {
                    $each: [
                        {
                            event: {
                                endDate: event.endDate,
                                event: event.id,
                                name: event.name,
                                posterURL: event.posterURL,
                                startDate: event.startDate,
                                location: event.location,
                                venue: event.venue,
                            },
                            ticketType: boughTicket
                        }
                    ],
                    $slice: -1
                }
            },
        }, { new: true });

        return {
            transaction: (user?.transactions[0] as ITransactions),
            user: (user as IUserDocument)
        };

    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }

}

export async function removeByID(this: mongoose.Model<IUser>, _id: string): Promise<void> {
    try {
        const result = await this.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })
        if (result.deletedCount === 0) {
            throw ValidationErrorFactory({
                msg: "User not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }
}

export async function update(this: mongoose.Model<IUser>, _id: string, newUser: IUserUpdateFrom, populatePath?: string | string[]): Promise<IUser | null> {

    try {
        var newDoc: any = {};
        if (newUser.password) {
            const newPassword = await (encryptPassword.bind({} as any))(newUser.password);
            newDoc = await this.findByIdAndUpdate(_id, { ...newUser, password: newPassword }, { new: true, overwrite: true });
        } else {
            newDoc = await this.findByIdAndUpdate(_id, newUser, { new: true, overwrite: true });
        }
        if (populatePath) await newDoc?.populate(populatePath)
        return newDoc;
    } catch (error) {
        throw error;
    }
}