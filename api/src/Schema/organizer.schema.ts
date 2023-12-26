import mongoose from 'mongoose'

export interface IOrganizer extends Document {
    email: string;
    name?: string;
    phone: string;
    logoURL?: string;
    verified: 'email' | 'phone' | 'EmailAndPhone' | 'Document' | 'all' | 'none';
    password?: string;
}

export const organizerSchema = new mongoose.Schema<IOrganizer>({
    email: { type: String, unique: true },
    name: String,
    phone: { type: String, unique: true },
    logoURL: String,
    verified: {
        type: String,
        enum: ['email', 'phone', 'EmailAndPhone', 'Document', 'all', 'none'],
        default: 'none'
    },
    password: { type: String },
}, { timestamps: true })

const OrganizerModel: mongoose.Model<IOrganizer> = mongoose.model("Organizer", organizerSchema);
export default OrganizerModel;