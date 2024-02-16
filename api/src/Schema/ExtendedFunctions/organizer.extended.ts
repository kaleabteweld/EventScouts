import * as bcrypt from "bcrypt";
import Joi from "joi";
import { IOrganizer, TVerified, TVerifiedSupported, verifiedEnum, verifiedSupportedEnum } from "../Types/organizer.schema.types";
import { ValidationErrorFactory, errorFactory } from "../../Util/Factories";
import { isValidationError } from "../../Types/error";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";

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

export async function getById(this: mongoose.Model<IOrganizer>, _id: string): Promise<mongoose.Document<unknown, {}, IOrganizer> & IOrganizer & { _id: mongoose.Types.ObjectId; } | null> {
    const organizer = await this.findById(new mongoose.Types.ObjectId(_id));
    if (organizer == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Id",
            statusCode: 404,
            type: "Validation"
        }, "_id")
    }
    return organizer;

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