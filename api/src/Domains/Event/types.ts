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
    organizer: string
    categorys: string[]
    ticketTypes: INewTicketTypesFrom[]
}

export interface IEventUpdateFrom extends Omit<Partial<INewEventFrom>, 'organizer'> {
}