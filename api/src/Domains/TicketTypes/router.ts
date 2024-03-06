import express, { Request, Response } from "express";
import { MakeErrorHandler, organizerOnly } from "../../Util/middlewares";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import TicketTypeController from "./controller";


const publicTicketTypesRouter = express.Router();
const privateTicketTypesRouter = express.Router();



publicTicketTypesRouter.use("/ticketType", publicTicketTypesRouter);
privateTicketTypesRouter.use("/ticketType", privateTicketTypesRouter);


export { publicTicketTypesRouter, privateTicketTypesRouter } 