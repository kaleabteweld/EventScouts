
import Jwt from 'jsonwebtoken'
import Cache from "../../Util/cache";
import { Response } from "express";
import { ValidationErrorFactory } from "../../Util/Factories";
import { TokenSecret } from "../../Util";
import { TokenType, UserType } from "../../Types";
import Joi from "joi";

export async function MakeTokens(user: any, userType: UserType) {

    try {
        const tokenKey = TokenSecret(userType, TokenType.accessToken);
        const refreshKey = TokenSecret(userType, TokenType.refreshToken);
        if (tokenKey === undefined || refreshKey === undefined) throw Error("No Env");

        const accessToken = Jwt.sign({ ...user, type: userType }, tokenKey, { expiresIn: "2h", });
        const refreshToken = Jwt.sign({ ...user }, refreshKey, { expiresIn: "2w", });

        await Cache.run(() => Cache.removeRefreshToken(user.id));

        const ttl: number = (Jwt.decode(refreshToken) as Jwt.JwtPayload).exp ?? 145152000;

        await Cache.run(() => Cache.addRefreshToken(refreshToken, user.id, ttl));

        return { accessToken, refreshToken }
    } catch (error: any) {
        throw {
            msg: error.message ?? "No Valid Token",
            statusCode: 400,
            type: "token"
        }
    }

}

export async function verifyAccessToken<T>(token: string, userType: UserType): Promise<T> {

    try {
        const decoded = Jwt.decode(token, { complete: true });
        if (decoded === null) throw Error("No Valid Token");
        if (!Object.keys((decoded?.payload as Jwt.JwtPayload)).includes("id")) throw Error("No Valid Token");

        const userId = (decoded?.payload as Jwt.JwtPayload).id;
        if (userId == undefined) throw Error("No Valid Token");

        const tokenKey = TokenSecret(userType, TokenType.accessToken);
        if (tokenKey === undefined) throw Error("No Env");

        const jwtDecoded = Jwt.verify(token, tokenKey ?? "");
        return jwtDecoded as T;

    } catch (error: any) {
        console.log("[-] verifyAccessToken error", error);
        throw {
            msg: error.message ?? "No Valid Token",
            statusCode: 400,
            type: "token"
        }
    }


}

export async function verifyRefreshToken<T>(_refreshToken: string, usetType: UserType): Promise<T> {
    try {

        const decoded = Jwt.decode(_refreshToken, { complete: true });
        if (decoded === null) throw Error("No Valid Token");
        if (!Object.keys((decoded?.payload as Jwt.JwtPayload)).includes("id")) throw Error("No Valid Token");

        const userId = (decoded?.payload as Jwt.JwtPayload).id;
        if (userId == undefined) throw Error("No Valid Token");

        const refreshToken = await Cache.run(() => Cache.getRefreshToken(userId));
        if ((refreshToken === undefined || refreshToken === null) || _refreshToken !== refreshToken) throw Error("No Valid Token [Cache]")

        const refreshKey = TokenSecret(usetType, TokenType.refreshToken);
        if (refreshKey === undefined) throw Error("No Env");

        const user = await Jwt.verify(refreshToken, refreshKey);
        return user as T;
    } catch (error: any) {
        throw {
            msg: error.message ?? "No Valid Token",
            statusCode: 400,
            type: "token"
        }
    }

}

export function makeAuthHeaders(res: Response, headers: { accessToken: string, refreshToken: string }) {
    res.header("Authorization", "Bearer " + headers.accessToken);
    res.header("RefreshToken", "Bearer " + headers.refreshToken);
}

export async function MakeValidator<T>(validator: Joi.ObjectSchema<T>, obj: T, optional?: Joi.ValidationOptions) {
    const validationError: any = await validator.validate(obj, optional);
    if (validationError.error != null) {

        const _error = ValidationErrorFactory({
            msg: validationError.error?.message,
            statusCode: 400,
            type: "validation",
        }, cleanAttr(validationError.error?.message))
        throw _error;
    } else {
        return validationError.value;
    }
}

export function cleanAttr(errorMsg: string): string {
    var attr: string = errorMsg.split(" ")[0];
    attr = attr.replace('\"', "");
    attr = attr.replace('\"', "");
    return attr;
}