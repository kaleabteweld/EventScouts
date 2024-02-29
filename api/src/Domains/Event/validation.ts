import Joi from "joi";
import { IEventSearchFrom, IEventUpdateFrom, INewEventFrom } from "./types";
import { newTicketTypesSchema, updateTicketTypesSchema } from "../TicketTypes/validation";

export const PEGIRating = ["PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18"]

export const newEventSchema = Joi.object<INewEventFrom>({
    name: Joi.string().min(1).required(),
    posterURL: Joi.string().uri().required(),
    description: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].startDate as Date)) {
            throw Error("\"endDate\" Must Be After Start Date");
        }
        return value;
    }),
    location: Joi.string().required(),
    venue: Joi.string().required(),
    ageRating: Joi.custom((value, helper) => {
        if (!PEGIRating.includes(value)) {
            return helper.message({ custom: `\"ageRating\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).required(),
    organizer: Joi.string().min(24).required(),
    categorys: Joi.array().items(Joi.string().min(24)).min(1).required(),
    ticketTypes: Joi.array().items(newTicketTypesSchema).min(1).required(),
});

export const updateEventSchema = Joi.object<IEventUpdateFrom>({
    name: Joi.string().min(1).optional(),
    posterURL: Joi.string().uri().optional(),
    description: Joi.string().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].startDate as Date)) {
            throw Error("\"endDate\" Must Be After Start Date");
        }
        return value;
    }),
    location: Joi.string().optional(),
    venue: Joi.string().optional(),
    ageRating: Joi.custom((value, helper) => {
        if (!PEGIRating.includes(value)) {
            return helper.message({ custom: `\"ageRating\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    categorys: Joi.array().items(Joi.string().min(24)).min(1).optional(),
    ticketTypes: Joi.array().items(updateTicketTypesSchema).min(1).optional(),
});

export const eventSearchSchema = Joi.object<IEventSearchFrom>({
    name: Joi.string().min(1).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].startDate as Date)) {
            throw Error("\"endDate\" Must Be After Start Date");
        }
        return value;
    }),
    location: Joi.string().optional(),
    ageRating: Joi.custom((value, helper) => {
        if (!PEGIRating.includes(value)) {
            return helper.message({ custom: `\"ageRating\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    categorys: Joi.array().items(Joi.string().min(24)).min(1).optional(),
    maxPrice: Joi.number().optional(),
    minPrice: Joi.number().min(0).optional(),
    organizer: Joi.string().optional(),
    search: Joi.string().optional(),
});