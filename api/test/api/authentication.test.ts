import { IUserSignUpFrom } from "../../src/Domains/User/types";
import { UserType } from "../../src/Types";
import { makeServer } from "../../src/Util/Factories";
import Cache from "../../src/Util/cache";
import { connectDB, dropCollections, dropDB } from "./util";
import request from "supertest";
import { describe, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
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
    walletAccounts: []
};
const sighupUrl = (user: UserType) => `/Api/v1/public/authentication/${user}/signUp`;

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
    })
})