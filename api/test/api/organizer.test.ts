import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { makeServer } from '../../src/Util/Factories';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from "../../src/Util/cache";
import request from "supertest";
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { createOrganizer, expectError, newValidOrganizer, newValidOrganizer2, userPrivateUrl } from './common';
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

});