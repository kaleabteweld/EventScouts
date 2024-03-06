import mongoose from "mongoose";
import { ITicketTypes } from "../Types/ticketTypes.schema.types";
import { ITicketTypesUpdateFrom } from "../../Domains/TicketTypes/types";
import { MakeValidator } from "../../Domains/Common";
import Joi from "joi";

export async function update(this: mongoose.Model<ITicketTypes>, _id: string, newTicketTypes: ITicketTypesUpdateFrom, populatePath: string | string[]): Promise<ITicketTypes | null> {

    try {
        const newDoc = await this.findByIdAndUpdate(_id, newTicketTypes, { new: true, overwrite: true });
        await newDoc?.populate(populatePath)
        return newDoc;
    } catch (error) {
        throw error;
    }
}
export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}