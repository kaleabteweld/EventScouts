import { INewCategoryFrom } from "../../src/Domains/Category/types";
import { IEventUpdateFrom, INewEventFrom } from "../../src/Domains/Event/types";
import { IOrganizerSignUpFrom } from "../../src/Domains/Organizer/types";
import { INewTicketTypesFrom } from "../../src/Domains/TicketTypes/types";
import { IUserSignUpFrom } from "../../src/Domains/User/types";
import { UserType } from "../../src/Types";

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
