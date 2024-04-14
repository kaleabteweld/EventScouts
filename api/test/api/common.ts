import { Response } from "supertest";
import { expect } from '@jest/globals';

import { INewCategoryFrom } from "../../src/Domains/Category/types";
import { IEventSearchFrom, IEventSortFrom, IEventUpdateFrom, INewEventFrom } from "../../src/Domains/Event/types";
import { IOrganizerSignUpFrom } from "../../src/Domains/Organizer/types";
import { INewTicketTypesFrom } from "../../src/Domains/TicketTypes/types";
import { IUserSignUpFrom } from "../../src/Domains/User/types";
import { IOrganizer } from "../../src/Schema/Types/organizer.schema.types";
import { UserType } from "../../src/Types";
import { ICategory } from "../../src/Schema/Types/category.schema.types";
import { IEvent, ILocation } from "../../src/Schema/Types/event.schema.types";
import { IUser } from "../../src/Schema/Types/user.schema.types";
import { INewReviewFrom } from "../../src/Domains/Review/types";
import { ITicketTypes } from "../../src/Schema/Types/ticketTypes.schema.types";

export const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;
export const loginUrl = (user: UserType, wallet: boolean = false) => `/Api/v1/public/authentication/${user}/login${wallet ? "/wallet" : ""}`;
export const refreshTokenUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/refreshToken`;
export const logoutUrl = (user: UserType) => `/Api/v1/private/authentication/${user}/logOut`;
export const verifyUserUrl = (key: string, user: UserType) => `/Api/v1/private/${user}/VerifyUser/${key}`;
export const forgotPasswordUrl = (key: string, value: string, newPassword: string, user: UserType) => `/Api/v1/public/authentication/${user}/forgotPassword/${key}/${value}/${newPassword}`;
export const userPrivateUrl = (user: UserType) => `/Api/v1/private/${user}/`;
export const userPublicUrl = (user: UserType) => `/Api/v1/public/${user}/`;
export const eventPrivateUrl = () => `/Api/v1/private/event/`;
export const eventPublicUrl = () => `/Api/v1/public/event/`;
export const categoryPrivateUrl = () => `/Api/v1/private/category/`;
export const categoryPublicUrl = () => `/Api/v1/public/category/`;
export const reviewPrivateUrl = () => `/Api/v1/private/review/`;
export const reviewPublicUrl = () => `/Api/v1/public/review/`;
export const ticketTypePrivateUrl = () => `/Api/v1/private/ticketType/`;
export const ticketTypePublicUrl = () => `/Api/v1/public/ticketType/`;
export const transactionPrivateUrl = () => `/Api/v1/private/transaction/`;




export const newValidOrganizer: IOrganizerSignUpFrom = {
    email: "test@test.com",
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
    logoURL: "http://localhost/organizer/b.png",
    walletAccounts: ["f0xA29D81C60A4840ed7f4ce55AE49190276721258B", "0xd0073923dc23eA1B04E84095576b62456053bB40"]
};

export const newValidOrganizer2: IOrganizerSignUpFrom = {
    email: "test2@test.com",
    name: "test2",
    password: "abcd123452",
    phone: "+2519000002",
    logoURL: "http://localhost/organizer/a.png",
    walletAccounts: ["0x591F2D5D72Ca5bB3de7590F017972191b5B15068", "0xf1E5a82e9Ed2FF6F34A12fa2C8171912D4736cd0"]

};

export const newValidUser: IUserSignUpFrom = {
    dateOfBirth: new Date(),
    email: "test@test.com",
    gender: 'male',
    name: "test",
    profilePic: "http://localhost/category/a.png",
    password: "abcd12345",
    phone: "+251900001",
    userName: "test",
    walletAccounts: ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
};
export const newValidUser2: IUserSignUpFrom = {
    dateOfBirth: new Date(),
    email: "test1@test.com",
    gender: 'male',
    name: "test1",
    profilePic: "http://localhost/category/a.png",
    password: "abcd12345",
    phone: "+251900000",
    userName: "test1",
    walletAccounts: ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
};

export const newValidCategory: INewCategoryFrom = {
    name: "Category"
}

export const newValidReview = (event: string, rating: number = 2, review = "good") => ({
    event,
    rating,
    review
}) as INewReviewFrom

type TNewValidEventArgs = { categorys?: string[], organizer?: string, ticketTypes?: INewTicketTypesFrom[], name?: string, location?: ILocation }

export const newValidEvent = ({ categorys = [], ticketTypes = [], name = "Category", location = { type: "Point", coordinates: [9.007544344601149, 38.798132727216654] } }: TNewValidEventArgs): INewEventFrom => ({
    categorys,
    description: "Category description",
    startDate: new Date(),
    endDate: new Date(),
    location,
    name,
    posterURL: "http://localhost/category/a.png",
    venue: "category venue",
    ageRating: "PEGI 18",
    ticketTypes
})

export const updateValidEvent = ({ categorys = [], ticketTypes = [], name = "Category", location = { type: "Point", coordinates: [9.007544344601149, 38.798132727216654] } }: TNewValidEventArgs): IEventUpdateFrom => ({
    categorys,
    description: "Event description",
    endDate: new Date(),
    startDate: new Date(),
    location,
    name,
    posterURL: "http://localhost/category/a.png",
    venue: "category venue",
    ticketTypes
})

export const newValidTicketTypes: INewTicketTypesFrom[] = [{
    posterURl: "https://example.com/poster1.jpg",
    type: "VIP",
    price: 100,
    sellingStartDate: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)),
    sellingEndDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
    description: "VIP ticket with special access.",
    maxNumberOfTickets: 10,

}, {
    posterURl: "https://example.com/poster2.jpg",
    type: "Standard",
    price: 50,
    sellingStartDate: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)),
    sellingEndDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
    description: "Standard ticket for general admission.",
}]

export const newValidTicketType: INewTicketTypesFrom = {
    posterURl: "https://example.com/poster3.jpg",
    type: "Standard",
    price: 10,
    sellingStartDate: new Date(new Date().getTime() - (24 * 60 * 60 * 1000)),
    sellingEndDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000)),
    description: "Standard ticket for general admission.",
}

export const newInValidTicketTypes: { [keys: string]: INewTicketTypesFrom } = {
    posterURlInvalid: {
        posterURl: "http:///a/a",
        type: "VIP",
        price: 100,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: 10,
    },
    type: {
        posterURl: "https://example.com/poster1.jpg",
        type: "",
        price: -1,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: 10,
    },
    description: {
        posterURl: "https://example.com/poster1.jpg",
        type: "",
        price: -1,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "",
        maxNumberOfTickets: 10,
    },
    price: {
        posterURl: "https://example.com/poster1.jpg",
        type: "VIP",
        price: -1,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: 10,
    },
    sellingEndDate: {
        posterURl: "https://example.com/poster1.jpg",
        type: "VIP",
        price: 100,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-02-01"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: 10,
    },
    maxNumberOfTickets: {
        posterURl: "https://example.com/poster1.jpg",
        type: "VIP",
        price: 100,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: -2,
    },
    onlineInvalid: {
        posterURl: "https://example.com/poster1.jpg",
        type: "VIP",
        price: 100,
        sellingStartDate: new Date("2024-03-01"),
        sellingEndDate: new Date("2024-03-31"),
        description: "VIP ticket with special access.",
        maxNumberOfTickets: 10,
        online: "http:///a/a"
    },
}

export const createOrganizer = async (request: Function, app: any, newValidOrganizers: IOrganizerSignUpFrom[]): Promise<{ organizers: IOrganizer[], accessTokens: string[] }> => {

    const organizers: IOrganizer[] = [];
    const accessTokens: string[] = [];

    for (let index = 0; index < newValidOrganizers.length; index++) {
        const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizers[index]);
        organizers.push(response.body);
        accessTokens.push(response.header.authorization.split(" ")[1])
    }

    return { organizers, accessTokens }
}
export const createUser = async (request: Function, app: any, newValidUsers: IUserSignUpFrom[]): Promise<{ users: IUser[], accessTokens: string[] }> => {

    const users: IUser[] = [];
    const accessTokens: string[] = [];

    for (let index = 0; index < newValidUsers.length; index++) {
        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUsers[index]);
        users.push(response.body);
        accessTokens.push(response.header.authorization.split(" ")[1])
    }

    return { users, accessTokens }
}

export const expectValidCategory = async (response: Response, ValidCategory: INewCategoryFrom, matchers?: Record<string, unknown> | Record<string, unknown>[]) => {

    expect(response.status).toBe(200);
    expect(response.body.body).toMatchObject({ ...ValidCategory, id: expect.any(String), ...matchers });
}
export const expectValidListCategory = async (response: Response, categorys: INewCategoryFrom[], minLen: number, maxLen: number, matchers?: Record<string, unknown> | Record<string, unknown>[]) => {

    expect(response.status).toBe(200)

    expect(response.body.body.length).toBeGreaterThan(minLen)
    expect(response.body.body.length).toBeLessThan(maxLen)
    response.body.body.forEach((category: ICategory, index: number) => {
        expect(category).toMatchObject(expect.objectContaining({ ...categorys[index], id: expect.any(String), ...matchers }));
    });
}
export async function expectValidEvent(response: Response, categorys: ICategory[], _newValidTicketTypes?: INewTicketTypesFrom[] | null, matchers?: Record<string, unknown> | Record<string, unknown>[]): Promise<void> {
    expect(response.status).toBe(200);

    _newValidTicketTypes = _newValidTicketTypes ?? newValidTicketTypes
    const received = response.body.body.ticketTypes;
    [..._newValidTicketTypes].map((newTicketType: any, index) => {
        const keys = Object.keys(newTicketType);
        const _newTicketType = { ...newTicketType }

        _newTicketType["sellingStartDate"] = (_newTicketType["sellingStartDate"] as Date).toISOString();
        _newTicketType["sellingEndDate"] = (_newTicketType["sellingEndDate"] as Date).toISOString();
        keys.forEach((key: string) => {
            expect(received[index][key]).toEqual(_newTicketType[key])
        })
    })

    response.body.body.categorys.forEach((category: ICategory, index: number) => {
        expect(category).toMatchObject(expect.objectContaining({ name: categorys[index].name, id: expect.any(String) }));
    });

    const validEvent = newValidEvent({ categorys: [...categorys.map((category => category.id))], ticketTypes: _newValidTicketTypes });
    delete (validEvent as any)["ticketTypes"]
    delete (validEvent as any)["categorys"]

    expect(response.body.body).toMatchObject({
        ...validEvent,
        // categorys: expect.arrayContaining(categorys),
        organizer: expect.objectContaining({ organizer: expect.any(String) }),
        // organizer: expect.any(String),
        startDate: expect.any(String),
        endDate: expect.any(String),
        minimumTicketPrice: Math.min(..._newValidTicketTypes.map(ticket => ticket.price)),
        ...matchers,
    });
}
export const expectError = async (response: Response, code: number) => {

    if (code == 400) {
        expect(response.status).toBe(code)
        expect(response.body.body).toBeUndefined();
        expect(response.body.error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
    } else {
        expect(response.status).toBe(code)
        expect(response.body.body).toBeUndefined();
        expect(response.body.error).toMatchObject({ msg: expect.any(String) });
    }
}

export const createEvents = async (request: Function, app: any, newValidCategorys: INewCategoryFrom[], eventCount: number = 2, accessToken: string): Promise<{ categorys: ICategory[], events: IEvent[] }> => {

    var categorys: ICategory[] = [];
    var events: IEvent[] = [];

    for (const validCategory of newValidCategorys) {
        const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(validCategory);
        categorys.push(categoryResponse.body.body)
    }

    for (let index = 1; index < eventCount; index++) {
        var _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
            .send(newValidEvent({ name: `event ${index}`, categorys: [...categorys.map((category => category.id))], ticketTypes: newValidTicketTypes }));

        events.push(_response.body.body)
    }

    return { events, categorys }

}

export const expectValidReview = async (response: Response, newValidReview: INewReviewFrom, matchers?: Record<string, unknown> | Record<string, unknown>[]) => {

    expect(response.status).toBe(200);
    expect(response.body.body).toMatchObject({ ...newValidReview, id: expect.any(String), ...matchers });
}

export const searchFactory = (search: IEventSearchFrom, sort?: IEventSortFrom) => ({
    search,
    sort
})

export async function expectValidUserTransaction(response: Response, event: IEvent, ticketType: ITicketTypes, amount: number, matchers?: Record<string, unknown> | Record<string, unknown>[]): Promise<void> {
    expect(response.status).toBe(200);

    expect(response.body.body).toMatchObject({
        event: expect.objectContaining({
            event: event.id,
            posterURL: event.posterURL,
            name: event.name,
            startDate: event.startDate,
            endDate: event.endDate,
            venue: event.venue,
        }),
        ticketType: expect.objectContaining({
            ticketType: ticketType.id,
            amount: amount,
        }),
        ...matchers
    });

}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));