import { IEventUpdateFrom, INewEventFrom } from "./types";
import { newEventSchema, updateEventSchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Get, Delete, Patch } from "tsoa";
import { IEvent } from "../../Schema/Types/event.schema.types";
import EventModel from "../../Schema/event.schema";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import { copyObjectWithout } from "../../Util";


@Route("/event")
@Tags("Event")
export default class EventController {
    @Post("/")
    static async createEvent(_event: INewEventFrom, organizer: IOrganizer): Promise<IResponseType<IEvent>> {

        _event = { ..._event, organizer: organizer.id };

        await EventModel.validator(_event, newEventSchema);
        const event = await new EventModel((_event));
        await event.save();

        await event.populate("categorys")

        return { body: event.toJSON() }
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
}
