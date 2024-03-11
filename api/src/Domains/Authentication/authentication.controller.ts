import { getPhoneOtp, sendEmailOtp, verifyEmailOtp, verifyPhoneOTP } from "../../Util/Otp";
import { IEmailOTPResponseType, IEmailOTPVerifyResponseType, IPhoneOTPResponseType, IPhoneOTPVerifyResponseType } from "../Common/types";

export class AuthenticationController {
    static async generateEmailOTP(email: string): Promise<IEmailOTPResponseType> {
        return { email: await sendEmailOtp(email) };
    }

    static async verifyEmailOTP(emailAddress: string, otp: string): Promise<IEmailOTPVerifyResponseType> {
        return await verifyEmailOtp(emailAddress, otp);
    }

    static async generatePhoneOTP(phoneNumber: string): Promise<IPhoneOTPResponseType> {
        const { verificationId } = await getPhoneOtp(phoneNumber, 6);
        return { phone: phoneNumber, verificationId };
    }
    static async verifyOTP(phoneNumber: string, otp: string, verificationId: string): Promise<IPhoneOTPVerifyResponseType> {
        const { code, phone } = await verifyPhoneOTP(phoneNumber, otp, verificationId);
        return { code, phone, status: true }
    }
}