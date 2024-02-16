import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import EventController from "./controller";


const publicEventRouter = express.Router();
const privateEventRouter = express.Router();

publicEventRouter.get("/list/:skip/:limit", MakeErrorHandler(
    async (req: any, res: Response) => {
        const skip = Number.parseInt(req.params.skip);
        const limit = Number.parseInt(req.params.limit);
        res.json(await EventController.list({ skip, limit }));
    }
));

privateEventRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.createEvent(req.body, _eventOrganizer));
    }
));



publicEventRouter.use("/event", publicEventRouter);
privateEventRouter.use("/event", privateEventRouter);


export { publicEventRouter, privateEventRouter } 