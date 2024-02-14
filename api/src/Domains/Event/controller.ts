import { INewEventFrom } from "./types";
import { newEventSchema } from "./validation";
import { IResponseType } from "../Common/types";
import { Route, Tags, Post, Path } from "tsoa";
import { IEvent } from "../../Schema/Types/event.schema.types";
import EventModel from "../../Schema/event.schema";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";


@Route("/event")
@Tags("Event")
export default class EventController {
    @Post("/")
    static async createEvent(_event: INewEventFrom, organizer: IOrganizer): Promise<IResponseType<IEvent>> {

        _event = { ..._event, organizer: organizer._id }
        console.log({ event: _event, organizer })

        await EventModel.validator(_event, newEventSchema);
        const event = await new EventModel((_event));
        await event.save();

        return { body: event.toJSON() }
    }

}