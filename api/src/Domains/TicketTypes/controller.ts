import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Get, Delete, Patch } from "tsoa";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import { ITicketTypesUpdateFrom } from "./types";
import { ITicketTypes } from "../../Schema/Types/ticketTypes.schema.types";
import EventModel from "../../Schema/event.schema";
import TicketTypesModel from "../../Schema/ticketType.schema";
import { updateTicketTypesSchema } from "./validation";


@Route("/ticketTypes")
@Tags("TicketType")
export default class TicketTypeController {

}
