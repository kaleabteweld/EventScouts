import mongoose from "mongoose";
import Joi from 'joi';
import { IEvent } from "./event.schema.types";
import { IOrganizer } from "./organizer.schema.types";
import { IPagination } from "../../Domains/Common/types";


export interface ICategory extends mongoose.Document {
    name: string;
    events: mongoose.Schema.Types.ObjectId | IEvent[];
    organizer: mongoose.Types.ObjectId | IOrganizer
}

//Dynamic methods
export interface ICategoryMethods {
    checkIfOwnByOrganizer(this: ICategory, organizerID: string): boolean
}

// Extend the Document type with IUserMethods
export interface ICategoryDocument extends ICategory, ICategoryMethods, mongoose.Document {
}

// statics methods
export interface ICategoryModel extends mongoose.Model<ICategoryDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getById(_id: string): Promise<ICategoryDocument | null>
    removeByID(_id: string): Promise<void>
    getCategoryWithEventCount(_id: string): Promise<ICategory | null>
    getCategorysWithEventCount(pagination: IPagination): Promise<ICategory[]>
}