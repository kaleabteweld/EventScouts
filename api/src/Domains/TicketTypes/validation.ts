import Joi from "joi";
import { INewTicketTypesFrom } from "./types";

export const newTicketTypesSchema = Joi.object<INewTicketTypesFrom>({
    posterURl: Joi.string().uri().optional(),
    type: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    sellingStartDate: Joi.date().required(),
    sellingEndDate: Joi.date().required().custom((value, helpers) => {
        if ((new Date(value)) < (helpers.state.ancestors[0].sellingStartDate as Date)) {
            throw Error("\"sellingEndDate\" Must Be After Start Date");
        }
        return value;
    }),
    maxNumberOfTickets: Joi.number().optional().min(-1).default(null),
    refundable: Joi.boolean().optional().default(false),
    online: Joi.string().uri().optional()
});