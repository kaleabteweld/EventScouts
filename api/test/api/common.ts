import { IOrganizerSignUpFrom } from "../../src/Domains/Organizer/types";
import { IUserSignUpFrom } from "../../src/Domains/User/types";
import { UserType } from "../../src/Types";

export const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;
export const loginUrl = (user: UserType, wallet: boolean = false) => `/Api/v1/public/authentication/${user}/login${wallet ? "/wallet" : ""}`;
export const refreshTokenUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/refreshToken`;
export const logoutUrl = (user: UserType) => `/Api/v1/private/authentication/${user}/logOut`;
export const verifyUserUrl = (key: string, user: UserType) => `/Api/v1/private/${user}/VerifyUser/${key}`;
export const forgotPasswordUrl = (key: string, value: string, newPassword: string, user: UserType) => `/Api/v1/public/authentication/${user}/forgotPassword/${key}/${value}/${newPassword}`;
export const eventUrl = () => `/Api/v1/private/event/`;


export const newValidOrganizer: IOrganizerSignUpFrom = {
    email: "test@test.com",
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
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