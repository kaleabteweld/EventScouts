import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { createEvents, createOrganizer, createUser, eventPrivateUrl, expectError, expectValidEvent, loginUrl, newValidCategory, newValidEvent, newValidOrganizer, newValidTicketTypes, newValidUser, sighupUrl, userPrivateUrl } from './common';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';

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

    describe("Follow", () => {
        var users: IUser[] = [];
        var organizers: IOrganizer[] = [];
        var userAccessTokens: string[];
        var organizerAccessTokens: string[];

        beforeEach(async () => {
            const { accessTokens: ats, users: usrs } = await createUser(request, app, [newValidUser]);
            const { accessTokens: ats2, organizers: orgs } = await createOrganizer(request, app, [newValidOrganizer]);
            userAccessTokens = ats;
            users = usrs
            organizerAccessTokens = ats2;
            organizers = orgs
        })

        describe("WHEN User trying to follow an Organizer", () => {

            it("SHOULD add the User to the Organizer list of Followers", async () => {
                const userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                expect(userResponse.status).toBe(200)
                expect(userResponse.body.body.followers).toContain(users[0].id)
                expect(userResponse.body.body.followersCount).toBe(1)
            });

            it("SHOULD add the Organizer to the User list of following", async () => {
                let userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                expect(userResponse.status).toBe(200)

                userResponse = await request(app).get(`${userPrivateUrl(UserType.user)}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                expect(userResponse.body.body.followingOrganizers[0]).toMatchObject({
                    name: organizers[0].name,
                    logoURL: organizers[0].logoURL,
                    organizer: organizers[0].id
                })
                expect(userResponse.body.body.followingCount).toBe(1)
            });

            describe("WHEN User is trying to follow BUT is a follower", () => {

                it("SHOULD remove the User on the Organizer list of Followers", async () => {
                    let userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    expect(userResponse.status).toBe(200)

                    userResponse = await request(app).get(`${userPrivateUrl(UserType.user)}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    expect(userResponse.body.body.followingOrganizers).not.toContain(organizers[0].id)
                    expect(userResponse.body.body.followingCount).toBe(0)
                });

                it("SHOULD remove the Organizer on the User list of following", async () => {
                    let userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    expect(userResponse.status).toBe(200)
                    expect(userResponse.body.body.followers).not.toContain(users[0].id)
                    expect(userResponse.body.body.followersCount).toBe(0)
                });
            })
        })
    })

    describe('Notification', () => {
        var users: IUser[] = [];
        var organizers: IOrganizer[] = [];
        var userAccessTokens: string[];
        var organizerAccessTokens: string[];
        var events: IEvent[] = [];

        beforeEach(async () => {
            const { accessTokens: ats, users: usrs } = await createUser(request, app, [newValidUser]);
            const { accessTokens: ats2, organizers: orgs } = await createOrganizer(request, app, [newValidOrganizer]);
            userAccessTokens = ats;
            users = usrs
            organizerAccessTokens = ats2;
            organizers = orgs

            const userResponse = await request(app).patch(`${userPrivateUrl(UserType.user)}follow/organizer/${organizers[0].id}`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
        })

        describe("WHEN Organizer Post an Event", () => {

            it("SHOULD add the Event to the User Notifications Queue", async () => {

                const { events: evs } = await createEvents(request, app, [newValidCategory], 2, organizerAccessTokens[0]);
                events = evs;

                const userResponse = await request(app).get(`${userPrivateUrl(UserType.user)}notifications/0/1`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                expect(userResponse.status).toBe(200)
                expect(userResponse.body.body.length).toBeGreaterThanOrEqual(1);
                expect(userResponse.body.body[0]).toMatchObject({
                    title: `new Event: \"${events[0].name}\" from ${organizers[0].name}`,
                    body: events[0].description,
                    organizer: organizers[0].id,
                    event: events[0].id
                })
            });
        })
    })
});