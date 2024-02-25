import mongoose from 'mongoose'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById, removeByID } from './ExtendedFunctions/review.extended'
import { IReview, IReviewMethods, IReviewModel } from './Types/review.schema.types'
import { IEvent } from './Types/event.schema.types'


export const reviewSchema = new mongoose.Schema<IReview, IReviewModel, IReviewMethods>({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    rating: { type: Number, min: 1, max: 5, default: 1 },
    review: String,
    user: {
        username: { type: String },
        profilePic: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
}, {
    timestamps: true,
    methods: {
    },
    statics: {
        validator,
        getById,
        removeByID,
    }
})

reviewSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
reviewSchema.post('save', async function (doc) {
    try {
        const event = await mongoose.model('Event').findById<IEvent>(doc.event);
        if (event) {
            if (!event.reviews.includes(doc._id)) {
                event.reviews.push(doc._id);
                await event.save();
            }
        }
    } catch (error) {
        console.error("Error updating Event:", error);
    }
});
reviewSchema.plugin<any>(mongooseErrorPlugin)

const ReviewModel = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);
export default ReviewModel;




