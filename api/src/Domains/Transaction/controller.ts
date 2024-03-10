import { IResponseType } from "../Common/types";
import { Route, Tags, Get, Patch, Post, Delete, Body, Query, Path } from "tsoa";
import User from "../../Schema/user.schema";
import { IUser, IUserDocument } from "../../Schema/Types/user.schema.types";
import { INewTransactionFrom } from "./types";
import EventModel from "../../Schema/event.schema";
import { IEvent } from "../../Schema/Types/event.schema.types";
import { ITransactions } from "../../Schema/Types/transactions.schema.types";
import { getTransaction } from "../../Util/Ethers";
import TransactionModel from "../../Schema/transactions.schema";
import { newTransactionSchema } from "./validation";

@Route("/transaction")
@Tags("Transaction")
export default class TransactionController {

    @Patch("mint")
    static async mint(_from: INewTransactionFrom, _user: IUser): Promise<IResponseType<ITransactions>> {

        await TransactionModel.validator(_from, newTransactionSchema);
        const ETHTransaction = await getTransaction(_from.mintHash);

        const event = await EventModel.getById(_from.eventId ?? "");
        const userTransaction = await User.addEvent(_user.id, (event as IEvent), {
            amount: _from.amount ?? 0,
            ticketType: _from.ticketType ?? ""
        }, ETHTransaction.from);

        await event?.addUser((userTransaction?.user as IUserDocument));

        return ({ body: (userTransaction?.transaction.toJSON() as any) })
    }

}
