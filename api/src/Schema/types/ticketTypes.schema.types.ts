import mongoose from "mongoose";
import Joi from 'joi';

export interface ITicketTypes extends mongoose.Document {
    posterURl: string,
    type: string,
    price: number
    sellingStartDate: Date
    sellingEndDate: Date
    maxNumberOfTickets: number
    description: string,
    refundable: boolean,
    online?: string,
}

//Dynamic methods
export interface ITicketTypesMethods {
}

// Extend the Document type with IUserMethods
export interface ITicketTypesDocument extends ITicketTypes, ITicketTypesMethods, mongoose.Document {
}

// statics methods
export interface ITicketTypesModel extends mongoose.Model<ITicketTypesDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getById(_id: string): Promise<ITicketTypesDocument | null>
}