import mongoose from "mongoose";
import Joi from 'joi';
import { ILocation } from "./event.schema.types";

export interface ITransactions extends mongoose.Document {
    event: {
        event: mongoose.Schema.Types.ObjectId;
        posterURL: String;
        name: String;
        startDate: Date;
        endDate: Date;
        location: ILocation
        venue: String;
    },
    ticketType: {
        ticketType: mongoose.Schema.Types.ObjectId;
        amount: number;
    }
}

//Dynamic methods
export interface ITransactionsMethods {
}

// Extend the Document type with IUserMethods
export interface ITransactionsDocument extends ITransactions, ITransactionsMethods, mongoose.Document {
}

// statics methods
export interface ITransactionsModel extends mongoose.Model<ITransactionsDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getById(_id: string, populatePath?: string | string[]): Promise<ITransactionsDocument | null>
}