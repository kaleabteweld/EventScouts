import mongoose from 'mongoose'
import { IEvent, IEventMethods, IEventModel } from './Types/event.schema.types'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById, checkIfOwnByOrganizer, removeByID, update } from './ExtendedFunctions/event.extended'
import { ticketTypesSchema } from './ticketType.schema'

export const eventSchema = new mongoose.Schema<IEvent, IEventModel, IEventMethods>({
    name: { type: String, unique: true },
    posterURL: String,
    description: String,
    startDate: { type: Date },
    endDate: { type: Date },
    location: String,
    venue: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
    categorys: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    ticketTypes: [ticketTypesSchema]
}, {
    timestamps: true,
    methods: {
        checkIfOwnByOrganizer,
    },
    statics: {
        validator,
        getById,
        removeByID,
        update,
    }
})

eventSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
eventSchema.plugin<any>(mongooseErrorPlugin)

const EventModel = mongoose.model<IEvent, IEventModel>("Event", eventSchema);
export default EventModel;




