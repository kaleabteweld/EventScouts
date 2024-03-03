import axios from "axios";
import { TokenType, UserType } from "../Types";
import { errorResponse } from "../Types/error";
import crypto from 'crypto';
import { ValidationErrorFactory } from "./Factories";

export function TokenSecret(userType: UserType, tokenType: TokenType) {
    if (tokenType == TokenType.accessToken) {
        return process.env[userType.toUpperCase() + "_SECRET"];
    }
    return process.env[userType.toUpperCase() + "_REfRESH_SECRET"];
}
export async function apiCall(options: { url: string, method: string, data?: any, headers?: any }, onSuccess: Function, onError?: Function) {


    try {
        const response: any = await axios(options);
        const data = response["data"];

        if (response == undefined || data == undefined) throw Error("Empty Response");
        return onSuccess(data);

    } catch (error: any) {
        console.log("[-] Axios error ", error);
        if (onError != undefined) onError(error);

        const _err: errorResponse = {
            msg: error.message,
            statusCode: 500,
            type: "axios"
        }
        throw _err;
    }

}

export function copyObjectWithOnlyKeys(obj: any, keys: string[]) {
    return keys.reduce((acc: any, key) => {
        if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});
}

export function copyObjectWithout(obj: any, keysToRemove: string[]) {
    const keysToKeep = Object.keys(obj).filter(key => !keysToRemove.includes(key));
    return copyObjectWithOnlyKeys(obj, keysToKeep);
}

export function encryptId(id: string): string {
    const iv = crypto.createHash('sha256').update('constIV!').digest('hex').slice(0, 16);
    const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        crypto.scryptSync(process.env.CIPHERIV_SECRET_KEY ?? "koloHere", 'GfG', 32),
        iv);
    let encryptedData = cipher.update(id, 'utf8', 'base64');
    encryptedData += cipher.final('base64');
    return encodeURIComponent(encryptedData);
}
export function decryptId(id: string): string {
    const iv = crypto.createHash('sha256').update('constIV!').digest('hex').slice(0, 16);
    const decodedData = decodeURIComponent(id);
    const decipher = crypto.createDecipheriv('aes-256-cbc',
        crypto.scryptSync(process.env.CIPHERIV_SECRET_KEY ?? "koloHere", 'GfG', 32),
        iv);
    let decryptedData = decipher.update(decodedData, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
}
export function isEncrypted(id: string): boolean {
    const iv = crypto.createHash('sha256').update('constIV!').digest('hex').slice(0, 16);
    try {
        // Attempt to decrypt the data
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            crypto.scryptSync(process.env.CIPHERIV_SECRET_KEY ?? "koloHere", 'GfG', 32),
            iv);
        let decryptedData = decipher.update(id, 'base64', 'utf8');
        decryptedData += decipher.final('utf8');
        // If decryption succeeds without errors, consider it as encrypted
        return true;
    } catch (error) {
        // If an error occurs during decryption, the data is likely not encrypted
        return false;
    }
}
export function getEncryptedIdFromUrl(url: string): String {
    const lastIndex = url.lastIndexOf('/');
    const lastSubstring = url.substring(lastIndex + 1);
    if (lastSubstring == undefined || lastSubstring.length == 0) {
        throw ValidationErrorFactory({
            msg: 'Invalid URL',
            statusCode: 404,
            type: 'Validation',
        }, "id");
    }
    return lastSubstring;
}