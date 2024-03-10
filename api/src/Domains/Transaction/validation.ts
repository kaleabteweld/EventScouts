import Joi from "joi";
import { INewTransactionFrom } from "./types";
import mongoose from 'mongoose';

export const newTransactionSchema = Joi.object<INewTransactionFrom>({
    eventId: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'ObjectID').required(),
    amount: Joi.number().min(1).required(),
    mintHash: Joi.string().regex(/^0x[a-fA-F0-9]{64}$/).required(),
    ticketType: Joi.string().custom((value, helpers) => {
        if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'ObjectID').required(),
});

