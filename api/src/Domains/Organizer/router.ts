import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import OrganizerController from "./controller";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


const publicOrganizerRouter = express.Router();
const privateOrganizerRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Organizer
 *   description: Endpoints for organizer operations
 */

/**
 * @swagger
 * /private/organizer/:
 *   get:
 *     summary: Get organizer by ID
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: [] 
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Error occurred
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
privateOrganizerRouter.get("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _organizer: IOrganizer = req['organizer'];
        res.json(await OrganizerController.getById(_organizer));
    }
));

/**
 * @swagger
 * /private/organizer/VerifyUser/{key}:
 *   patch:
 *     summary: Verify user by key
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Verification key
 *     responses:
 *       200:
 *         description: User verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Error occurred during sign-up process
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/validationError'
 *       401:
 *         description: No valid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NoValidToken'
 */
privateOrganizerRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _Organizer: IOrganizer = req['organizer'];
        const key = req.params.key
        const Organizer = await OrganizerController.verifyUser(_Organizer, key);
        res.json(Organizer.body);
    }
));

/**
 * @swagger
 * /private/organizer/wallet/connect/{wallet}:
 *   patch:
 *     summary: Connect wallet to organizer account
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Error occurred
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
privateOrganizerRouter.patch("/wallet/connect/:wallet", MakeErrorHandler(
    async (req: any, res: Response) => {
        const _Organizer: IOrganizer = req['organizer'];
        const wallet = req.params.wallet
        const Organizer = await OrganizerController.connectWallet(_Organizer, wallet);
        res.json(Organizer.body);
    }
));

/**
 * @swagger
 * /private/organizer/wallet/disconnect/{wallet}:
 *   patch:
 *     summary: Disconnect wallet from organizer account
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Error occurred
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
privateOrganizerRouter.patch("/wallet/disconnect/:wallet", MakeErrorHandler(
    async (req: any, res: Response) => {
        const _Organizer: IOrganizer = req['organizer'];
        const wallet = req.params.wallet
        const Organizer = await OrganizerController.disconnectWallet(_Organizer, wallet);
        res.json(Organizer.body);
    }
));

/**
 * @swagger
 * /private/organizer/update:
 *   patch:
 *     summary: Update organizer information
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              $ref: '#/components/schemas/organizerUpdateFrom'
 *     responses:
 *       200:
 *         description: Organizer information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organizer'
 *       400:
 *         description: Error occurred
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
privateOrganizerRouter.patch("/update", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await OrganizerController.update(req.body, _eventOrganizer));
    }
));

publicOrganizerRouter.use("/organizer", publicOrganizerRouter);
privateOrganizerRouter.use("/organizer", privateOrganizerRouter);


export { publicOrganizerRouter, privateOrganizerRouter } 