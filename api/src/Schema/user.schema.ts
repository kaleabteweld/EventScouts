import mongoose from 'mongoose'
import { getUserByEmail, checkPassword, encryptPassword, validator, getUserByWalletAccounts, getUserById, applyUserVerify, getByVerifiedKey, getPEGIRating, addEvent, update, removeByID, checkIfUserHasTicket, getTransactions, updateTransactionsEvent } from './ExtendedFunctions/user.extended';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { GenderEnum, IUser, IUserMethods, UserModel, verifiedEnum } from './Types/user.schema.types';
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
    transactions: [transactionSchema],
    FCMToken: { type: String, default: null },
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
        removeByID,
        update,
        checkIfUserHasTicket,
        getTransactions,
        updateTransactionsEvent,
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