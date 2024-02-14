import Joi from "joi";
import { INewEventFrom } from "./types";

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
    organizer: Joi.string().min(24).required(),
    categorys: Joi.array().items(Joi.string().min(24)).min(1).required(),
    ticketTypes: Joi.array().items(Joi.string().min(24)).min(1).required(),
});
