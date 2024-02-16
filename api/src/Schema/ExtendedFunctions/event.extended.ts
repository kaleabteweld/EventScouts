import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IEvent } from "../Types/event.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<IEvent>, _id: string, populatePath: string | string[], select?: any, model?: string | mongoose.Model<any, {}, {}, {}, any, any> | undefined, match?: any): Promise<mongoose.Document<unknown, {}, IEvent> & IEvent & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const event = await this.findById(new mongoose.Types.ObjectId(_id)).populate(populatePath);
        if (event == null) {
            throw ValidationErrorFactory({
                msg: "Invalid Id",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return event;
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