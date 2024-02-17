import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IEvent } from "../Types/event.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';
import { IEventUpdateFrom } from "../../Domains/Event/types";


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<IEvent>, _id: string, populatePath: string | string[]): Promise<mongoose.Document<unknown, {}, IEvent> & IEvent & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const event = await this.findById(new mongoose.Types.ObjectId(_id)).populate(populatePath);
        if (event == null) {
            throw ValidationErrorFactory({
                msg: "Invalid Id",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return event;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }


}

export function checkIfOwnByOrganizer(this: IEvent, organizerID: string): boolean {

    try {
        if ((new mongoose.Types.ObjectId(organizerID)).equals(this.organizer._id)) {
            return true;
        }
        throw ValidationErrorFactory({
            msg: "Invalid Organizer",
            statusCode: 401,
            type: "validation"
        }, "id")
        return false;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }
}

export async function removeByID(this: mongoose.Model<IEvent>, _id: string): Promise<void> {
    try {
        await this.deleteOne({ _id: new mongoose.Types.ObjectId(_id) })
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw error;
    }
}

export async function update(this: IEvent, newEvent: IEventUpdateFrom, populatePath: string | string[]): Promise<IEvent | null> {

    try {
        const newDoc = this.overwrite({ ...newEvent, organizer: this.organizer });
        await this.save();
        await newDoc.populate(populatePath)
        return newDoc;
    } catch (error) {
        throw error;
    }
}