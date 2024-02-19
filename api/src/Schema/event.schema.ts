import mongoose from 'mongoose'
import { IEvent, IEventMethods, IEventModel } from './Types/event.schema.types'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById, checkIfOwnByOrganizer, removeByID, update } from './ExtendedFunctions/event.extended'
import { ticketTypesSchema } from './ticketType.schema'
import { PEGIRating } from '../Domains/Event/validation'


export const eventSchema = new mongoose.Schema<IEvent, IEventModel, IEventMethods>({
    name: { type: String, unique: true },
    posterURL: String,
    description: String,
    startDate: { type: Date },
    endDate: { type: Date },
    location: String,
    venue: String,
    ageRating: { type: String, enum: PEGIRating },
    minimumTicketPrice: { type: Number, default: 0 }, // Aggregated field
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
eventSchema.pre('save', async function (next) {
    const event: IEvent = this;

    // Populate the minimumTicketPrice
    try {
        if (event.ticketTypes.length > 0) {
            const minimumPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
            event.minimumTicketPrice = minimumPrice;
        }
        next();
    } catch (error: any) {
        next(error);
    }
});
eventSchema.post('findOneAndUpdate', async function () {
    const event = this;
    try {
        const docToUpdate: IEvent | null = await event.model.findOne(event.getFilter());
        if ((docToUpdate as IEvent).ticketTypes.length > 0) {
            const minimumPrice = Math.min(...(docToUpdate as IEvent).ticketTypes.map((ticket: any) => ticket.price));
            await event.model.updateOne({}, { $set: { minimumTicketPrice: minimumPrice } });
        }

    } catch (error: any) {
        console.log({ error })
    }
});
eventSchema.plugin<any>(mongooseErrorPlugin)

const EventModel = mongoose.model<IEvent, IEventModel>("Event", eventSchema);
export default EventModel;




