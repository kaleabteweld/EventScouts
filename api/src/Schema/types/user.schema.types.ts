import mongoose from "mongoose";
import Joi from 'joi';


export type TGender = 'male' | 'female' | 'others' | 'none';
export const GenderEnum: { [key in TGender]: string } = {
    male: 'male',
    female: 'female',
    others: 'others',
    none: 'none',
}

export type TVerified = 'email' | 'phone' | 'wallet' | 'none';
export const verifiedEnum: { [key in TVerified]: string } = {
    email: 'email',
    phone: 'phone',
    none: 'none',
    wallet: 'wallet'
}

export type TVerifiedSupported = 'email' | 'phone' | 'wallet';
export const verifiedSupportedEnum: { [key in TVerifiedSupported]: string } = {
    email: 'email',
    phone: 'phone',
    wallet: 'wallet',
}
export interface IUser extends mongoose.Document {
    email: string;
    name: string;
    userName: string;
    phone: string;
    verified: TVerified;
    dateOfBirth?: Date;
    gender: TGender;
    password: string;
    walletAccounts: string[];
}

//Dynamic methods
export interface IUserMethods {
    encryptPassword(password?: string): Promise<string>
    checkPassword(password: string): Promise<boolean>
    applyUserVerify(this: IUser, key: TVerified): Promise<IUser>
}

// Extend the Document type with IUserMethods
export interface IUserDocument extends IUser, IUserMethods, Document { }

// statics methods
export interface UserModel extends mongoose.Model<IUserDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getUserByEmail(email: string): Promise<IUserDocument | null>
    getUserByWalletAccounts(walletAccounts: string[]): Promise<IUserDocument | null>
    getUserById(_id: string): Promise<IUserDocument | null>
    getByVerifiedKey(key: TVerified, value: string): Promise<IUserDocument | null>
}