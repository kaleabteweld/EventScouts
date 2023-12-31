import mongoose from 'mongoose'
import { getUserByEmail, checkPassword, encryptPassword, validator, getUserByWalletAccounts, getUserById, applyUserVerify, getByVerifiedKey } from './ExtendedFunctions/user.extended';
import Joi from 'joi';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';

export type TGender = 'Male' | 'Female' | 'Others' | 'none';
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

// methods
interface IUserMethods {
    encryptPassword(password?: string): Promise<string>
    checkPassword(password: string): Promise<boolean>
    applyUserVerify(this: IUser, key: TVerified): Promise<IUser>
}

// Extend the Document type with IUserMethods
export interface IUserDocument extends IUser, IUserMethods, Document { }

// statics
export interface UserModel extends mongoose.Model<IUserDocument> {
    validator<T>(userInput: T, schema: Joi.ObjectSchema<T>): Promise<any>
    getUserByEmail(email: string): Promise<IUserDocument | null>
    getUserByWalletAccounts(walletAccounts: string[]): Promise<IUserDocument | null>
    getUserById(_id: string): Promise<IUserDocument | null>
    getByVerifiedKey(key: TVerified, value: string): Promise<IUserDocument | null>
}

export const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, unique: true },
    name: String,
    userName: { type: String, unique: true },
    phone: { type: String, unique: true },
    verified: {
        type: String,
        enum: Object.values(verifiedEnum),
        default: 'none'
    },
    dateOfBirth: { type: Date },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Others', 'none'],
        default: 'none'
    },
    password: { type: String },
    walletAccounts: [String],
}, {
    timestamps: true,
    methods: {
        encryptPassword,
        checkPassword,
        applyUserVerify,
    },
    statics: {
        validator,
        getUserByEmail,
        getUserByWalletAccounts,
        getUserById,
        getByVerifiedKey,
    }
});

userSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
userSchema.plugin(mongooseErrorPlugin)

// userSchema.pre('save', async function (next) {

//     // hash password
//     if (!this.isModified('password')) {
//         return next()
//     }
//     this.password = await this.encryptPassword(this.password);
// })

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;