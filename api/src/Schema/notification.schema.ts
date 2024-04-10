import mongoose from 'mongoose'
import { INewEventNotificationSchema, INewReactNotificationSchema, INotification, INotificationMethods, INotificationModel } from './Types/notification.schema.types';
import { IOrganizer } from './Types/organizer.schema.types';
import { mongooseErrorPlugin } from './Middleware/errors.middleware';
import { reactions } from './review.schema';

export const notificationSchema = new mongoose.Schema<INotification, INotificationModel, INotificationMethods>({
    title: { type: String },
    body: { type: String },
}, {
    timestamps: true,
    methods: {

    },
    statics: {

    }
});

notificationSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
});
notificationSchema.post('save', async function (doc) {
    // console.log({ doc, type: (doc as any).__t })
    const type = (doc as any).__t
    // try {
    //     const organizer: IOrganizer | null = await mongoose.model('Organizer').findById(doc.);
    //     if (organizer) {

    //     }
    // } catch (error) {
    //     console.error("Error updating categories:", error);
    // }
});
notificationSchema.plugin<any>(mongooseErrorPlugin)


const NotificationModel = mongoose.model<INotification, INotificationModel>("notification", notificationSchema);
export default NotificationModel;

export const newEventNotificationSchema = NotificationModel.discriminator<INewEventNotificationSchema>('newEventNotification', new mongoose.Schema({
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }
}, { discriminatorKey: 'type' }));


export const newReactNotificationSchema = NotificationModel.discriminator<INewReactNotificationSchema>('newReactNotificationS', new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reaction: { type: String, enum: reactions },
    review: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' }
}, { discriminatorKey: 'type' }));
