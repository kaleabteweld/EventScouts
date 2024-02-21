import mongoose from 'mongoose'
import { IOrganizer, IOrganizerMethods, IOrganizerModel, verifiedEnum } from './Types/organizer.schema.types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { checkPassword, encryptPassword, validator, getByEmail, getById, getByVerifiedKey, applyVerify } from './ExtendedFunctions/organizer.extended'

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
}, {
    timestamps: true,
    methods: {
        encryptPassword,
        checkPassword,
        applyVerify,
    },
    statics: {
        validator,
        getByEmail,
        getById,
        getByVerifiedKey,
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