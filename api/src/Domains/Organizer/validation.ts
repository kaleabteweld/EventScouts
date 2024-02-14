import Joi from "joi";
import { IChangePasswordFrom } from "../Common/types";
import { IOrganizerLogInFrom, IOrganizerSignUpFrom } from "./types";

export const newOrganizerSchema = Joi.object<IOrganizerSignUpFrom>({
    email: Joi.string().email().required(),
    name: Joi.string().max(30).required(),
    phone: Joi.string().required(),
    logoURL: Joi.string().uri().optional(),
    password: Joi.string().min(8).max(254).required(),
});

export const organizerIogInSchema = Joi.object<IOrganizerLogInFrom>({
    email: newOrganizerSchema.extract("email"),
    password: newOrganizerSchema.extract("password"),
});

export const OrganizerChangePassword = Joi.object<IChangePasswordFrom>({
    password: newOrganizerSchema.extract("password"),
});

