import mongoose from "mongoose";
import { IEvent } from "../../Schema/Types/event.schema.types";
import { INewEventNotificationSchema, INewReactNotificationSchema, INotification } from "../../Schema/Types/notification.schema.types";
import { IOrganizer } from "../../Schema/Types/organizer.schema.types";
import { IReview, TReactionType } from "../../Schema/Types/review.schema.types";
import { IUser } from "../../Schema/Types/user.schema.types";
import { newEventNotificationSchema, newReactNotificationSchema } from "../../Schema/notification.schema";
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

    static async createReactNotification(user: IUser, author: IUser, reaction: TReactionType, review: IReview, base: notificationBase): Promise<IResponseType<INewEventNotificationSchema>> {

        const reactNotification = new newReactNotificationSchema({
            ...base,
            reaction: reaction,
            user: user.id,
            review: review.id
        });

        await reactNotification.save();

        await User.updateOne({ _id: author._id }, { $push: { notifications: reactNotification._id } }, { multi: true, upsert: true });

        if (author.FCMToken) {
            const pushMessageBuilder: PushMessageBuilder = new PushMessageBuilder(author.FCMToken as string);
            const reactNotificationMessage = pushMessageBuilder
                .setTitle(base.title)
                .setBody(base.body as string)
                .build()

            const isRunningInJest: boolean = typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined;
            if (!isRunningInJest) await sendPushNotification(reactNotificationMessage);
        }

        return { body: reactNotification.toJSON() }
    }

}