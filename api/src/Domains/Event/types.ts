import { ILocation } from "../../Schema/Types/event.schema.types"
import { INewTicketTypesFrom } from "../TicketTypes/types"

export interface INewEventFrom {
    name: string
    posterURL: string
    description: String
    startDate: Date
    endDate: Date
    location: ILocation
    venue: String
    ageRating: String
    categorys: string[]
    ticketTypes: INewTicketTypesFrom[]
}

export interface IEventUpdateFrom extends Partial<INewEventFrom> {
}


export interface IEventSearchFrom {
    name?: string
    startDate?: Date
    endDate?: Date
    location?: {
        longitude?: number
        latitude?: number
    }
    ageRating?: string
    organizer?: string
    categorys?: string[]
    minPrice?: number
    maxPrice?: number
    search?: string
}

export interface IEventSortFrom {
    name?: 'asc' | 'desc'
    startDate?: 'asc' | 'desc'
    endDate?: 'asc' | 'desc'
    ageRating?: 'asc' | 'desc'
    organizer?: 'asc' | 'desc'
    categorys?: 'asc' | 'desc'
    minPrice?: 'asc' | 'desc'
    maxPrice?: 'asc' | 'desc'
}