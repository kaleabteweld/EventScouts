import mongoose from 'mongoose'
import { ITicketTypes, ITicketTypesMethods, ITicketTypesModel } from './Types/ticketTypes.schema.types'
import { mongooseErrorPlugin } from './Middleware/errors.middleware'
// import { validator, getById } from './ExtendedFunctions/TicketTypes.extended'

export const ticketTypesSchema = new mongoose.Schema<ITicketTypes, ITicketTypesModel, ITicketTypesMethods>({
    posterURl: String,
    type: String,
    price: { type: Number },
    sellingStartDate: { type: Date },
    sellingEndDate: { type: Date },
    maxNumberOfTickets: { type: Number, default: null },
    description: String,
    refundable: { type: Boolean, default: false },
    online: { type: String, default: null }

}, {
    timestamps: true,
    // methods: {

    // },
    // statics: {
    //     validator,
    //     getById,
    // }
})

ticketTypesSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
ticketTypesSchema.plugin<any>(mongooseErrorPlugin)

// const TicketTypesModel = mongoose.model<ITicketTypes, ITicketTypesModel>("TicketTypes", ticketTypesSchema);
// export default TicketTypesModel;




