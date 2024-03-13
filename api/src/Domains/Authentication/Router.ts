import express, { Request, Response } from "express";
import { UserType } from "../../Types";
import { MakeErrorHandler } from "../../Util/middlewares";
import { UserController } from "../User";
import { AuthenticationController } from "./authentication.controller";
import { makeAuthHeaders } from "../Common/utils";
import { OrganizerController } from "../Organizer";

const publicAuthenticationRouter = express.Router();
const privateAuthenticationRouter = express.Router();

function ClassMap(userType: string): UserController | OrganizerController {
    const classmap = new Map<string, any>();
    classmap.set(UserType.user, UserController);
    classmap.set(UserType.organizer, OrganizerController);
    return classmap.get(userType);
}

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints for Authentication operations
 */

/**
 * @swagger
 * /public/authentication/organizer/signUp:
 *   post:
 *     summary: Sign up a an organizer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/organizerSignUpFrom'
 *     responses:
 *       200:
 *         description: Successful sign-up organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during sign-up process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

/**
 * @swagger
 * /public/authentication/user/signUp:
 *   post:
 *     summary: Sign up a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userSignUpJsdocSchema'
 *     responses:
 *       200:
 *         description: Successful sign-up of the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during sign-up process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

publicAuthenticationRouter.post('/:userType/signUp', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const controller: any = ClassMap(req.params.userType);
        const user = await controller.signUp(req.body);

        makeAuthHeaders(res, user.header)
        res.json(user.body);
    }
));

/**
 * @swagger
 * /public/authentication/organizer/logIn:
 *   post:
 *     summary: Log In a an organizer
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/organizerLogInFrom'
 *     responses:
 *       200:
 *         description: Successful Log in organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during Log in process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

/**
 * @swagger
 * /public/authentication/user/logIn:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userLoginJsdocSchema'
 *     responses:
 *       200:
 *         description: Successful user log-in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during log-in process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

publicAuthenticationRouter.post('/:userType/logIn', MakeErrorHandler(
    async (req: Request, res: Response) => {

        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        console.log({ userType: req.params.userType, controller })
        const user = await controller.logIn(req.body);

        makeAuthHeaders(res, user.header)
        res.json(user.body)
    }
));

/**
 * @swagger
 * /public/authentication/organizer/logIn/wallet:
 *   post:
 *     summary: Log In a an organizer Wth Wallet
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/organizerWalletLogInFrom'
 *     responses:
 *       200:
 *         description: Successful Log in With Wallet organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during Log in With Wallet process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

/**
 * @swagger
 * /public/authentication/user/logIn/wallet:
 *   post:
 *     summary: Log In a user with Wallet
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/userWalletLogInFrom'
 *     responses:
 *       200:
 *         description: Successful log-in with Wallet for user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during log-in with Wallet process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

publicAuthenticationRouter.post('/:userType/logIn/wallet', MakeErrorHandler(
    async (req: Request, res: Response) => {

        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        const user = await controller.logInWithWallet(req.body);

        makeAuthHeaders(res, user.header)
        res.json(user.body)
    }
));

/**
 * @swagger
 * /public/authentication/organizer/refreshToken:
 *   get:
 *     summary: Refresh Token for an organizer
 *     tags: [Authentication]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful refreshToken organizer
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during refreshToken process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

/**
 * @swagger
 * /public/authentication/user/refreshToken:
 *   get:
 *     summary: Refresh Token for an User
 *     tags: [Authentication]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful refreshToken User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *         headers:
 *           Authorization:
 *             description: JWT token for authentication
 *             schema:
 *               type: string
 *       400:
 *         description: Error occurred during refreshToken process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicAuthenticationRouter.get('/:userType/refreshToken', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const controller: any = ClassMap(req.params.userType);
        const token = req.headers.authorization?.split('Bearer ')[1] ?? "";
        const user = await controller.refreshToken(token);

        makeAuthHeaders(res, user.header)
        res.json({})
    }
));


publicAuthenticationRouter.get('/:userType/refreshToken', MakeErrorHandler(
    async (req: Request, res: Response) => {

        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);
        const token = req.headers.authorization?.split('Bearer ')[1] ?? "";
        const user = await controller.refreshToken(token);

        makeAuthHeaders(res, user.header)
        res.json({})
    }
));

/**
 * @swagger
 * /public/authentication/organizer/forgotPassword/{key}/{Value}/{newPassword}:
 *   patch:
 *     summary: Forgot Password for an organizer
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The key used for password recovery
 *       - in: path
 *         name: Value
 *         required: true
 *         schema:
 *           type: string
 *         description: The value associated with the key (e.g., email)
 *       - in: path
 *         name: newPassword
 *         required: true
 *         schema:
 *           type: string
 *         description: The new password for the user
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Error occurred during password reset process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

/**
 * @swagger
 * /public/authentication/user/forgotPassword/{key}/{value}/{newPassword}:
 *   patch:
 *     summary: Reset password for a user
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: Key for identifying the user (e.g., email, username)
 *         schema:
 *           type: string
 *       - in: path
 *         name: value
 *         required: true
 *         description: Value corresponding to the key
 *         schema:
 *           type: string
 *       - in: path
 *         name: newPassword
 *         required: true
 *         description: New password to set for the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Error occurred during password reset process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */

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

