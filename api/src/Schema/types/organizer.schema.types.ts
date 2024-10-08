import mongoose from "mongoose";
import Joi from 'joi';
import { ICategory } from "./category.schema.types";
import { IEvent } from "./event.schema.types";
import { IOrganizerUpdateFrom } from "../../Domains/Organizer/types";
import { IUser } from "./user.schema.types";

export type TVerified = 'email' | 'phone' | 'document' | 'none';
export const verifiedEnum: { [key in TVerified]: string } = {
    email: 'email',
    phone: 'phone',
    none: 'none',
    document: 'document',
}

export type TVerifiedSupported = 'email' | 'phone';// | 'document';
export const verifiedSupportedEnum: { [key in TVerifiedSupported]: string } = {
    email: 'email',
    phone: 'phone',
    // document: 'document',
}

export interface IOrganizer extends mongoose.Document {
    email: string;
    name?: string;
    phone: string;
    logoURL?: string;
    verified: Object
    password: string;
    categorys: mongoose.Schema.Types.ObjectId[] | ICategory[]
    events: mongoose.Schema.Types.ObjectId | IEvent[];
    walletAccounts: string[];
    socialLinks: { facebook?: string, twitter?: string, instagram?: string, website?: string, youtube?: string, googlePhotos?: string }
    followers: mongoose.Schema.Types.ObjectId[] | IUser[]
    followersCount: number
}

//Dynamic methods
export interface IOrganizerMethods {
    encryptPassword(password?: string): Promise<string>
    checkPassword(password: string): Promise<boolean>
    applyVerify(key: TVerified): Promise<IOrganizer>
    addWalletAccount(wallet: string): Promise<IOrganizer>
    removeWalletAccount(wallet: string): Promise<IOrganizer>
    toggleFollower(user: IUser): Promise<IOrganizer>
}

// Extend the Document type with IUserMethods
export interface IOrganizerDocument extends IOrganizer, IOrganizerMethods, mongoose.Document {
}

// statics methods
export interface IOrganizerModel extends mongoose.Model<IOrganizerDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getByEmail(email: string): Promise<IOrganizerDocument | null>
    getById(_id: string, populatePath?: string | string[]): Promise<IOrganizerDocument | null>
    getByVerifiedKey(key: TVerified, value: string): Promise<IOrganizerDocument | null>
    getByWalletAccounts(walletAccounts: string[]): Promise<IOrganizerDocument | null>
    update(_id: string, newOrganizer: IOrganizerUpdateFrom, populatePath?: string | string[]): Promise<IOrganizer | null>
}