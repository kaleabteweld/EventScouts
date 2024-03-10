import Joi from "joi";
import { IChangePasswordFrom } from "../Common/types";
import { IOrganizerLogInFrom, IOrganizerSignUpFrom, IOrganizerLogInFromWithWallet, IOrganizerUpdateFrom } from "./types";

export const newOrganizerSchema = Joi.object<IOrganizerSignUpFrom>({
    email: Joi.string().email().required(),
    name: Joi.string().max(30).required(),
    phone: Joi.string().required(),
    logoURL: Joi.string().uri().required(),
    password: Joi.string().min(8).max(254).required(),
    walletAccounts: Joi.array().items(Joi.string().min(8).max(254)).optional(),
});

export const organizerIogInSchema = Joi.object<IOrganizerLogInFrom>({
    email: newOrganizerSchema.extract("email"),
    password: newOrganizerSchema.extract("password"),
});

export const OrganizerChangePassword = Joi.object<IChangePasswordFrom>({
    password: newOrganizerSchema.extract("password"),
});

export const logInWithWalletSchema = Joi.object<IOrganizerLogInFromWithWallet>({
    walletAccounts: Joi.array().min(1).items(Joi.string().min(8).max(254)).required(),
});

export const updateOrganizerSchema = Joi.object<IOrganizerUpdateFrom>({
    email: Joi.string().email().optional(),
    name: Joi.string().max(30).optional(),
    phone: Joi.string().optional(),
    logoURL: Joi.string().uri().optional(),
    walletAccounts: Joi.array().items(Joi.string().min(8).max(254)).optional(),
    socialLinks: Joi.object({
        facebook: Joi.string().uri().optional().default(null),
        twitter: Joi.string().uri().optional().default(null),
        instagram: Joi.string().uri().optional().default(null),
        website: Joi.string().uri().optional().default(null),
        youtube: Joi.string().uri().optional().default(null),
        googlePhotos: Joi.string().uri().optional().default(null)
    }),
});