import Joi from "joi";
import { IEventSearchFrom, IEventSortFrom, IEventUpdateFrom, INewEventFrom } from "./types";
import { newTicketTypesSchema, updateTicketTypesSchema } from "../TicketTypes/validation";
import { ILocation } from "../../Schema/Types/event.schema.types";

export const PEGIRating = ["PEGI 7", "PEGI 12", "PEGI 16", "PEGI 18"]
export type TPEGIRating = "PEGI 7" | "PEGI 12" | "PEGI 16" | "PEGI 18";

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
    location: Joi.object<ILocation>({
        type: Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).required()
    }).required(),
    venue: Joi.string().required(),
    ageRating: Joi.custom((value, helper) => {
        if (!PEGIRating.includes(value)) {
            return helper.message({ custom: `\"ageRating\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).required(),
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
    location: Joi.object({
        longitude: Joi.number().optional(),
        latitude: Joi.number().optional(),
    }).or('longitude', 'latitude').and('longitude', 'latitude'),

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
    amountOfPeopleComing: Joi.number().optional(),
    fullText: Joi.string().min(1).required(),
});

export const eventSortSchema = Joi.object<IEventSortFrom>({
    name: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"name\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    startDate: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"startDate\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    endDate: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"endDate\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    ageRating: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"ageRating\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    categorys: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"categorys\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    maxPrice: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"maxPrice\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    minPrice: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"minPrice\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    organizer: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"organizer\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    amountOfPeopleComing: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"amountOfPeopleComing\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    fullText: Joi.custom((value, helper) => {
        if (!["asc", "desc"].includes(value)) {
            return helper.message({ custom: `\"fullText\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
});