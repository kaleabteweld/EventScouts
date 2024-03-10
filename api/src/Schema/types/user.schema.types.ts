import mongoose from "mongoose";
import Joi from 'joi';
import { TPEGIRating } from "../../Domains/Event/validation";
import { IEvent, ILocation } from "./event.schema.types";
import { IBoughTicket } from "../../Domains/TicketTypes/types";
import { ITransactions, ITransactionsDocument } from "./transactions.schema.types";


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
    email: String;
    name: String;
    userName: String;
    phone: String;
    profilePic: String;
    verified: TVerified;
    dateOfBirth: Date;
    gender: TGender;
    password: String;
    walletAccounts: String[];
    transactions: ITransactions[];
}

//Dynamic methods
export interface IUserMethods {
    encryptPassword(password?: string): Promise<String>
    checkPassword(password: string): Promise<boolean>
    applyUserVerify(key: TVerified): Promise<IUser>
    getPEGIRating(): TPEGIRating
}

// Extend the Document type with IUserMethods
export interface IUserDocument extends IUser, IUserMethods, mongoose.Document { }

// statics methods
export interface UserModel extends mongoose.Model<IUserDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getUserByEmail(email: string): Promise<IUserDocument | null>
    getUserByWalletAccounts(walletAccounts: string[]): Promise<IUserDocument | null>
    getUserById(_id: string): Promise<IUserDocument | null>
    getByVerifiedKey(key: TVerified, value: string): Promise<IUserDocument | null>
    addEvent(_id: string, event: IEvent, boughTicket: IBoughTicket, walletAccount: string): Promise<ITransactionsDocument | null>
}