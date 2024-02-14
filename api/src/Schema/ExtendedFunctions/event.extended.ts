import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IEvent } from "../Types/event.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";

export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<IEvent>, _id: string): Promise<mongoose.Document<unknown, {}, IEvent> & IEvent & { _id: mongoose.Types.ObjectId; } | null> {
    const organizer = await this.findById(new mongoose.Types.ObjectId(_id));
    if (organizer == null) {
        throw ValidationErrorFactory({
            msg: "Invalid Id",
            statusCode: 404,
            type: "Validation"
        }, "_id")
    }
    return organizer;

}