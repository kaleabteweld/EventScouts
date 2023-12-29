import * as bcrypt from "bcrypt";
import { errorFactory } from "../../Util/Factories";
import { IUser } from "../user.schema";
import mongoose from "mongoose";
import { MakeValidator } from "../../Domains/Common";
import { newUserSchema } from "../../Domains/User/validation";
import Joi from "joi";
import { IUserSignUpFrom } from "../../Domains/User/types";

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

export async function checkPassword(password: string, passwordHash: string): Promise<boolean> {

    try {
        return await bcrypt.compare(password, passwordHash);
    } catch (error) {
        console.log("[-] Bcrypt Error", error);
        throw errorFactory({
            msg: "Bcrypt Error",
            statusCode: 418,
            type: "system"
        });
    }
}

export function validator(userInput: IUserSignUpFrom, schema: Joi.ObjectSchema<IUserSignUpFrom> = newUserSchema) {
    return MakeValidator<IUserSignUpFrom>(schema, userInput);

}