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
}

export interface ITicketTypesUpdateFrom extends Partial<INewTicketTypesFrom> {
}