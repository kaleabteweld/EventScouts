import mongoose from "mongoose";
import Joi from 'joi';
import { IOrganizer } from "./organizer.schema.types";
import { ICategory } from "./category.schema.types";
import { ITicketTypes } from "./ticketTypes.schema.types";
import { IEventUpdateFrom } from "../../Domains/Event/types";

export interface IEvent extends mongoose.Document {
    name: string
    posterURL: string
    description: String
    startDate: Date
    endDate: Date
    location: String
    venue: String
    ageRating: String
    minimumTicketPrice: number
    organizer: mongoose.Types.ObjectId | IOrganizer
    categorys: mongoose.Schema.Types.ObjectId[] | ICategory
    ticketTypes: ITicketTypes[]
}

//Dynamic methods
export interface IEventMethods {
    checkIfOwnByOrganizer(this: IEvent, organizerID: string): boolean
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
}