import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
    email: string;
    name: string;
    userName: string;
    phone: string;
    verified: 'email' | 'phone' | 'Both' | 'none';
    dateOfBirth?: Date;
    gender: 'Male' | 'Female' | 'Others' | 'none';
    password: string;
    walletAccounts: string[];
}

export const userSchema = new mongoose.Schema<IUser>({
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
    password: { type: String, required: true },
    walletAccounts: [String],
}, { timestamps: true })


const User: mongoose.Model<IUser> = mongoose.model('User', userSchema);

export default User;