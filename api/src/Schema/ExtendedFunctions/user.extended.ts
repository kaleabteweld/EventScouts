import * as bcrypt from "bcrypt";
import { ValidationErrorFactory, errorFactory } from "../../Util/Factories";
import { IUser, UserModel } from "../user.schema";
import mongoose from "mongoose";
import { MakeValidator } from "../../Domains/Common";
import Joi from "joi";
import { isValidationError } from "../../Types/error"

export async function encryptPassword(password: string): Promise<string> {

    const saltRounds: number = Number.parseInt(process.env.saltRounds || "11");
    try {
        return await bcrypt.hash(password, saltRounds);
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
    const user = await this.findOne({ _id });
    if (user == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Id",
            statusCode: 404,
            type: "Validation"
        }, "_id")
    }
    return user;

}