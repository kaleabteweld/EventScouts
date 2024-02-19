import { Response } from "supertest";
import { INewCategoryFrom } from "../../src/Domains/Category/types";
import { IEventUpdateFrom, INewEventFrom } from "../../src/Domains/Event/types";
import { IOrganizerSignUpFrom } from "../../src/Domains/Organizer/types";
import { INewTicketTypesFrom } from "../../src/Domains/TicketTypes/types";
import { IUserSignUpFrom } from "../../src/Domains/User/types";
import { IOrganizer } from "../../src/Schema/Types/organizer.schema.types";
import { UserType } from "../../src/Types";
import { ICategory } from "../../src/Schema/Types/category.schema.types";

export const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;
export const loginUrl = (user: UserType, wallet: boolean = false) => `/Api/v1/public/authentication/${user}/login${wallet ? "/wallet" : ""}`;
export const refreshTokenUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/refreshToken`;
export const logoutUrl = (user: UserType) => `/Api/v1/private/authentication/${user}/logOut`;
export const verifyUserUrl = (key: string, user: UserType) => `/Api/v1/private/${user}/VerifyUser/${key}`;
export const forgotPasswordUrl = (key: string, value: string, newPassword: string, user: UserType) => `/Api/v1/public/authentication/${user}/forgotPassword/${key}/${value}/${newPassword}`;
export const eventPrivateUrl = () => `/Api/v1/private/event/`;
export const eventPublicUrl = () => `/Api/v1/public/event/`;
export const categoryPrivateUrl = () => `/Api/v1/private/category/`;
export const categoryPublicUrl = () => `/Api/v1/public/category/`;



export const newValidOrganizer: IOrganizerSignUpFrom = {
    email: "test@test.com",
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
};

export const newValidOrganizer2: IOrganizerSignUpFrom = {
    email: "test2@test.com",
    name: "test2",
    password: "abcd123452",
    phone: "+2519000002",
};

export const newValidUser: IUserSignUpFrom = {
    dateOfBirth: new Date(),
    email: "test@test.com",
    gender: 'male',
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
    userName: "test",
    walletAccounts: ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
};

export const newValidCategory: INewCategoryFrom = {
    name: "Category"
}

type TNewValidEventArgs = { categorys?: string[], organizer?: string, ticketTypes?: INewTicketTypesFrom[], name?: string }

export const newValidEvent = ({ categorys = [], organizer = "", ticketTypes = [], name = "Category" }: TNewValidEventArgs): INewEventFrom => ({
    categorys,
    organizer,
    description: "Category description",
    endDate: new Date(),
    startDate: new Date(),
    location: "category location",
    name,
    posterURL: "http://localhost/category/a.png",
    venue: "category venue",
    ageRating: "PEGI 18",
    ticketTypes
})

export const updateValidEvent = ({ categorys = [], ticketTypes = [], name = "Category" }: TNewValidEventArgs): IEventUpdateFrom => ({
    categorys,
    description: "Event description",
    endDate: new Date(),
    startDate: new Date(),
    location: "category location",
    name,
    posterURL: "http://localhost/category/a.png",
    venue: "category venue",
    ticketTypes
})

export const newValidTicketTypes: INewTicketTypesFrom[] = [{
    posterURl: "https://example.com/poster1.jpg",
    type: "VIP",
    price: 100,
    sellingStartDate: new Date("2024-03-01"),
    sellingEndDate: new Date("2024-03-31"),
    description: "VIP ticket with special access.",
    maxNumberOfTickets: 10,

}, {
    posterURl: "https://example.com/poster2.jpg",
    type: "Standard",
    price: 50,
    sellingStartDate: new Date("2024-03-01"),
    sellingEndDate: new Date("2024-03-15"),
    description: "Standard ticket for general admission.",
}]

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

export const expectValidCategory = async (expect: any, response: Response, ValidCategory: INewCategoryFrom) => {
    expect(response.status).toBe(200);
    expect(response.body.body).toMatchObject({ ...ValidCategory, id: expect.any(String) });
}

export const expectValidEvent = async (expect: any, response: Response, categorys: ICategory[], matchers?: Record<string, unknown> | Record<string, unknown>[]) => {
    expect(response.status).toBe(200);

    const received = response.body.body.ticketTypes;
    [...newValidTicketTypes].map((newTicketType: any, index) => {
        const keys = Object.keys(newTicketType);
        const _newTicketType = { ...newTicketType }

        _newTicketType["sellingStartDate"] = (_newTicketType["sellingStartDate"] as Date).toISOString();
        _newTicketType["sellingEndDate"] = (_newTicketType["sellingEndDate"] as Date).toISOString();
        keys.forEach((key: string) => {
            expect(received[index][key]).toEqual(_newTicketType[key])
        })
    })
    const validEvent = newValidEvent({ categorys: [...categorys.map((category => category.id))], ticketTypes: newValidTicketTypes });
    delete (validEvent as any)["ticketTypes"]

    expect(response.body.body).toMatchObject({
        ...validEvent,
        categorys: expect.arrayContaining(categorys),
        // organizer: expect.objectContaining({ organizer: expect.any(String) }),
        organizer: expect.any(String),
        startDate: expect.any(String),
        endDate: expect.any(String),
        ...matchers,
    });
}
export const expectError = async (expect: any, response: Response, code: number) => {

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