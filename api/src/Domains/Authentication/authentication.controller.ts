import { getPhoneOtp, sendEmailOtp, verifyEmailOtp, verifyPhoneOTP } from "../../Util/Otp";
import { Get, Route, Controller } from "tsoa";
import { IEmailOTPResponseType, IEmailOTPVerifyResponseType, IPhoneOTPResponseType, IPhoneOTPVerifyResponseType } from "../Common/types";

@Route("authentication")
export class AuthenticationController extends Controller {
    @Get("/emailOtp/{email}")
    static async generateEmailOTP(email: string): Promise<IEmailOTPResponseType> {
        return { email: await sendEmailOtp(email) };
    }

    @Get("/emailOtp/verify/{emailAddress}/{otp}")
    static async verifyEmailOTP(emailAddress: string, otp: string): Promise<IEmailOTPVerifyResponseType> {
        return await verifyEmailOtp(emailAddress, otp);
    }

    @Get("/otp/{phoneNumber}")
    static async generatePhoneOTP(phoneNumber: string): Promise<IPhoneOTPResponseType> {
        const { verificationId } = await getPhoneOtp(phoneNumber, 6);
        return { phone: phoneNumber, verificationId };
    }

    @Get("/otp/verify/{phoneNumber}/{otp}/{verificationId}")
    static async verifyOTP(phoneNumber: string, otp: string, verificationId: string): Promise<IPhoneOTPVerifyResponseType> {
        const { code, phone } = await verifyPhoneOTP(phoneNumber, otp, verificationId);
        return { code, phone, status: true }
    }
}