/**
 * @swagger
 * /private/authentication/organizer/logOut:
 *   delete:
 *     summary: Log out the organizer
 *     tags: [Authentication]
 *     security:
 *        - bearerAuth: []
 *     responses:
 *       200:
 *         description: organizer logged out successfully
 *       400:
 *         description: Error occurred during logout process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */

/**
 * @swagger
 * /private/authentication/user/logOut:
 *   delete:
 *     summary: Log out a user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Error occurred during logout process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'      
 *       401:
 *         description: No Valid Token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */

privateAuthenticationRouter.delete('/:userType/logOut', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const token = req.headers.authorization?.split('Bearer ')[1] ?? "";
        // const controller: any = getControllerFactory(req.params.userType);
        const controller: any = ClassMap(req.params.userType);

        const user = await controller.logOut(token);

        res.json({});
    }
));

/**
 * @swagger
 * /public/authentication/emailOtp/{email}:
 *   get:
 *     summary: Generate OTP for email verification
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email address for OTP generation
 *     responses:
 *       200:
 *         description: Email OTP generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: Email address for which OTP is generated
 *                 status:
 *                   type: boolean
 *                   description: Status of OTP generation (true for success)
 *       400:
 *         description: Error occurred during OTP generation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
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

/**
 * @swagger
 * /public/authentication/emailOtp/verify/{email}/{otp}:
 *   get:
 *     summary: Verify OTP for email verification
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email address for which OTP is generated
 *       - in: path
 *         name: otp
 *         required: true
 *         schema:
 *           type: string
 *         description: OTP to be verified
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: Email address for which OTP is generated
 *                 code:
 *                   type: string
 *                   description: OTP code that is generated
 *                 status:
 *                   type: boolean
 *                   description: Status of OTP generation (true for success)
 *       400:
 *         description: Error occurred during OTP verification process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
publicAuthenticationRouter.get('/emailOtp/verify/:email/:otp', MakeErrorHandler(
    async (req: Request, res: Response) => {

        const email: string = req.params.email;
        const otp: string = req.params.otp;

        res.json(await AuthenticationController.verifyEmailOTP(email, otp))

    }
));

/**
 * @swagger
 * /public/authentication/otp/{phoneNumber}:
 *   get:
 *     summary: Generate OTP for phone number verification
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number for which OTP is to be generated
 *     responses:
 *       200:
 *         description: OTP generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 phoneNumber:
 *                   type: string
 *                   description: Phone number for which OTP is generated
 *                 verificationId:
 *                   type: string
 *                   description: Generated OTP verification Id
 *       400:
 *         description: Error occurred during OTP generation process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
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

/**
 * @swagger
 * /public/authentication/otp/verify/{phoneNumber}/{otp}/{verificationId}:
 *   get:
 *     summary: Verify OTP for phone number verification
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number for which OTP is generated
 *       - in: path
 *         name: otp
 *         required: true
 *         schema:
 *           type: string
 *         description: OTP to be verified
 *       - in: path
 *         name: verificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification ID received during OTP generation
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                   description: Verification code
 *                 phone:
 *                   type: string
 *                   description: Phone number for which OTP is verified
 *                 status:
 *                   type: boolean
 *                   description: Verification status (true/false)
 *       400:
 *         description: Error occurred during OTP verification process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 */
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