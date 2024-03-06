import mongoose from 'mongoose'
import { IEvent, IEventMethods, IEventModel, ILocation } from './Types/event.schema.types'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById, checkIfOwnByOrganizer, removeByID, update, getShareableLink, getEventByShareableLink, checkIfEventContainsTicketType, updateTicketType } from './ExtendedFunctions/event.extended'
import { getEventWithReviews } from './Aggregate/event.aggregate'
import { ticketTypesSchema } from './ticketType.schema'
import { PEGIRating } from '../Domains/Event/validation'
import CohereAI from '../Util/cohere'


const pointSchema = new mongoose.Schema<ILocation>({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

export const eventSchema = new mongoose.Schema<IEvent, IEventModel, IEventMethods>({
    name: { type: String, unique: true },
    posterURL: String,
    description: String,
    startDate: { type: Date },
    endDate: { type: Date },
    location: {
        type: pointSchema,
        index: '2dsphere'
    },
    venue: String,
    descriptionEmbedding: [{ type: Number, select: false }],
    rating: { avgRating: { type: Number, default: 0 }, ratingCount: { type: Number, default: 0 } },
    ageRating: { type: String, enum: PEGIRating },
    minimumTicketPrice: { type: Number, default: 0 }, // Aggregated field
    organizer: {
        name: { type: String },
        logoURL: { type: String },
        organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" },
    },
    categorys: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    ticketTypes: [ticketTypesSchema]
}, {
    timestamps: true,
    methods: {
        checkIfOwnByOrganizer,
        getShareableLink,
        checkIfEventContainsTicketType,
        updateTicketType,
    },
    statics: {
        validator,
        getById,
        removeByID,
        update,
        getEventWithReviews,
        getEventByShareableLink,
    },
    virtuals: {
        fullDescription: {
            get(): string {
                return `${(this as any).name}\n ${(this as any).description}`
            }
        },
    },
});

eventSchema.virtual('shareableLink').get(function () {
    return this.getShareableLink.bind(this)();
})

eventSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        delete ret['descriptionEmbedding']
        delete ret['fullDescription']
        return ret
    }
})
eventSchema.pre('save', async function (next) {

    const event: IEvent = this;

    try {
        // Populate the minimumTicketPrice
        if (event.ticketTypes.length > 0) {
            const minimumPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
            event.minimumTicketPrice = minimumPrice;
        }

        const cohere = CohereAI.getInstance(process.env.COHERE_API_KEY, true);
        try {
            event.descriptionEmbedding = await cohere.embed(event.fullDescription);
        } catch (error) {

        }

        next();
    } catch (error: any) {
        next(error);
    }
});
eventSchema.post('save', async function (doc) {
    try {
        const organizer = await mongoose.model('Organizer').findById(doc.organizer.organizer);
        if (organizer) {
            if (!organizer.events.includes(doc._id)) {
                organizer.events.push(doc._id);
                await organizer.save();
            }
        }

        for (const categoryId of doc.categorys) {
            const category = await mongoose.model('Category').findById(categoryId);
            if (category) {
                if (!category.events.includes(doc._id)) {
                    category.events.push(doc._id);
                    await category.save();
                }
            }
        }
    } catch (error) {
        console.error("Error updating categories:", error);
    }
});
eventSchema.pre('findOneAndUpdate', async function () {
    const docToUpdate: IEvent | null = await this.model.findOne(this.getFilter());

    try {
        for (const categoryId of (docToUpdate as IEvent).categorys) {
            const category = await mongoose.model('Category').findByIdAndUpdate(categoryId,
                { $pullAll: { events: [(docToUpdate as IEvent)._id] } },
                { new: true }
            );
            if (category) {
                await category.save();
            }
        }
    } catch (error) {
        console.error("Error updating categories:", error);
    }
});
eventSchema.pre('deleteOne', async function () {
    const docToDelete: IEvent | null = await this.model.findOne(this.getFilter());

    try {
        for (const categoryId of (docToDelete as IEvent).categorys) {
            const category = await mongoose.model('Category').findByIdAndUpdate(categoryId,
                { $pullAll: { events: [(docToDelete as IEvent)._id] } },
                { new: true }
            );
            if (category) {
                await category.save();
            }
        }
    } catch (error) {
        console.error("Error updating categories:", error);
    }
});
eventSchema.post('findOneAndUpdate', async function () {
    const event = this;
    try {
        const docUpdated: IEvent | null = await event.model.findOne(event.getFilter());
        if ((docUpdated as IEvent).ticketTypes.length > 0) {
            const minimumPrice = Math.min(...(docUpdated as IEvent).ticketTypes.map((ticket: any) => ticket.price));
            await event.model.updateOne({}, { $set: { minimumTicketPrice: minimumPrice } });
        }

    } catch (error: any) {
        console.log({ error })
    }
});
eventSchema.plugin<any>(mongooseErrorPlugin)

const EventModel = mongoose.model<IEvent, IEventModel>("Event", eventSchema);
export default EventModel;




