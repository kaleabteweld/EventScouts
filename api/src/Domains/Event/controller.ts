import { IEventSearchFrom, IEventSortFrom, IEventUpdateFrom, INewEventFrom } from "./types";
import { eventSearchSchema, eventSortSchema, newEventSchema, updateEventSchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
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
import { ValidationErrorFactory } from "../../Util/Factories";
import { Request } from 'express'


export default class EventController {
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
    static async list({ skip, limit }: IPagination): Promise<IResponseType<IEvent[]>> {
        return {
            body: await EventModel.find()
                .populate("categorys")
                .skip(skip ?? 0)
                .limit(limit ?? 0)
                .exec()
        }
    }

    static async getById(eventId: string): Promise<IResponseType<IEvent | null>> {
        return { body: ((await EventModel.getById(eventId, "categorys"))?.toJSON() as any) };
    }

    static async removeById(eventId: string, organizer: IOrganizer): Promise<IResponseType<IEvent | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);
        await EventModel.removeByID(event?.id)

        return { body: (event?.toJSON() as any) };

    }

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

    static async vectorSearch(searchFrom: IEventSearchFrom, page: number): Promise<IResponseType<IEvent[] | null>> {
        await EventModel.validator(searchFrom, eventSearchSchema);
        const builder = await EventSearchBuilder.fromJSON(EventModel, searchFrom).withEmbedding(searchFrom.search ?? "");
        builder.withPagination(page);

        return { body: (await builder.aggregateExecute() as any) };
    }

    static async updateTicketType(_from: ITicketTypesUpdateFrom, eventId: string, ticketTypesId: string, organizer: IOrganizer): Promise<IResponseType<ITicketTypes | null>> {
        const event = await EventModel.getById(eventId);
        event?.checkIfOwnByOrganizer(organizer.id);
        event?.checkIfEventContainsTicketType(ticketTypesId);

        await TicketTypesModel.validator(_from, updateTicketTypesSchema);
        const newTicketType = await event?.updateTicketType(ticketTypesId, _from)

        return { body: (newTicketType?.toJSON() as any) };
    }

    static async generateImagesUrl(req: Request): Promise<IResponseType<String[] | null>> {
        if (!req.files || req.files.length === 0) throw ValidationErrorFactory({ msg: "File is required", statusCode: 400, type: "Validation" }, "file");
        const imageUrls: String[] = (req.files as Express.Multer.File[]).map(file => {
            return `${req.protocol}://${req.get('host')}/${file.path}`;
        });
        return { body: imageUrls }
    }
}
