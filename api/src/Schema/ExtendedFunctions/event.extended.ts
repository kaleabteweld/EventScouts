import Joi from "joi";
import { MakeValidator } from "../../Domains/Common";
import mongoose from "mongoose";
import { IEvent, IEventDocument } from "../Types/event.schema.types";
import { ValidationErrorFactory } from "../../Util/Factories";
import { BSONError } from 'bson';
import { IEventSearchFrom, IEventSortFrom, IEventUpdateFrom } from "../../Domains/Event/types";
import EventModel from "../event.schema";
import CohereAI from "../../Util/cohere";
import { decryptId, encryptId, isEncrypted } from "../../Util";
import { ITicketTypesUpdateFrom } from "../../Domains/TicketTypes/types";
import { ITicketTypes } from "../Types/ticketTypes.schema.types";


export function validator<T>(userInput: T, schema: Joi.ObjectSchema<T>) {
    return MakeValidator<T>(schema, userInput);
}

export async function getById(this: mongoose.Model<IEvent>, _id: string, populatePath: string | string[]): Promise<mongoose.Document<unknown, {}, IEvent> & IEvent & { _id: mongoose.Types.ObjectId; } | null> {
    if (isEncrypted(_id)) {
        _id = decryptId(_id);
    }
    try {
        const event = await this.findById(new mongoose.Types.ObjectId(_id)).populate(populatePath);
        if (event == null) {
            throw ValidationErrorFactory({
                msg: "Event not found",
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
        if ((new mongoose.Types.ObjectId(organizerID)).equals(this.organizer.organizer._id)) {
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

export async function update(this: mongoose.Model<IEvent>, _id: string, newEvent: IEventUpdateFrom, populatePath: string | string[]): Promise<IEvent | null> {

    try {
        const newDoc = await this.findByIdAndUpdate(_id, newEvent, { new: true, overwrite: true });
        await newDoc?.populate(populatePath)
        return newDoc;
    } catch (error) {
        throw error;
    }
}

export class EventSearchBuilder {
    private query: mongoose.FilterQuery<IEventDocument> = {};
    private sortCriteria: Record<string, number> = {};
    private aggregateQuery: mongoose.PipelineStage[] = []
    private page: number = 1;


    constructor(private model: mongoose.Model<IEventDocument> = EventModel, private pageSize: number = 10, private maxDistance: number = 1000) {
    }

    withName(name: string): this {
        this.query.name = { $regex: new RegExp(name, 'i') };
        return this;
    }
    withStartDate(startDate: Date): this {
        this.query.startDate = { $gte: startDate };
        return this;
    }
    withEndDate(endDate: Date): this {
        this.query.endDate = { $lte: endDate };
        return this;
    }
    withLocation(lon: number, lat: number): this {
        this.query.location = {
            $near: {
                $maxDistance: this.maxDistance,
                $geometry: {
                    type: "Point",
                    coordinates: [lon, lat],
                },
            },
        };
        return this;
    }
    withAgeRating(ageRating: string): this {
        this.query.ageRating = ageRating;
        return this;
    }
    withOrganizer(organizerId: string): this {
        this.query = { "organizer.organizer": organizerId }
        return this;
    }
    withMinPrice(minPrice: number): this {
        this.query.minimumTicketPrice = { $gte: minPrice };
        return this;
    }
    withMaxPrice(maxPrice: number): this {
        this.query.minimumTicketPrice = { $lte: maxPrice };
        return this;
    }
    withCategory(categoryIds: string[]): this {
        if (!this.query.categorys) {
            this.query.categorys = [];
        }
        this.query.categorys = categoryIds;
        // this.query.categorys = { $in: categoryIds };
        return this;
    }
    async withEmbedding(search: string): Promise<this> {

        const cohere = CohereAI.getInstance(process.env.COHERE_API_KEY);
        const _search = await cohere.embed(search);
        (this.aggregateQuery as any[]).push({
            $vectorSearch: {
                index: "descriptionEmbeddingIndex",
                path: "descriptionEmbedding",
                queryVector: _search[0],
                numCandidates: 1024,
            }
        })
        return this
    }
    withPagination(page: number = 1): this {
        if (page < 1) throw ValidationErrorFactory({
            msg: 'page must be greater than 1',
            statusCode: 400,
            type: "validation"
        }, "page")
        this.page = page;
        return this;
    }

    WithSort(sortBuilder: EventSortBuilder): this {
        this.sortCriteria = sortBuilder.getSortCriteria();
        return this;
    }
    static fromJSON(model: mongoose.Model<IEventDocument>, json: IEventSearchFrom): EventSearchBuilder {
        const builder = new EventSearchBuilder(model);
        if (json.name) {
            builder.withName(json.name);
        }
        // if (json.search) {
        //     builder.withEmbedding(json.search);
        // }
        if (json.location) {
            if (json.location.longitude && json.location.latitude)
                builder.withLocation(json.location.longitude, json.location.latitude);
        }
        if (json.ageRating) {
            builder.withAgeRating(json.ageRating);
        }
        if (json.organizer) {
            builder.withOrganizer(json.organizer);
        }
        if (json.categorys && Array.isArray(json.categorys)) {
            builder.withCategory(json.categorys);
        }
        if (json.startDate) {
            builder.withStartDate(new Date(json.startDate));
        }
        if (json.endDate) {
            builder.withEndDate(new Date(json.endDate));
        }
        if (json.minPrice) {
            builder.withMinPrice(json.minPrice);
        }
        if (json.maxPrice) {
            builder.withMaxPrice(json.maxPrice);
        }
        return builder;
    }
    async execute(): Promise<IEventDocument[] | void> {
        try {
            const skip = (this.page - 1) * this.pageSize;
            const result = await this.model
                .find(this.query)
                .sort(this.sortCriteria as any)
                .skip(skip)
                .limit(this.pageSize);
            return result;
        } catch (error) {
            if (error instanceof BSONError || error instanceof mongoose.Error.CastError) {
                throw ValidationErrorFactory({
                    msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                    statusCode: 400,
                    type: "validation",
                }, "organizerId");
            }
            if ((error as any).code === 291) {
                throw ValidationErrorFactory({
                    msg: "unable to find index for $geoNear query",
                    statusCode: 500,
                    type: "mongoDb",
                }, "location");
            }
            throw error;
        }
    }
    async aggregateExecute(): Promise<IEventDocument[] | void> {
        try {
            const skip = (this.page - 1) * this.pageSize;
            this.aggregateQuery.push({ $match: this.query })
            this.aggregateQuery.push({ $sort: this.sortCriteria as any });
            this.aggregateQuery.push({ $skip: skip });
            this.aggregateQuery.push({ $limit: this.pageSize });

            const result = await this.model.aggregate<IEventDocument>(this.aggregateQuery)

            return result;
        } catch (error) {
            if (error instanceof BSONError || error instanceof mongoose.Error.CastError) {
                throw ValidationErrorFactory({
                    msg: "Input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
                    statusCode: 400,
                    type: "validation",
                }, "organizerId");
            }
            if ((error as any).code === 40324) {
                throw ValidationErrorFactory({
                    msg: "you want to perform vector search. Then, create a search index and specify the fields you want to index for vector search.",
                    statusCode: 500,
                    type: "mongoDb",
                }, "search");
            }
            throw error;
        }
    }
}

export class EventSortBuilder {

    private sortCriteria: Record<string, number> = {};

    constructor() { }

    static fromJSON(json: IEventSortFrom): EventSortBuilder {
        const builder = new EventSortBuilder();
        builder.withSort(json as any);
        return builder;
    }
    withSort(sortCriteria: Record<string, 'asc' | 'desc'>): this {
        Object.entries(sortCriteria).forEach(([field, order]) => {
            this.sortCriteria[field] = order === 'asc' ? 1 : -1;
        });
        return this;
    }

    getSortCriteria() {
        return this.sortCriteria;
    }
}

export function getShareableLink(this: IEvent): String {
    const baseUrl = process.env.SHAREABLE_LINK_BASE_URL ?? "";
    return `${baseUrl}/event/${encryptId(this.id)}`;
}

export function getEventByShareableLink(this: mongoose.Model<IEvent>, _eventId: string, populatePath: string | string[]): Promise<mongoose.Document<unknown, {}, IEvent> & IEvent & { _id: mongoose.Types.ObjectId; } | null> {
    var eventId = _eventId;
    if (isEncrypted(eventId)) {
        eventId = decryptId(eventId);
    }
    return getById.bind(this)(eventId, populatePath)
}

export function checkIfEventContainsTicketType(this: IEvent, ticketTypesId: string): number {

    try {
        const index = this.ticketTypes.findIndex((obj) => obj.id == ticketTypesId);
        if (index == -1) {
            throw ValidationErrorFactory({
                msg: "Invalid TicketType",
                statusCode: 401,
                type: "validation"
            }, "id")
        }

        return index;

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

export async function updateTicketType(this: IEvent, ticketTypesId: string, _newTicketTypes: ITicketTypesUpdateFrom): Promise<ITicketTypes | null> {

    try {
        const index = this.ticketTypes.findIndex((obj) => obj.id == new mongoose.Types.ObjectId(ticketTypesId));
        if (index == -1) {
            throw ValidationErrorFactory({
                msg: "Invalid TicketType",
                statusCode: 401,
                type: "validation"
            }, "id")
        }
        this.ticketTypes[index] = { ...this.ticketTypes[index], ...(_newTicketTypes as any) };
        await this.save();

        return this.ticketTypes[index];

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