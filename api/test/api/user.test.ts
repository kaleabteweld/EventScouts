import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { createUser, expectError, loginUrl, newValidOrganizer, newValidUser, sighupUrl, userPrivateUrl } from './common';

const app = makeServer();

describe('User', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Get", () => {

        var users: IUser[] = [];
        var accessTokens: string[];

        beforeEach(async () => {
            const { accessTokens: ats, users: usrs } = await createUser(request, app, [newValidUser]);
            accessTokens = ats;
            users = usrs

        })

        describe("WHEN trying to get User by there ID in JWT", () => {

            describe("WHEN trying to get User by valid User id", () => {

                it("SHOULD return the User with that id", async () => {

                    const userResponse = await request(app).get(userPrivateUrl(UserType.user)).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                    expect(userResponse.status).toBe(200);

                    const checkValidUser = { ...newValidUser }
                    delete (checkValidUser as any)["password"]
                    expect(userResponse.body.body).toMatchObject({ ...checkValidUser, dateOfBirth: expect.any(String) });
                })
            })

            describe("WHEN trying to get Organizer by InValid organizer id", () => {

                it("SHOULD return 401 with error obj", async () => {
                    const userResponse = await request(app).get(userPrivateUrl(UserType.user)).send();
                    expectError(userResponse, 401);
                });

                describe("WHEN trying to get Organizer by InValid JWT", () => {
                    it("SHOULD return 401 with error obj", async () => {

                        const invalidKWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                        const userResponse = await request(app).get(userPrivateUrl(UserType.user)).set("Authorization", `Bearer ${invalidKWT}`).send();
                        expectError(userResponse, 401);

                    })
                })
            })
        })

    });

    describe("Remove", () => {

        var users: IUser[] = [];
        var accessTokens: string[];

        beforeEach(async () => {
            const { accessTokens: ats, users: usrs } = await createUser(request, app, [newValidUser]);
            accessTokens = ats;
            users = usrs

        })

        describe("WHEN Login in as a User", () => {

            describe("WHEN user try to remove Them self", () => {

                it("SHOULD remove and return 200", async () => {
                    let response = await request(app).delete(`${userPrivateUrl(UserType.user)}remove`).set('authorization', `Bearer ${accessTokens[0]}`).send({});
                    expect(response.status).toBe(200);

                    response = await request(app).get(`${userPrivateUrl(UserType.user)}`).send();
                    expect(response.status).toBe(401)

                });

            });

        });

        describe("WHEN not Login in as a User", () => {

            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).delete(`${userPrivateUrl(UserType.user)}remove`).send({});
                expectError(response, 401);
            });

            describe("WHEN Login in as a User", () => {

                var organizerAccessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    organizerAccessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).delete(`${userPrivateUrl(UserType.user)}remove`).set('authorization', `Bearer ${organizerAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })

    describe("Update", () => {

        var users: IUser[] = [];
        var accessTokens: string[];

        beforeEach(async () => {
            const { accessTokens: ats, users: usrs } = await createUser(request, app, [newValidUser]);
            accessTokens = ats;
            users = usrs

        })

        describe("WHEN Login in as a User", () => {

            describe("WHEN user try to update there info", () => {

                it("SHOULD update only one Attributes Not the rest and return 200", async () => {
                    let response = await request(app).patch(`${userPrivateUrl(UserType.user)}update`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                        name: "kolo"
                    });
                    const userResponse = await request(app).get(userPrivateUrl(UserType.user)).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                    const checkValidUser = { ...newValidUser }
                    delete (checkValidUser as any)["password"];

                    expect(userResponse.body.body).toMatchObject({ ...checkValidUser, dateOfBirth: expect.any(String), name: "kolo" });
                });

                describe("WHEN user try to update there Password", () => {

                    it("SHOULD update password and Not Login with old password", async () => {
                        let response = await request(app).patch(`${userPrivateUrl(UserType.user)}update`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            password: "password123321"
                        });
                        const userResponse = await request(app).post(loginUrl(UserType.user)).set("Authorization", `Bearer ${accessTokens[0]}`).send({
                            email: users[0].email,
                            password: users[0].password
                        });

                        expectError(userResponse, 400)

                    });

                    it("SHOULD update password and only Login with new password", async () => {
                        await request(app).patch(`${userPrivateUrl(UserType.user)}update`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            password: "password123321"
                        });
                        const userResponse = await request(app).post(loginUrl(UserType.user)).send({
                            email: users[0].email,
                            password: "password123321"
                        });
                        console.log({ userResponse: userResponse.body })

                        expect(userResponse.status).toBe(200)

                    });

                });

            });

        });

        describe("WHEN not Login in as a Organizer", () => {

            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).patch(`${userPrivateUrl(UserType.user)}update`).send({});
                expectError(response, 401);
            });

            describe("WHEN Login in as a Organizer", () => {

                var user: IUser;
                var organizerAccessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    user = response.body;
                    organizerAccessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).patch(`${userPrivateUrl(UserType.user)}update`).set('authorization', `Bearer ${organizerAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })

});