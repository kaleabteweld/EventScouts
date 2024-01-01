import { TGender } from "../../Schema/user.schema";

export interface IUserLogInFrom {
    email: string,
    password: string
}

export interface IUserLogInFromWithWallet {
    walletAccounts: string[]
}

export interface IUserSignUpFrom {
    email: string,
    name: string,
    userName: string,
    phone: string,
    dateOfBirth: Date,
    gender: TGender,
    password: string,
    walletAccounts: string[]
}