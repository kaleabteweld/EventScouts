import mongoose from 'mongoose'
import { IEvent } from './event.schema';

export interface ICategory extends Document {
    name: string;
    events: mongoose.Schema.Types.ObjectId | IEvent[];
}

export const categorySchema = new mongoose.Schema<ICategory>({
    name: String,
    events: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }
}, { timestamps: true });


const Category: mongoose.Model<ICategory> = mongoose.model("Category", categorySchema);
export default Category;