import mongoose from 'mongoose'
import { IEvent, IEventMethods, IEventModel } from './Types/event.schema.types'
import { IOrganizer } from './Types/organizer.schema.types'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById } from './ExtendedFunctions/event.extended'

export const eventSchema = new mongoose.Schema<IEvent, IEventModel, IEventMethods>({
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
}, {
    timestamps: true,
    methods: {

    },
    statics: {
        validator,
        getById,
    }
})

eventSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
eventSchema.plugin<any>(mongooseErrorPlugin)

const EventModel = mongoose.model<IEvent, IEventModel>("Event", eventSchema);
export default EventModel;




