import express, { Request, Response } from "express";
import { MakeErrorHandler } from "../../Util/middlewares";
import OrganizerController from "./controller";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


const publicOrganizerRouter = express.Router();
const privateOrganizerRouter = express.Router();

privateOrganizerRouter.patch("/VerifyUser/:key", MakeErrorHandler(
    async (req: any, res: Response) => {

        const _Organizer: IOrganizer = req['organizer'];
        const key = req.params.key

        console.log({ key, _Organizer })
        const Organizer = await OrganizerController.verifyUser(_Organizer, key);
        res.json(Organizer.body);
    }
));

publicOrganizerRouter.use("/organizer", publicOrganizerRouter);
privateOrganizerRouter.use("/organizer", privateOrganizerRouter);


export { publicOrganizerRouter, privateOrganizerRouter } 