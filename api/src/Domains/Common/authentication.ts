import { UserType } from "../../Types";
import { MakeValidator } from ".";
import Joi from "joi";
// import { checkUserCredentials, logout, MakeTokens, passwordHash, verifyRefreshToken } from "./utils";
import mongoose from "mongoose";

export default class CommonAuthenticationController {


    // static async forgotPassword<T extends IBaseUser, FromT, TEnum>(key: string, value: string, password: string, options: {
    //     validator: Joi.ObjectSchema<FromT>,
    //     prismaClient: any
    //     checkVerifiedBy: (user: T, key: TEnum) => any
    // }) {

    //     var newPassword = await MakeValidator<FromT>(options.validator, { password } as any);

    //     const result = await DBCall(() => options.prismaClient.findUnique({ where: { [key.toLowerCase()]: value } }), () => "User Not Found");

    //     options.checkVerifiedBy(result, <TEnum>key);

    //     const _passwordHash: string = await passwordHash(newPassword.password);

    //     const updateResult = await DBCall(() => options.prismaClient.update({ where: { id: result.id }, data: { password: _passwordHash } }), () => "User Not Found");

    //     return { body: updateResult }
    // }

}