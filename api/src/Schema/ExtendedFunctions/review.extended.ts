import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IReview, TReactionType } from "../Types/review.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';
import { IUser } from "../Types/user.schema.types";
import { reactions } from "../review.schema";


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<IReview>, _id: string, populatePath: string | string[]): Promise<mongoose.Document<unknown, {}, IReview> & IReview & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const review = await this.findById(new mongoose.Types.ObjectId(_id)).populate(populatePath);
        if (review == null) {
            throw ValidationErrorFactory({
                msg: "Review not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return review;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }


}
export async function removeByID(this: mongoose.Model<IReview>, _id: string): Promise<void> {
    try {
        await this.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }
}

export async function react(this: IReview, reaction: TReactionType, user: IUser): Promise<IReview> {
    if (!reactions.includes(reaction)) {
        throw ValidationErrorFactory({
            msg: "Invalid reaction type",
            statusCode: 400,
            type: "Validation"
        }, "reaction")
    }

    const index = this.reactedUsers.findIndex((obj) => obj.user == user.id)
    const reactedUser = this.reactedUsers[index];

    if (index !== -1 && reactedUser.reaction == reaction) {
        (this.reactedUsers as any).pull({ user: user.id });
        this.reactions[reaction].count--;
    } else if (index !== -1 && reactedUser.reaction != reaction) {
        this.reactions[reactedUser.reaction].count--;
        this.reactions[reaction].count++;
    } else {
        this.reactedUsers.push({
            user: user.id,
            reaction: reaction,
        });
        this.reactions[reaction].count++;
    }

    await this.save();
    return this;
}