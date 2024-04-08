import { IEvent } from "../../Schema/Types/event.schema.types";
import { INewEventNotificationSchema, INotification } from "../../Schema/Types/notification.schema.types";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import { newEventNotificationSchema } from "../../Schema/notification.schema";
import User from "../../Schema/user.schema";
import { PushMessageBuilder, TopicMessageBuilder, sendPushNotification } from "../../Util/push notifications";
import { IPagination, IResponseType } from "../Common/types";
import { notificationBase } from "./types";

export default class NotificationController {

    static async getNotifications(userId: string, pagination: IPagination): Promise<IResponseType<INotification[]>> {

        const notifications = await User.getNotifications(userId, pagination);
        return { body: notifications }
    }

    static async createEventNotification(organizer: IOrganizer, event: IEvent, base: notificationBase): Promise<IResponseType<INewEventNotificationSchema>> {

        const eventNotification = new newEventNotificationSchema({
            ...base,
            event: event.id,
            organizer: organizer.id,
        });

        await eventNotification.save();

        await User.updateMany(
            { _id: { $in: organizer.followers } },
            { $push: { notifications: eventNotification._id } },
            { multi: true }
        )

        const pushMessageBuilder: TopicMessageBuilder = new TopicMessageBuilder(`new-event-${organizer.id}`);
        const eventNotificationMessage = pushMessageBuilder
            .setTitle(event.name)
            .setBody(event.description as string)
            .build()

        const isRunningInJest: boolean = typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined;
        if (!isRunningInJest) await sendPushNotification(eventNotificationMessage);

        return { body: eventNotification.toJSON() }
    }

}