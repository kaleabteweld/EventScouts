import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IReview } from "../Types/review.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';


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