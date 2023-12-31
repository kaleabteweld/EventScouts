import { NextFunction, Request, Response } from "express";
import Jwt from 'jsonwebtoken'
import { TokenSecret } from ".";
import { TokenType, UserType } from "../Types";
import { errorResponse } from "../Types/error";


export const MakeErrorHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorMiddleWare(error: errorResponse, req: Request, res: Response, next: NextFunction): any {
    console.log("[-] Error Middleware", error);
    return res.status(error.statusCode ?? 400).send({ error });
};

export function JWTMiddleWare(req: any, res: any, next: NextFunction) {

    try {
        const tokenHeader = req.headers.authorization?.split('Bearer ')[1]
        if (tokenHeader === undefined || tokenHeader === null) throw Error("No Valid Token");

        const decoded = Jwt.decode(tokenHeader, { complete: true });
        if (decoded === null) throw Error("No Valid Token");

        const userType = (decoded?.payload as Jwt.JwtPayload).type;
        if (userType === undefined || userType === null) throw Error("No Valid Token");



        const typeSecret = TokenSecret(<UserType>userType, TokenType.accessToken);
        if (typeSecret === undefined) throw Error("No Env");

        const jwtDecoded = Jwt.verify(tokenHeader, typeSecret);

        req["userType"] = userType
        req[userType] = jwtDecoded
        next();

    } catch (error: any) {

        console.log("[-] JWTMiddleWare Error", error)
        const errorResponse: errorResponse = {
            msg: error.message ?? "No Valid Token",
            statusCode: 401,
            type: "token"
        }
        next(errorResponse);
    }
}

