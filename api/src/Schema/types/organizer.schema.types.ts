import mongoose from "mongoose";
import Joi from 'joi';
import { ICategory } from "./category.schema.types";

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
}

//Dynamic methods
export interface IOrganizerMethods {
    encryptPassword(password?: string): Promise<string>
    checkPassword(password: string): Promise<boolean>
    applyVerify(this: IOrganizer, key: TVerified): Promise<IOrganizer>
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
}