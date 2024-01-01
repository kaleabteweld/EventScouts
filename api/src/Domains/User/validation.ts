import Joi from "joi";
import { IChangePasswordFrom } from "../Common/types";
import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom } from "./types";


export const newUserSchema = Joi.object<IUserSignUpFrom>({

    email: Joi.string().email().required(),
    name: Joi.string().max(30).required(),
    userName: Joi.string().max(20).required(),

    phone: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.custom((value, helper) => {
        if (!['Male', 'Female', 'Others', 'none'].includes(value)) {
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

