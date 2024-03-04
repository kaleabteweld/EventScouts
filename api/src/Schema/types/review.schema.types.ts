import mongoose from "mongoose";
import Joi from 'joi';
import { IEvent } from "./event.schema.types";
import { IUser } from "./user.schema.types";

export type TReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface IReviewReaction {
    emoji: string;
    count: number;
    users: mongoose.Schema.Types.ObjectId[] | IUser[]
}

export interface IReview extends mongoose.Document {
    event: mongoose.Schema.Types.ObjectId | IEvent[]
    rating: number
    review: string
    user: {
        username: string
        profilePic: string
        user: mongoose.Schema.Types.ObjectId | IUser
    },
    reactedUsers: {
        username: string
        profilePic: string
        reaction: TReactionType,
        user: mongoose.Schema.Types.ObjectId | IUser
    }[],
    reactions: {
        like: IReviewReaction;
        love: IReviewReaction;
        haha: IReviewReaction;
        wow: IReviewReaction;
        sad: IReviewReaction;
        angry: IReviewReaction;
    };
}

//Dynamic methods
export interface IReviewMethods {
    react(reaction: TReactionType, user: IUser): Promise<IReview>
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