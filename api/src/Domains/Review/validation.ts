import Joi from "joi";
import { INewReviewFrom } from "./types";

export const newReviewSchema = Joi.object<INewReviewFrom>({
    event: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().required(),
});
