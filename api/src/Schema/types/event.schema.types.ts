import mongoose from "mongoose";
import Joi from 'joi';
import { IOrganizer } from "./organizer.schema.types";
import { ICategory } from "./category.schema.types";
import { ITicketTypes, ITicketTypesDocument } from "./ticketTypes.schema.types";
import { IEventUpdateFrom } from "../../Domains/Event/types";
import { IPagination } from "../../Domains/Common/types";
import { IReview } from "./review.schema.types";
import { ITicketTypesUpdateFrom } from "../../Domains/TicketTypes/types";
import { IUser } from "./user.schema.types";

export interface ILocation {
    type: "Point"
    coordinates: number[]
}

export interface IEvent extends mongoose.Document {
    name: string
    posterURL: string
    description: String
    descriptionEmbedding: number[]
    fullDescription: string
    startDate: Date
    endDate: Date
    location: ILocation
    venue: String
    ageRating: String
    minimumTicketPrice: number
    shareableLink: string,
    rating: { avgRating: number, ratingCount: number },
    organizer: {
        name: String
        logoURL: String
        organizer: mongoose.Types.ObjectId | IOrganizer
    },
    categorys: mongoose.Schema.Types.ObjectId[] | ICategory[]
    ticketTypes: ITicketTypes[]
    reviews: mongoose.Schema.Types.ObjectId[] | IReview[]
    users: mongoose.Schema.Types.ObjectId[] | IUser[]
    userTotal: number
}

//Dynamic methods
export interface IEventMethods {
    checkIfOwnByOrganizer(organizerID: string): boolean
    checkIfEventContainsTicketType(ticketTypesId: string): number
    getShareableLink(): String
    updateTicketType(ticketTypesId: string, _newTicketTypes: ITicketTypesUpdateFrom): Promise<ITicketTypesDocument | null>
    addUser(user: IUser): Promise<IEvent | null>
}

// Extend the Document type with IUserMethods
export interface IEventDocument extends IEvent, IEventMethods, mongoose.Document {
}

// statics methods
export interface IEventModel extends mongoose.Model<IEventDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getById(_id: string, populatePath?: string | string[]): Promise<IEventDocument | null>
    removeByID(_id: string): Promise<void>
    update(_id: string, newEvent: IEventUpdateFrom, populatePath: string | string[]): Promise<IEvent | null>
    getEventWithReviews(pagination: IPagination, _id: string): Promise<IEvent>
    getEventByShareableLink(_eventId: string, populatePath: string | string[]): Promise<IEventDocument | null>
}