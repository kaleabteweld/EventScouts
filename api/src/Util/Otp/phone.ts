import { apiCall } from "..";
import { errorResponse } from "../../Types/error";


const baseUrl: string = "https://api.afromessage.com/api";

const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json;charset=UTF-8',
    'Authorization': 'Bearer ' + process.env.AFROMESSAGE_TOKEN
};

export async function getPhoneOtp(phoneNumber: string, otpLen: number, ttl: number = 0, t: number = 2,) {


    const data: any = {
        from: process.env.AFROMESSAGE_IDENTIFIER_ID,
        sender: process.env.AFROMESSAGE_SENDER_NAMES,
        to: phoneNumber,
        len: otpLen,
        t,
        ttl,
    }
    const params = new URLSearchParams(data).toString();
    var url = baseUrl + "/challenge" + "?" + params;


    try {
        const { code, verificationId } = await apiCall({ method: "GET", url, headers }, getOtpSanitizeResponse);
        return { code, verificationId }

    } catch (error: any) {
        console.log("[-] call Phone Otp error ", error);
        const _err: errorResponse = {
            msg: error.message ?? error.msg,
            statusCode: 500,
            type: "PhoneOtpApi"
        }
        throw _err;
    }

}

export async function verifyPhoneOTP(phoneNumber: string, otp: string, verificationId: string) {

    const data: any = {
        to: phoneNumber,
        code: otp,
        vc: verificationId,
    }
    const params = new URLSearchParams(data).toString();
    var url = baseUrl + "/verify" + "?" + params;


    try {
        return await apiCall({ method: "GET", url, headers }, verifyOTPSanitizeResponse);

    } catch (error: any) {
        console.log("[-] callPhoneOtp error ", error);
        const _err: errorResponse = {
            msg: error.message ?? error.msg,
            statusCode: 500,
            type: "PhoneOtpApi"
        }
        throw _err;
    }


}


function getOtpSanitizeResponse(data: any) {

    if (data == undefined) throw Error("Can't Reach Service");
    if (data["acknowledge"] == "error") throw Error(data["response"]['errors'][0]);


    const code: string = data["response"]["code"];
    const verificationId: string = data["response"]["verificationId"];

    return { code, verificationId }
}

function verifyOTPSanitizeResponse(data: any) {

    if (data == undefined) throw Error("Can't Reach Service");
    if (data["acknowledge"] == "error") throw Error(data["response"]['errors'][0]);

    const code: string = data["response"]["code"];
    const phone: string = data["response"]["phone"];

    return { code, phone }
}