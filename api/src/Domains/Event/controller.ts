import { IEventSearchFrom, IEventSortFrom, IEventUpdateFrom, INewEventFrom } from "./types";
import { eventSearchSchema, eventSortSchema, newEventSchema, updateEventSchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Get, Delete, Patch } from "tsoa";
import { IEvent } from "../../Schema/Types/event.schema.types";
import EventModel from "../../Schema/event.schema";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import { copyObjectWithout } from "../../Util";
import { EventSearchBuilder, EventSortBuilder } from "../../Schema/ExtendedFunctions/event.extended";
import OrganizerModel from "../../Schema/organizer.schema";
import { ITicketTypesUpdateFrom } from "../TicketTypes/types";
import TicketTypesModel from "../../Schema/ticketType.schema";
import { updateTicketTypesSchema } from "../TicketTypes/validation";
import { ITicketTypes } from "../../Schema/Types/ticketTypes.schema.types";


@Route("/event")
@Tags("Event")
export default class EventController {
    @Post("/")
    static async createEvent(_event: INewEventFrom, organizer: IOrganizer): Promise<IResponseType<IEvent>> {

        const _organizer = await OrganizerModel.getById(organizer.id)

        await EventModel.validator(_event, newEventSchema);

        _event = {
            ..._event, organizer: {
                name: _organizer?.name,
                logoURL: _organizer?.logoURL,
                organizer: _organizer?.id
            }
        } as any;

        const event = await new EventModel((_event));
        await event.save();

        await event.populate("categorys")

        return { body: (event.toJSON() as any) }
    }

    @Get("/list/{skip}/{limit}")
    static async list({ skip, limit }: IPagination): Promise<IResponseType<IEvent[]>> {
        return {
            body: await EventModel.find()
                .populate("categorys")
                .skip(skip ?? 0)
                .limit(limit ?? 0)
                .exec()
        }
    }

    @Get("/byId/{eventId}")
    static async getById(eventId: string): Promise<IResponseType<IEvent | null>> {
        return { body: ((await EventModel.getById(eventId, "categorys"))?.toJSON() as any) };
    }

    @Delete("/remove/{eventId}")
    static async removeById(eventId: string, organizer: IOrganizer): Promise<IResponseType<IEvent | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);
        await EventModel.removeByID(event?.id)

        return { body: (event?.toJSON() as any) };

    }

    @Patch("/update/{eventId}")
    static async update(_from: IEventUpdateFrom, eventId: string, organizer: IOrganizer): Promise<IResponseType<IEvent | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);

        const validationCheckTicketType: any = event?.ticketTypes.map((ticketType) => copyObjectWithout(ticketType.toJSON(), ["createdAt", "updatedAt", "id"]))
        await EventModel.validator({
            endDate: event?.endDate,
            ticketTypes: validationCheckTicketType,
            ..._from
        }, updateEventSchema);

        const newEvent = await EventModel.update(event?.id, _from, "categorys")


        return { body: (newEvent?.toJSON() as any) };
    }

    @Post("/search/{page}")
    static async search(searchFrom: { search: IEventSearchFrom, sort?: IEventSortFrom }, page: number): Promise<IResponseType<IEvent[] | null>> {
        await EventModel.validator(searchFrom.search, eventSearchSchema);
        const builder = EventSearchBuilder.fromJSON(EventModel, searchFrom.search);
        if (searchFrom.sort) {
            await EventModel.validator(searchFrom.sort, eventSortSchema);
            const eventSortBuilder = EventSortBuilder.fromJSON(searchFrom.sort);
            builder.WithSort(eventSortBuilder);
        }
        builder.withPagination(page);

        return { body: (await builder.execute() as any) };
    }

    @Post("/search/vector/{page}")
    static async vectorSearch(searchFrom: IEventSearchFrom, page: number): Promise<IResponseType<IEvent[] | null>> {
        await EventModel.validator(searchFrom, eventSearchSchema);
        const builder = await EventSearchBuilder.fromJSON(EventModel, searchFrom).withEmbedding(searchFrom.search ?? "");
        builder.withPagination(page);

        return { body: (await builder.aggregateExecute() as any) };
    }

    @Patch("/update/ticketType/{eventId}/{ticketTypesId}")
    static async updateTicketType(_from: ITicketTypesUpdateFrom, eventId: string, ticketTypesId: string, organizer: IOrganizer): Promise<IResponseType<ITicketTypes | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);
        event?.checkIfEventContainsTicketType(ticketTypesId);

        await TicketTypesModel.validator(_from, updateTicketTypesSchema);
        const newTicketType = await event?.updateTicketType(ticketTypesId, _from)

        return { body: (newTicketType?.toJSON() as any) };
    }
}
