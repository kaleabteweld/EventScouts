import { UserType } from "../../Types";
import { MakeValidator } from ".";
import Joi from "joi";
// import { checkUserCredentials, logout, MakeTokens, passwordHash, verifyRefreshToken } from "./utils";
import mongoose from "mongoose";

export default class CommonAuthenticationController {

    // static async signUp<T>(user: T, options: {
    //     validator: Joi.ObjectSchema<T>
    //     model: mongoose.Model<T>
    //     userType: UserType
    // }) {

    //     var _user: any = await MakeValidator<T>(options.validator, user);

    //     const _passwordHash: string = await passwordHash((_user as any).password);
    //     (_user as any).password = _passwordHash;

    //     const result = await options.model.create(_user);
    //     result.save();
    //     console.log({ result });

    //     const { accessToken, refreshToken } = await MakeTokens(result, options.userType);

    //     return { body: result, header: { accessToken, refreshToken } }
    // }

    // static async logIn<T extends IBaseUser, fromT>(from: fromT, options: {
    //     validator: Joi.ObjectSchema<fromT>,
    //     prismaClient: any,
    //     userType: UserType
    // }) {

    //     var _from: fromT = await MakeValidator<fromT>(options.validator, from);

    //     const user: T = await DBCall(() => options.prismaClient.findUnique({ where: { email: (_from as any).email } }), () => "User Not Found");

    //     const _user = await checkUserCredentials(_from, user);
    //     _user.password = "";

    //     const { accessToken, refreshToken } = await MakeTokens(_user, options.userType);

    //     return { body: _user, header: { accessToken, refreshToken } }

    // }

    // static async refreshToken<T extends IBaseUser>(_refreshToken: string, options: {
    //     userType: UserType,
    //     prismaClient: any,
    // }) {


    //     const user = await verifyRefreshToken<T>(_refreshToken, options.userType);

    //     const result = await DBCall(() => options.prismaClient.findUnique({ where: { id: user.id } }));
    //     result.password = "";

    //     const { accessToken, refreshToken } = await MakeTokens(result, options.userType);

    //     return { body: {}, header: { accessToken, refreshToken } }

    // }

    // static async logOut<T extends IBaseUser>(token: string, options: {
    //     userType: UserType,
    // }) {

    //     return await logout<T>(token, options.userType);
    // }

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