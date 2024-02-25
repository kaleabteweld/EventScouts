import mongoose from "mongoose";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';
import { IPagination } from "../../Domains/Common/types";
import { IEvent } from "../Types/event.schema.types";

export async function getEventWithReviews(this: mongoose.Model<IEvent>, { skip, limit }: IPagination, _id: string): Promise<IEvent> {

    try {
        const result = await this.aggregate<IEvent>([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            {
                $lookup: {
                    from: 'reviews',
                    localField: 'reviews',
                    foreignField: '_id',
                    as: 'reviews'
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
                    reviews: {
                        $slice: [
                            "$reviews",
                            skip,
                            limit
                        ]
                    },
                    total: {
                        $size: "$reviews"
                    },
                }
            }
        ]);

        if (result.length === 0) {
            throw ValidationErrorFactory({
                msg: "Event not found",
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