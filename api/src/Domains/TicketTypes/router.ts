import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import TicketTypeController from "./controller";


const publicTicketTypesRouter = express.Router();
const privateTicketTypesRouter = express.Router();


privateTicketTypesRouter.patch("/update/:eventId/:ticketTypesId", organizerOnly, MakeErrorHandler(
    async (req: any, res: Response) => {
        const _TicketTypesOrganizer: IOrganizer = req['organizer'];
        res.json(await TicketTypeController.update(req.body, req.params.TicketTypesId, req.params.eventId, _TicketTypesOrganizer));
    }
));



publicTicketTypesRouter.use("/ticketTypes", publicTicketTypesRouter);
privateTicketTypesRouter.use("/ticketTypes", privateTicketTypesRouter);


export { publicTicketTypesRouter, privateTicketTypesRouter } 