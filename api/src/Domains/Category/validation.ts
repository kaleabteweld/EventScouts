import Joi from "joi";
import { INewCategoryFrom } from "./types";

export const newCategorySchema = Joi.object<INewCategoryFrom>({
    name: Joi.string().min(1).required(),
});
