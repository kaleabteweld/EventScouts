import express, { Request, Response } from "express";
import { MakeErrorHandler } from "../../Util/middlewares";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import EventController from "./controller";


const publicEventRouter = express.Router();
const privateEventRouter = express.Router();

privateEventRouter.post("/", MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.createEvent(req.body, _eventOrganizer));
    }
));


publicEventRouter.use("/event", publicEventRouter);
privateEventRouter.use("/event", privateEventRouter);


export { publicEventRouter, privateEventRouter } 