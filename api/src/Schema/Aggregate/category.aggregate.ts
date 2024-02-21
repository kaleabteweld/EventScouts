import mongoose from "mongoose";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';
import { ICategory } from "../Types/category.schema.types";
import { IPagination } from "../../Domains/Common/types";

export async function getCategoryWithEventCount(this: mongoose.Model<ICategory>, _id: string): Promise<ICategory> {

    try {

        const result = await this.aggregate<ICategory>([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            {
                $lookup: {
                    from: 'events',
                    localField: 'events',
                    foreignField: '_id',
                    as: 'eventCount'
                }
            },
            {
                $set: {
                    id: '$_id'
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    events: 1,
                    organizer: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    eventCount: { $size: '$eventCount' }
                }
            }
        ]);

        if (result.length === 0) {
            throw ValidationErrorFactory({
                msg: "Category not found",
                statusCode: 404,
                type: "Validation"
            }, "_id");
        }

        return result[0];
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw (error as any);
    }

}

export async function getCategorysWithEventCount(this: mongoose.Model<ICategory>, { skip, limit }: IPagination): Promise<ICategory[]> {

    try {

        const result = await this.aggregate<ICategory>([
            {
                $lookup: {
                    from: 'events',
                    localField: 'events',
                    foreignField: '_id',
                    as: 'eventCount'
                }
            },
            {
                $set: {
                    id: '$_id'
                },
            },
            {
                $project: {
                    _id: 0,
                    id: 1,
                    name: 1,
                    events: 1,
                    organizer: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    eventCount: { $size: '$eventCount' }
                }
            },
            {
                $skip: skip ?? 0
            },
            {
                $limit: limit ?? 1
            }
        ]);

        if (result.length === 0) {
            throw ValidationErrorFactory({
                msg: "Category not found",
                statusCode: 404,
                type: "Validation"
            }, "_id");
        }

        return result;
    } catch (error) {
        if (error instanceof BSONError) {
            throw ValidationErrorFactory({
                msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                statusCode: 400,
                type: "validation",
            }, "id");
        }
        throw (error as any);
    }

}