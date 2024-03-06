import mongoose from 'mongoose'
import { IEvent } from './Types/event.schema.types';


export interface ITicketType extends Document {
    PosterURl?: string;
    type: string;
    price: number;
    sellingStartDate?: Date;
    sellingEndDate?: Date;
    maxNumberOfTickets?: number;
    description?: string;
    events: mongoose.Schema.Types.ObjectId | IEvent;
}

export const ticketTypeSchema = new mongoose.Schema<ITicketType>({
    PosterURl: String,
    type: String,
    price: Number,
    sellingStartDate: { type: Date },
    sellingEndDate: { type: Date },
    maxNumberOfTickets: { type: Number, default: -1 },
    description: String,
    events: { type: mongoose.Types.ObjectId, ref: "Event" }
}, { timestamps: true });


const TicketType: mongoose.Model<ITicketType> = mongoose.model("TicketType", ticketTypeSchema);
export default TicketType;