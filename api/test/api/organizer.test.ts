import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { makeServer } from '../../src/Util/Factories';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from "../../src/Util/cache";
import request from "supertest";
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { createOrganizer, expectError, loginUrl, newValidOrganizer, newValidOrganizer2, userPrivateUrl } from './common';
import { UserType } from '../../src/Types';



const app = makeServer();


describe('Organizer', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {

        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Get Organizer", () => {

        var organizers: IOrganizer[] = [];
        var accessTokens: string[] = [];


        beforeEach(async () => {
            const { accessTokens: ats, organizers: ogs } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;
            organizers = organizers;
        })

        describe("WHEN trying to get Organizer by there ID in JWT", () => {

            describe("WHEN trying to get Organizer by valid organizer id", () => {
                it("SHOULD return the Organizer with that id", async () => {

                    const organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                    expect(organizerResponse.status).toBe(200);

                    const checkValidOrganizer = { ...newValidOrganizer }
                    delete (checkValidOrganizer as any)["password"]
                    expect(organizerResponse.body.body).toMatchObject({
                        ...checkValidOrganizer,
                        id: expect.any(String)
                    })
                })
            })

            describe("WHEN trying to get Organizer by InValid organizer id", () => {
                it("SHOULD return 401 with error obj", async () => {
                    const organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).send();
                    expectError(organizerResponse, 401);
                });

                describe("WHEN trying to get Organizer by InValid JWT", () => {
                    it("SHOULD return 401 with error obj", async () => {

                        const invalidKWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
                        const organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${invalidKWT}`).send();
                        expectError(organizerResponse, 401);

                    })
                })
            })
        })

    });

    describe("Wallet", () => {
        var organizers: IOrganizer[] = [];
        var accessTokens: string[] = [];


        beforeEach(async () => {
            const { accessTokens: ats, organizers: ogs } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;
            organizers = organizers;
        })

        describe("WHEN connecting a Wallet", () => {
            it("SHOULD add it to the list", async () => {
                const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/connect/${"0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7"}`).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                const _organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessTokens[0]}`).send();

                expect(organizerResponse.status).toBe(200);
                expect((_organizerResponse.body.body.walletAccounts as String[]).includes("0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7")).toBe(true);

                const checkValidOrganizer = { ...newValidOrganizer }
                delete (checkValidOrganizer as any)["password"]
                delete (checkValidOrganizer as any)["walletAccounts"];

                expect(_organizerResponse.body.body).toMatchObject({
                    ...checkValidOrganizer,
                    id: expect.any(String)
                })
            })

            it("SHOULD be able to login with new wallet", async () => {
                const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/connect/${"0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7"}`).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                const _organizerResponse = await request(app).post(loginUrl(UserType.organizer, true)).send({
                    walletAccounts: ["0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7"]
                })
                expect(organizerResponse.status).toBe(200);
                expect(_organizerResponse.status).toBe(200);
                expect((_organizerResponse.body.walletAccounts as String[]).includes("0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7")).toBe(true);

                const checkValidOrganizer = { ...newValidOrganizer }
                delete (checkValidOrganizer as any)["password"]
                delete (checkValidOrganizer as any)["walletAccounts"];

                expect(_organizerResponse.body).toMatchObject({
                    ...checkValidOrganizer,
                    id: expect.any(String)
                })
            })

            describe("WHEN connecting a Wallet With out authentication", () => {
                it("SHOULD return 401 with error obj", async () => {
                    const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/connect/${"0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cEa7"}`).send();
                    expectError(organizerResponse, 401);
                });
            })
        })

        describe("WHEN disconnecting a Wallet", () => {
            const wallet = newValidOrganizer.walletAccounts[0];
            it("SHOULD remove it to the list", async () => {
                const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/disconnect/${wallet}`).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                const _organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessTokens[0]}`).send();

                expect(organizerResponse.status).toBe(200);
                expect((_organizerResponse.body.body.walletAccounts as String[]).includes(wallet)).toBe(false);

                const checkValidOrganizer = { ...newValidOrganizer }
                delete (checkValidOrganizer as any)["password"]
                delete (checkValidOrganizer as any)["walletAccounts"];

                expect(_organizerResponse.body.body).toMatchObject({
                    ...checkValidOrganizer,
                    id: expect.any(String)
                })
            })
            it("SHOULD be Not able to login with new wallet", async () => {
                const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/disconnect/${wallet}`).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                const _organizerResponse = await request(app).post(loginUrl(UserType.organizer, true)).send({
                    walletAccounts: [wallet]
                })
                expectError(_organizerResponse, 404);

            })

            describe("WHEN removing a Wallet With out authentication", () => {
                it("SHOULD return 401 with error obj", async () => {
                    const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/disconnect/${wallet}`).send();
                    expectError(organizerResponse, 401);
                });
            })
            describe("WHEN removing a Wallet which dose not exist", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const organizerResponse = await request(app).patch(`${userPrivateUrl(UserType.organizer)}wallet/disconnect/${"0xA32bd67037Dd8F3A0EAE8BcB2254AA300319cE7a"}`).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                    const _organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessTokens[0]}`).send();

                    expectError(organizerResponse, 404);
                    expect(_organizerResponse.body.body.walletAccounts.length).toBe(newValidOrganizer.walletAccounts.length)
                });
            })
        })
    })
});