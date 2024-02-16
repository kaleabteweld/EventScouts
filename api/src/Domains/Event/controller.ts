import { INewEventFrom } from "./types";
import { newEventSchema } from "./validation";
import { IPagination, IResponseType } from "../Common/types";
import { Route, Tags, Post, Path, Get } from "tsoa";
import { IEvent } from "../../Schema/Types/event.schema.types";
import EventModel from "../../Schema/event.schema";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


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

}