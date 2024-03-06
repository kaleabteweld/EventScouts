import Joi from "joi";
import { INewTicketTypesFrom, ITicketTypesUpdateFrom } from "./types";

export const newTicketTypesSchema = Joi.object<INewTicketTypesFrom>({
    posterURl: Joi.string().uri().optional(),
    type: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    sellingStartDate: Joi.date().required().custom((value, helpers) => {
        const parentSchema = helpers.state.ancestors[helpers.state.ancestors.length - 1];
        if (new Date(value) > new Date(parentSchema.endDate)) {
            throw new Error('"sellingStartDate" must be after "event endDate"');
        }
        return value;
    }),
    sellingEndDate: Joi.date().required().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].sellingStartDate as Date)) {
            throw Error("\"sellingEndDate\" Must Be After Start Date");
        }
        return value;
    }),
    maxNumberOfTickets: Joi.number().optional().min(1).default(0),
    refundable: Joi.boolean().optional().default(false),
    online: Joi.string().uri().optional(),
    transactionHash: Joi.string().regex(/^0x[a-fA-F0-9]{64}$/).optional().default(null),
});

export const updateTicketTypesSchema = Joi.object<ITicketTypesUpdateFrom>({
    posterURl: Joi.string().uri().optional(),
    type: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    sellingStartDate: Joi.date().optional().custom((value, helpers) => {
        const parentSchema = helpers.state.ancestors[helpers.state.ancestors.length - 1];
        if (new Date(value) > new Date(parentSchema.endDate)) {
            throw new Error('"sellingStartDate" must be after "event endDate"');
        }
        return value;
    }),
    sellingEndDate: Joi.date().optional().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].sellingStartDate as Date)) {
            throw Error("\"sellingEndDate\" Must Be After Start Date");
        }
        return value;
    }),
    maxNumberOfTickets: Joi.number().allow(null).optional().min(-1).default(null),
    refundable: Joi.boolean().optional().default(false),
    online: Joi.string().uri().allow(null).optional(),
    transactionHash: Joi.string().regex(/^0x[a-fA-F0-9]{64}$/).optional().allow(null),
});