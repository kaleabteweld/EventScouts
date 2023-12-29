import mongoose from 'mongoose'
import { checkPassword, encryptPassword, validator } from './ExtendedFunctions/user.extended';
import Joi from 'joi';
import { IUserSignUpFrom } from '../Domains/User/types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';

export type TGender = 'Male' | 'Female' | 'Others' | 'none';
export type TVerified = 'email' | 'phone' | 'Both' | 'none';
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
interface IUserMethods {
    encryptPassword(password: string): Promise<string>
    checkPassword(password: string, passwordHash: string): Promise<boolean>
}
interface UserModel extends mongoose.Model<IUser, {}, IUserMethods> {
    validator(userInput: IUserSignUpFrom, schema?: Joi.ObjectSchema<IUserSignUpFrom>): Promise<any>
}

export const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    email: { type: String, unique: true },
    name: String,
    userName: { type: String, unique: true },
    phone: { type: String, unique: true },
    verified: {
        type: String,
        enum: ['email', 'phone', 'Both', 'none'],
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
    },
    statics: {
        validator
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

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;