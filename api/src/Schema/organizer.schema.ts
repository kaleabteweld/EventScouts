import mongoose from 'mongoose'
import { IOrganizer, IOrganizerMethods, IOrganizerModel, verifiedEnum } from './Types/organizer.schema.types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { checkPassword, encryptPassword, validator, getByEmail, getById, getByVerifiedKey, applyVerify, getByWalletAccounts, addWalletAccount, removeWalletAccount, update } from './ExtendedFunctions/organizer.extended'

export const organizerSchema = new mongoose.Schema<IOrganizer, IOrganizerModel, IOrganizerMethods>({
    email: { type: String, unique: true },
    name: String,
    phone: { type: String, unique: true },
    logoURL: String,
    verified: {
        type: String,
        enum: Object.values(verifiedEnum),
        default: 'none'
    },
    password: { type: String },
    categorys: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
    walletAccounts: [String],
    socialLinks: { facebook: { type: String, default: null }, twitter: { type: String, default: null }, instagram: { type: String, default: null }, website: { type: String, default: null }, youtube: { type: String, default: null }, googlePhotos: { type: String, default: null } },
}, {
    timestamps: true,
    methods: {
        encryptPassword,
        checkPassword,
        applyVerify,
        addWalletAccount,
        removeWalletAccount,
    },
    statics: {
        validator,
        getByEmail,
        getById,
        getByVerifiedKey,
        getByWalletAccounts,
        update,
    }
})

organizerSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
organizerSchema.plugin<any>(mongooseErrorPlugin)

const OrganizerModel = mongoose.model<IOrganizer, IOrganizerModel>("Organizer", organizerSchema);
export default OrganizerModel;