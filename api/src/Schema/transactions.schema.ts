import mongoose from "mongoose";
import { ITransactions, ITransactionsMethods, ITransactionsModel } from "./Types/transactions.schema.types";
import { pointSchema } from "./event.schema";
import { validator, getById } from "./ExtendedFunctions/transactions.extended"
import { mongooseErrorPlugin } from "./Middleware/errors.middleware";


export const transactionSchema = new mongoose.Schema<ITransactions, ITransactionsModel, ITransactionsMethods>({
    event: {
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
        posterURL: { type: String },
        name: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        location: {
            type: pointSchema,
            index: '2dsphere'
        },
        venue: { type: String },
    },
    ticketType: {
        ticketType: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType" },
        amount: { type: Number }
    }
}, {
    timestamps: true,
    statics: {
        validator,
        getById,
    }
})

transactionSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        ret['id'] = doc['_id']
        delete ret['_id']
        return ret
    }
})
transactionSchema.plugin<any>(mongooseErrorPlugin)

const TransactionModel = mongoose.model<ITransactions, ITransactionsModel>("Transaction", transactionSchema);
export default TransactionModel;