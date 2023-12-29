import express, { Request, Response } from "express";
import { UserType } from "../../Types";
import { MakeErrorHandler } from "../../Util/middlewares";
// import { makeAuthHeaders } from "../Common/utils";
// import { OrganizerController } from "../Organizer";
import { UserController } from "../User";
import { AuthenticationController } from "./authentication.controller";
import { makeAuthHeaders } from "../Common/utils";

const publicAuthenticationRouter = express.Router();
const privateAuthenticationRouter = express.Router();

function ClassMap(userType: string): UserController {
    const classmap = new Map<string, any>();
    classmap.set(UserType.user, UserController);
    // classmap.set(UserType.organizer, OrganizerController);
    return classmap.get(userType);
}



publicAuthenticationRouter.post('/:userType/signUp', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const controller: any = ClassMap(req.params.userType);
        const user = await controller.signUp(req.body);

        makeAuthHeaders(res, user.header)
        res.json(user.body);
    }
));

publicAuthenticationRouter.post('/:userType/logIn', MakeErrorHandler(
    async (req: Request, res: Response) => {

        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        const user = await controller.logIn(req.body);

        // makeAuthHeaders(res, user.header)
        res.json(user)
    }
));

publicAuthenticationRouter.get('/:userType/refreshToken', MakeErrorHandler(
    async (req: Request, res: Response) => {

        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        const token = req.headers.authorization?.split('Bearer ')[1] ?? "";
        const user = await controller.refreshToken(token);

        // makeAuthHeaders(res, user.header)
        res.json(user)
    }
));

publicAuthenticationRouter.patch('/:userType/forgotPassword/:key/:Value/:newPassword', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const key = req.params.key;
        const value = req.params.Value
        const newPassword = req.params.newPassword;
        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        const user = await controller.forgotPassword(key, value, newPassword);

        res.json({});
    }
));

privateAuthenticationRouter.delete('/:userType/logOut', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const token = req.headers.authorization?.split('Bearer ')[1] ?? "";
        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);

        const user = await controller.logOut(token);

        res.json({});
    }
));


publicAuthenticationRouter.get('/emailOtp/:email', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const email: string = req.params.email;
        const OTP = await AuthenticationController.generateEmailOTP(email);
        res.json({
            email,
            status: true
        })
    }
));

publicAuthenticationRouter.get('/emailOtp/verify/:email/:otp', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const email: string = req.params.email;
        const otp: string = req.params.otp;

        res.json(await AuthenticationController.verifyEmailOTP(email, otp))

    }
));

publicAuthenticationRouter.get('/otp/:phoneNumber', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const phoneNumber: string = req.params.phoneNumber;
        const OTP = await AuthenticationController.generatePhoneOTP(phoneNumber);
        res.json({
            phoneNumber,
            ...OTP
        })

    }
));

publicAuthenticationRouter.get('/otp/verify/:phoneNumber/:otp/:verificationId', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const phoneNumber: string = req.params.phoneNumber;
        const otp: string = req.params.otp;
        const verificationId: string = req.params.verificationId;

        res.json(await AuthenticationController.verifyOTP(phoneNumber, otp, verificationId))

    }
));


publicAuthenticationRouter.use("/authentication", publicAuthenticationRouter);
privateAuthenticationRouter.use("/authentication", privateAuthenticationRouter);

export { publicAuthenticationRouter, privateAuthenticationRouter } 