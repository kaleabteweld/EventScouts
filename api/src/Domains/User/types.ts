import { TGender } from "../../Schema/Types/user.schema.types"


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
    profilePic: string,
    dateOfBirth: Date,
    gender: TGender,
    password: string,
    walletAccounts: string[]
}