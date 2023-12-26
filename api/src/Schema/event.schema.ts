import mongoose from 'mongoose'
import { IOrganizer } from './organizer.schema'
import { ICategory } from './category.schema'
import { ITicketType } from './ticket.schema'

export interface IEvent extends mongoose.Document {
    name: string
    posterURL: string
    description: String
    startDate: Date
    endDate: Date
    location: String
    venue: String
    organizer: mongoose.Types.ObjectId | IOrganizer
    categorys: mongoose.Schema.Types.ObjectId[] | ICategory
    ticketTypes: mongoose.Schema.Types.ObjectId[] | ITicketType
}

export const eventSchema = new mongoose.Schema<IEvent>({
    name: String,
    posterURL: String,
    description: String,
    startDate: { type: Date },
    endDate: { type: Date },
    location: String,
    venue: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
    categorys: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ticketTypes: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
}, { timestamps: true })

const Event: mongoose.Model<IEvent> = mongoose.model("Event", eventSchema);
export default Event;




