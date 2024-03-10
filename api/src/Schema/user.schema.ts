import mongoose from 'mongoose'
import { getUserByEmail, checkPassword, encryptPassword, validator, getUserByWalletAccounts, getUserById, applyUserVerify, getByVerifiedKey, getPEGIRating, addEvent } from './ExtendedFunctions/user.extended';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { GenderEnum, IUser, IUserMethods, UserModel, verifiedEnum } from './Types/user.schema.types';
import { pointSchema } from './event.schema';
import { transactionSchema } from './transactions.schema';

export const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({

    email: { type: String, unique: true },
    name: String,
    userName: { type: String, unique: true },
    phone: { type: String, unique: true },
    profilePic: { type: String },
    verified: {
        type: String,
        enum: Object.values(verifiedEnum),
        default: 'none'
    },
    dateOfBirth: { type: Date },
    gender: {
        type: String,
        enum: Object.values(GenderEnum),
        default: 'none'
    },
    password: { type: String },
    walletAccounts: [String],
    transactions: [transactionSchema]
}, {
    timestamps: true,
    methods: {
        encryptPassword,
        checkPassword,
        applyUserVerify,
        getPEGIRating,
    },
    statics: {
        validator,
        getUserByEmail,
        getUserByWalletAccounts,
        getUserById,
        getByVerifiedKey,
        addEvent,
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
userSchema.plugin<any>(mongooseErrorPlugin)

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;