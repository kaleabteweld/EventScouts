export interface INewTicketTypesFrom {
    posterURl?: string,
    type: string,
    price: number
    sellingStartDate: Date
    sellingEndDate: Date
    maxNumberOfTickets?: number
    description: string,
    refundable?: boolean,
    online?: string,
    transactionHash?: string
}

export interface ITicketTypesUpdateFrom extends Partial<INewTicketTypesFrom> {
}

export interface IBoughTicket {
    ticketType: any,
    amount: number
}