import { INewTicketTypesFrom } from "../TicketTypes/types"

export interface INewEventFrom {
    name: string
    posterURL: string
    description: String
    startDate: Date
    endDate: Date
    location: String
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
    location?: string
    ageRating?: string
    organizer?: string
    categorys?: string[]
    minPrice?: number
    maxPrice?: number
    search?: string
}