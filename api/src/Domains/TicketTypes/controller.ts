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

    @Patch("/update/{eventId}/{ticketTypesId}")
    static async update(_from: ITicketTypesUpdateFrom, eventId: string, ticketTypesId: string, organizer: IOrganizer): Promise<IResponseType<ITicketTypes | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);
        const index = event?.checkIfEventContainsTicketType(ticketTypesId);


        await TicketTypesModel.validator(_from, updateTicketTypesSchema);

        const newTicketType = await TicketTypesModel.update(event?.ticketTypes[(index as number)].id, _from)

        return { body: (newTicketType?.toJSON() as any) };
    }

}
