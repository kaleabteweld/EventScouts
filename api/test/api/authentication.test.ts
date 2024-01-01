import { IUserLogInFrom, IUserLogInFromWithWallet, IUserSignUpFrom } from "../../src/Domains/User/types";
import { UserType } from "../../src/Types";
import { makeServer } from "../../src/Util/Factories";
import Cache from "../../src/Util/cache";
import { connectDB, dropCollections, dropDB } from "./util";
import request from "supertest";
import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { verifyAccessToken, verifyRefreshToken } from "../../src/Domains/Common/utils";

const app = makeServer();

const newValidUser: IUserSignUpFrom = {
    dateOfBirth: new Date(),
    email: "test@test.com",
    gender: 'Male',
    name: "test",
    password: "abcd12345",
    phone: "+251900000",
    userName: "test",
    walletAccounts: ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
};
const ValidUserLogin: IUserLogInFrom = {
    email: "test@test.com",
    password: "abcd12345",
};
function validUserLoginWithWalletFactory(WalletIndex: "1" | "2" | "both" | "none"): IUserLogInFromWithWallet {
    var temp = [];
    const walletAccounts = ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5", "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
    if (WalletIndex == "1") temp.push(walletAccounts[0])
    if (WalletIndex == "2") temp.push(walletAccounts[1])
    if (WalletIndex == "1") temp = [...walletAccounts]
    return {
        walletAccounts: temp
    }
}
const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;
const loginUrl = (user: UserType, wallet: boolean = false) => `/Api/v1/public/authentication/${user}/login${wallet ? "/wallet" : ""}`;


describe('Authentication', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe('User Authentication', () => {

        describe("SignUp", () => {
            describe("WHEN user enters valid inputs THEN user sign up ", () => {

                it("Should return 200", async () => request(app).post(sighupUrl(UserType.user)).send(newValidUser).expect(200));

                it("Should return user obj", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });

                });

                describe("Should be valid Access Token in header WHEN user enters valid inputs", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        expect(accessToken).toBeTruthy();
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        const user = await verifyAccessToken(accessToken, UserType.user);
                        expect(user).toBeTruthy();
                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(user).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });

                describe("Should be valid Refresh token in header WHEN user enters valid inputs", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        expect(refreshToken).toBeTruthy();
                    });

                    it("Should be set in Cache", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const user: any = response.body;

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                        expect(user).toBeTruthy();
                        expect(cacheRefreshToken).toBe(refreshToken);
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const user = await verifyRefreshToken(refreshToken, UserType.user);

                        expect(user).toBeTruthy();
                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(user).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });
            })

            describe("WHEN user enters invalid inputs THEN user Dose NOT sign up ", () => {

                it("should return 418", async () => request(app).post(sighupUrl(UserType.user)).send({}).expect(418));

                it("should return Validation error message", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    expect(response.body.body).toBeUndefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("should not set Authentication header", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });
        })

        describe("Login", () => {

            beforeEach(() => {
                return request(app).post(sighupUrl(UserType.user)).send(newValidUser)
            });

            describe("WHEN user enters valid inputs THEN user login ", () => {

                it("Should return 200", async () => request(app).post(loginUrl(UserType.user)).send(ValidUserLogin).expect(200));

                it("Should return user obj", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);

                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                });

                describe("WHEN user enters valid inputs THEN Authentication header is set", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        expect(accessToken).toBeTruthy();
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("authorization");

                        const accessToken = response.header.authorization.split(" ")[1];
                        const user = await verifyAccessToken(accessToken, UserType.user);
                        expect(user).toBeTruthy();

                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(response.body.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                    });

                });

                describe("WHEN user enters valid inputs THEN Refresh token is set", () => {

                    it("Should be set", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        expect(refreshToken).toBeTruthy();
                    });

                    it("Should be set in Cache", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");

                        const user: any = response.body.body;

                        const refreshToken = response.header.refreshtoken.split(" ")[1];
                        const cacheRefreshToken = await Cache.getRefreshToken(user.id);

                        expect(user).toBeTruthy();

                        const newUser = { ...newValidUser }
                        delete (newUser as any).password;
                        expect(response.body.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });

                        expect(cacheRefreshToken).toBe(refreshToken);
                    });

                    it("Should be valid", async () => {
                        const response = await request(app).post(loginUrl(UserType.user)).send(ValidUserLogin);
                        expect(response.header).toHaveProperty("refreshtoken");
                    });



                });
            });

            describe("WHEN user enters invalid inputs THEN user login ", () => {

                it("should return 418", async () => request(app).post(loginUrl(UserType.user)).send({}).expect(418));

                it("Should return Validation error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.body.body).toBeUndefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("Should return Invalid Email or Password error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({ email: "abc1@gmail.com", password: "12345678" });
                    expect(response.body.body).toBeUndefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: "Invalid Email or Password", type: expect.any(String) });
                });

                it("Should not set Authentication header", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });
        });

        describe("Login With Wallet Address", () => {

            beforeEach(() => {
                return request(app).post(sighupUrl(UserType.user)).send(newValidUser)
            });

            describe("WHEN user enters valid inputs THEN user login ", () => {

                it.each(
                    ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5",
                        "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
                )("Should LogIn with any Wallet", async (wallet) => request(app).post(loginUrl(UserType.user, true)).send({
                    walletAccounts: [wallet]
                }).expect(200));

                it.each(
                    ["fdd3d4ad2a1c88bfa0e44e18bf4b04886d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758fd7253a56df6f61cb93d0178d063cf79e602f5",
                        "07f153aae615da277f12fc6d891d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb95737247fd3edfc94d3b33bb49a7432dcc838ba7a8fed5e015b"]
                )("Should return user obj", async (wallet) => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({
                        walletAccounts: [wallet]
                    });

                    const newUser = { ...newValidUser }
                    delete (newUser as any).password;
                    expect(response.body.body).toMatchObject({ ...newUser, dateOfBirth: expect.any(String) });
                });

            });

            describe("WHEN user enters invalid inputs THEN user login ", () => {

                it("should return 418", async () => request(app).post(loginUrl(UserType.user, true)).send({}).expect(418));

                it("Should return Validation error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({});
                    expect(response.body.body).toBeUndefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });
                });

                it("Should return Invalid Wallet Address error message", async () => {
                    const response = await request(app).post(loginUrl(UserType.user, true)).send({ walletAccounts: ["86d28dc7ecaa47a838b4f1dee8eb551afdd859c926ab9b8001bdc3fb758d143ece72cbb4d9c4d12170b6b7ac78d53f4acb177511c67cb9573"] });
                    expect(response.body.body).toBeUndefined();

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: "Invalid Wallet Address", type: expect.any(String) });
                });

                it("Should not set Authentication header", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("authorization");
                });

                it("should not set Refresh token", async () => {
                    const response = await request(app).post(loginUrl(UserType.user)).send({});
                    expect(response.header).not.toHaveProperty("refreshtoken");
                });

            });


        });
    })
})