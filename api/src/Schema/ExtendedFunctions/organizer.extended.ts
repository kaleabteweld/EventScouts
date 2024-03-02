import * as bcrypt from "bcrypt";
import Joi from "joi";
import { IOrganizer, IOrganizerModel, TVerified, TVerifiedSupported, verifiedEnum, verifiedSupportedEnum } from "../Types/organizer.schema.types";
import { ValidationErrorFactory, errorFactory } from "../../Util/Factories";
import { isValidationError } from "../../Types/error";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { BSONError } from 'bson';


export async function encryptPassword(this: IOrganizer, password?: string): Promise<string> {

    const saltRounds: number = Number.parseInt(process.env.saltRounds || "11");
    try {
        const hashPassword = await bcrypt.hash(password ?? this.password, saltRounds);
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

export async function checkPassword(this: IOrganizer, password: string): Promise<boolean> {

    try {
        const gate = await bcrypt.compare(password, this.password);
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

export async function getByEmail(this: mongoose.Model<IOrganizer>, email: string): Promise<mongoose.Document<unknown, {}, IOrganizer> & IOrganizer & { _id: mongoose.Types.ObjectId; } | null> {
    const organizer = await this.findOne({ email });
    if (organizer == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Email or Password",
            statusCode: 404,
            type: "Validation"
        }, "")
    }
    return organizer;
}

export async function getById(this: mongoose.Model<IOrganizer>, _id: string, populatePath: string | string[]): Promise<mongoose.Document<unknown, {}, IOrganizer> & IOrganizer & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const organizer = await this.findById(new mongoose.Types.ObjectId(_id)).populate(populatePath);
        if (organizer == null) {
            throw ValidationErrorFactory({
                msg: "Organizer not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return organizer;
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

export async function getByVerifiedKey(this: mongoose.Model<IOrganizer>, key: TVerifiedSupported, value: string): Promise<mongoose.Document<unknown, {}, IOrganizer> & IOrganizer & { _id: mongoose.Types.ObjectId; } | null> {

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
        else {
            throw ValidationErrorFactory({
                msg: "Invalid Key for Verification",
                statusCode: 404,
                type: "Validation"
            }, "key")
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

export async function applyVerify(this: IOrganizer, key: TVerified): Promise<IOrganizer> {
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

export function checkVerifiedBy(this: IOrganizer, key: TVerifiedSupported): boolean {
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

export async function getByWalletAccounts(this: mongoose.Model<IOrganizer>, walletAccounts: string[]): Promise<mongoose.Document<unknown, IOrganizerModel, IOrganizer> & IOrganizer & { _id: mongoose.Types.ObjectId; } | null> {

    const organizer = await this.findOne({
        walletAccounts: {
            $in: walletAccounts
        }
    });
    if (organizer == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Wallet Address",
            statusCode: 404,
            type: "Validation"
        }, "walletAccounts")
    }
    return organizer;
}

export async function addWalletAccount(this: IOrganizer, wallet: string): Promise<IOrganizer> {
    if (!this.walletAccounts.includes(wallet)) {
        this.walletAccounts.push(wallet);
        return await this.save();
    }
    return this;
}

export async function removeWalletAccount(this: IOrganizer, wallet: string): Promise<IOrganizer> {
    if (!this.walletAccounts.includes(wallet)) {
        throw ValidationErrorFactory({
            msg: "Invalid Wallet Address",
            statusCode: 404,
            type: "Validation"
        }, "wallet")
    }
    (this.walletAccounts as any).pull(wallet);
    return await this.save();
}