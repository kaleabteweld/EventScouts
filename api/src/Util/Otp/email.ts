import nodemailer from "nodemailer";
import otpGenerator from "otp-generator";
import { errorResponse } from "../../Types/error";
import Cache from "../../Util/cache";

let transporter = nodemailer.createTransport({
    host: "mail.sweaven.dev",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "auth@sweaven.dev", // generated ethereal user
        pass: "]_kti~_ImkAJ", // generated ethereal password
    },
});

export async function sendEmailOtp(email: string) {
    email = email.toLowerCase();
    const generatedCode: string = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        specialChars: false,
        upperCaseAlphabets: false
    });
    try {

        await transporter.sendMail({
            from: '"ticket-master-authentication 👻" <auth@sweaven.dev', // sender address
            to: `${email}`,
            subject: `${generatedCode}`,
            html: emailHtml(generatedCode),
        });
        await Cache.run(() => Cache.addEmailOtp(email, generatedCode, 3600));
        return generatedCode;

    } catch (error: any) {
        console.log("[-] sendOtpEmail error ", error);
        const _err: errorResponse = {
            msg: error.message ?? "Could not connect to Email service",
            statusCode: 500,
            type: "EmailOtp"
        }
        throw _err;
    }
}

export async function verifyEmailOtp(email: string, otp: string) {
    try {
        email = email.toLowerCase();
        const fetchedOTP = await Cache.run(() => Cache.getEmailOtp(email));
        if (fetchedOTP == undefined) throw Error("E-mail OTP cannot be found in database");

        if (fetchedOTP === otp.toString()) {
            await Cache.run(() => Cache.removeEmailOtp(email));
            return { email, code: otp, status: true }
        }
        throw Error("Email OTP verification failed")

    } catch (error: any) {
        console.log("[-] verifyEmailOtp error ", error);
        const _err: errorResponse = {
            msg: error.message ?? "Could not connect to Email service",
            statusCode: 500,
            type: "EmailOtp"
        }
        throw _err;
    }

}

function emailHtml(generatedCode: string) {
    return `<tbody>\n
    <tr style=\"height:318px\">\n
    <td style=\"font-family:Verdana,sans-serif;font-size:14px;vertical-align:top;height:318px\">\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">Hi,</p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">&nbsp;</p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">Here is a temporary security code for your <span class=\"il\">Ticket</span> Account. It can only be used once within the next <strong><span>4</span></strong> minutes, after which it will expire:<span> </span><span></span></p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\"><strong><span>${generatedCode}</span></strong></p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">&nbsp;</p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">Did you receive this email without having an active request from <span class=\"il\">Ticket</span> to enter a verification code? If so, the security of your <span class=\"il\">Ticket</span> account may be compromised. Please <a style=\"color:#3498db;text-decoration:underline\" href=\"https://tracking.Ticket.com/CL0/https:%2F%2Faccount.Ticket.com%2Fen-US%2Fsecurity-settings/1/010001841faef37d-c20488a4-b30e-4fa4-9e7f-606b667d8f92-000000/ihKv13KNrvfs8QMB_KmMN4Yx57IuCzuePTLiiSpcSmA=272\" target=\"_blank\" data-saferedirecturl=\"https://www.google.com/url?q=https://tracking.Ticket.com/CL0/https:%252F%252Faccount.Ticket.com%252Fen-US%252Fsecurity-settings/1/010001841faef37d-c20488a4-b30e-4fa4-9e7f-606b667d8f92-000000/ihKv13KNrvfs8QMB_KmMN4Yx57IuCzuePTLiiSpcSmA%3D272&amp;source=gmail&amp;ust=1667734588528000&amp;usg=AOvVaw2_GXIa0jxG0yiPN_CQf2W0\">change your password</a>&nbsp;as soon as possible.</p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\">&nbsp;</p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\"><span>Sincerely,</span></p>\n
    <p style=\"margin-bottom:15px;list-style-type:disc\"><span>Your <span class=\"il\">Ticket</span> Team</span></p>\n
    </td>\n
    </tr>\n
    </tbody>`
}