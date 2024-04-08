import mongoose from "mongoose";
import { IOrganizer } from "./organizer.schema.types";
import { TReactionType } from "./review.schema.types";
import { IUser } from "./user.schema.types";



export interface INotification extends mongoose.Document {
    title: string;
    body: string;
}

export interface INewEventNotificationSchema extends INotification {
    organizer: mongoose.Types.ObjectId | IOrganizer;
    event: mongoose.Types.ObjectId | IOrganizer;
}
export interface INewReactNotificationSchema extends INotification {
    user: mongoose.Types.ObjectId | IOrganizer;
    reaction: TReactionType,
}

//Dynamic methods
export interface INotificationMethods {

}

// Extend the Document type with IUserMethods
export interface INotificationDocument extends INotification, INotificationMethods, mongoose.Document {
}

// statics methods
export interface INotificationModel extends mongoose.Model<INotificationDocument> {

}