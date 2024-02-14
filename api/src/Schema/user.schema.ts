import mongoose from 'mongoose'
import { getUserByEmail, checkPassword, encryptPassword, validator, getUserByWalletAccounts, getUserById, applyUserVerify, getByVerifiedKey } from './ExtendedFunctions/user.extended';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { GenderEnum, IUser, IUserMethods, UserModel, verifiedEnum } from './types/user.schema.types';

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
        enum: Object.values(GenderEnum),
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

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;