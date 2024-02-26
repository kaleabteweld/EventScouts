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

publicEventRouter.post("/search/:page", MakeErrorHandler(
    async (req: any, res: Response) => {
        const page = Number.parseInt(req.params.page);
        res.json(await EventController.search(req.body, page));
    }
));

publicEventRouter.get("/byId/:id", MakeErrorHandler(
    async (req: Request, res: Response) => res.json(await EventController.getById(req.params.id))
));

privateEventRouter.post("/", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.createEvent(req.body, _eventOrganizer));
    }
));

privateEventRouter.delete("/remove/:eventId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {

        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.removeById(req.params.eventId, _eventOrganizer));
    }
));

privateEventRouter.patch("/update/:eventId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _eventOrganizer: IOrganizer = req['organizer'];
        res.json(await EventController.update(req.body, req.params.eventId, _eventOrganizer));
    }
));



publicEventRouter.use("/event", publicEventRouter);
privateEventRouter.use("/event", privateEventRouter);


export { publicEventRouter, privateEventRouter } 