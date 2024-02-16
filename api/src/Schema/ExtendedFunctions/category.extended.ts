import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { ValidationErrorFactory } from "../../Util/Factories";
import { ICategory } from "../Types/category.schema.types";
import { BSONError } from 'bson';


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<ICategory>, _id: string): Promise<mongoose.Document<unknown, {}, ICategory> & ICategory & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const category = await this.findById(new mongoose.Types.ObjectId(_id));
        if (category == null) {
            throw ValidationErrorFactory({
                msg: "Invalid Id",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return category;

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