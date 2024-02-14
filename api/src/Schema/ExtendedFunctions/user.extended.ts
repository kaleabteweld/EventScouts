import * as bcrypt from "bcrypt";
import { ValidationErrorFactory, errorFactory } from "../../Util/Factories";
import mongoose from "mongoose";
import { MakeValidator } from "../../Domains/Common";
import Joi from "joi";
import { isValidationError } from "../../Types/error"
import { IUser, TVerified, TVerifiedSupported, UserModel, verifiedEnum, verifiedSupportedEnum } from "../types/user.schema.types";

export async function encryptPassword(this: IUser, password?: string): Promise<string> {

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

export async function checkPassword(this: IUser, password: string): Promise<boolean> {

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
    const user = await this.findById(new mongoose.Types.ObjectId(_id));
    if (user == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Id",
            statusCode: 404,
            type: "Validation"
        }, "_id")
    }
    return user;

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