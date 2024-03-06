import mongoose from "mongoose";
import { ITicketTypes } from "../Types/ticketTypes.schema.types";
import { ITicketTypesUpdateFrom } from "../../Domains/TicketTypes/types";
import { MakeValidator } from "../../Domains/Common";
import Joi from "joi";

export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}