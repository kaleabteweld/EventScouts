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
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message       
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

privateOrganizerRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _Organizer: IOrganizer = req['organizer'];
        const key = req.params.key
        const Organizer = await OrganizerController.verifyUser(_Organizer, key);
        res.json(Organizer.body);
    }
));

privateOrganizerRouter.patch("/wallet/connect/:wallet", MakeErrorHandler(
    async (req: any, res: Response) => {
        const _Organizer: IOrganizer = req['organizer'];
        const wallet = req.params.wallet
        const Organizer = await OrganizerController.connectWallet(_Organizer, wallet);
        res.json(Organizer.body);
    }
));

privateOrganizerRouter.patch("/wallet/disconnect/:wallet", MakeErrorHandler(
    async (req: any, res: Response) => {
        const _Organizer: IOrganizer = req['organizer'];
        const wallet = req.params.wallet
        const Organizer = await OrganizerController.disconnectWallet(_Organizer, wallet);
        res.json(Organizer.body);
    }
));

privateOrganizerRouter.patch("/update", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await OrganizerController.update(req.body, _eventOrganizer));
    }
));

publicOrganizerRouter.use("/organizer", publicOrganizerRouter);
privateOrganizerRouter.use("/organizer", privateOrganizerRouter);


export { publicOrganizerRouter, privateOrganizerRouter } 