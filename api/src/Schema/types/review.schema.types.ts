import mongoose from "mongoose";
import Joi from 'joi';
import { IEvent } from "./event.schema.types";
import { IUser } from "./user.schema.types";

export interface IReview extends mongoose.Document {
    event: mongoose.Schema.Types.ObjectId | IEvent[]
    rating: number
    review: string
    user: {
        username: string
        profilePic: string
        user: mongoose.Schema.Types.ObjectId | IUser[]
    },
}

//Dynamic methods
export interface IReviewMethods {
}

// Extend the Document type with IUserMethods
export interface IReviewDocument extends IReview, IReviewMethods, mongoose.Document {
}

// statics methods
export interface IReviewModel extends mongoose.Model<IReviewDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getById(_id: string, populatePath?: string | string[]): Promise<IReviewDocument | null>
    removeByID(_id: string): Promise<void>
    // update(_id: string, newEvent: IReviewUpdateFrom, populatePath: string | string[]): Promise<IReview | null>
}