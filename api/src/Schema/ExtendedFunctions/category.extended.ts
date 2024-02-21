import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { ValidationErrorFactory } from "../../Util/Factories";
import { ICategory } from "../Types/category.schema.types";
import { BSONError } from 'bson';


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<ICategory>, _id: string): Promise<mongoose.Document<unknown, {}, ICategory> & ICategory & { _id: mongoose.Types.ObjectId; } | null> {
    try {
        const category = await this.findById(new mongoose.Types.ObjectId(_id));
        if (category == null) {
            throw ValidationErrorFactory({
                msg: "Category not found",
                statusCode: 404,
                type: "Validation"
            }, "_id")
        }
        return category;

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

export function checkIfOwnByOrganizer(this: ICategory, organizerID: string): boolean {

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

export async function removeByID(this: mongoose.Model<ICategory>, _id: string): Promise<void> {
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