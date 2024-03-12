import Joi from "joi";
import { IChangePasswordFrom } from "../Common/types";
import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom, IUserUpdateFrom } from "./types";
import { GenderEnum } from "../../Schema/Types/user.schema.types";


export const newUserSchema = Joi.object<IUserSignUpFrom>({
    email: Joi.string().email().required(),
    name: Joi.string().max(30).required(),
    userName: Joi.string().max(20).required(),
    phone: Joi.string().required(),
    profilePic: Joi.string().uri().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.custom((value, helper) => {
        if (!Object.values(GenderEnum).includes(value)) {
            return helper.message({ custom: `\"gender\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).required(),
    password: Joi.string().min(8).max(254).required(),
    walletAccounts: Joi.array().items(Joi.string().min(8).max(254)).optional(),
});

export const logInSchema = Joi.object<IUserLogInFrom>({
    email: newUserSchema.extract("email"),
    password: newUserSchema.extract("password"),
});

export const logInWithWalletSchema = Joi.object<IUserLogInFromWithWallet>({
    walletAccounts: Joi.array().min(1).items(Joi.string().min(8).max(254)).required(),
});

export const userChangePassword = Joi.object<IChangePasswordFrom>({
    password: newUserSchema.extract("password"),
});

export const updateUserSchema = Joi.object<IUserUpdateFrom>({
    email: Joi.string().email().optional(),
    name: Joi.string().max(30).optional(),
    userName: Joi.string().max(20).optional(),
    phone: Joi.string().optional(),
    profilePic: Joi.string().uri().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.custom((value, helper) => {
        if (!Object.values(GenderEnum).includes(value)) {
            return helper.message({ custom: `\"gender\" ${value} is not a valid enum value` });
        } else {
            return value
        }
    }).optional(),
    password: Joi.string().min(8).max(254).optional(),
    walletAccounts: Joi.array().items(Joi.string().min(8).max(254)).optional(),
});

