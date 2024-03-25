import mongoose from 'mongoose'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
import { validator, getById, removeByID, react, getReviewsByEventId } from './ExtendedFunctions/review.extended'
import { IReview, IReviewMethods, IReviewModel, IReviewReaction } from './Types/review.schema.types'
import { IEvent } from './Types/event.schema.types'

export const reactions = ["like", "love", "haha", "wow", "sad", "angry"];
const reactionSchema = {
    count: { type: Number, default: 0 },
};

export const reviewSchema = new mongoose.Schema<IReview, IReviewModel, IReviewMethods>({
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    rating: { type: Number, min: 1, max: 5, default: 1 },
    review: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reactedUsers: [{
        reaction: { type: String, enum: reactions },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }],
    reactions: {
        like: reactionSchema,
        love: reactionSchema,
        haha: reactionSchema,
        wow: reactionSchema,
        sad: reactionSchema,
        angry: reactionSchema,
    },
}, {
    minimize: false,
    timestamps: true,
    methods: {
        react,
    },
    statics: {
        validator,
        getById,
        removeByID,
        getReviewsByEventId,
    }
})

reviewSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
reviewSchema.post('save', async function (doc, next) {
    try {
        const event = (await mongoose.model('Event').findById(doc.event) as IEvent);
        if (event) {
            event.rating.avgRating = ((event.rating.avgRating || 0) * (event.rating.ratingCount || 0) + (doc.rating)) / (event.rating.ratingCount + 1);
            event.rating.ratingCount += 1;

            event.totalReviews += 1;
            event.save();
        }
        next();
    } catch (error) {
        next();
    }
});
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




