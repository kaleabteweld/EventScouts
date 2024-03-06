import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from "../../src/Util/Factories";
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { createEvents, createOrganizer, eventPublicUrl, expectError, newValidCategory, newValidOrganizer, newValidOrganizer2, newValidUser, sighupUrl, eventPrivateUrl } from './common';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { UserType } from '../../src/Types';

const app = makeServer();

describe('TicketType', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Update TicketType", () => {
        var events: IEvent[] = [];
        var accessTokens: string[];


        beforeEach(async () => {
            const { accessTokens: ats } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;

            const { events: eves } = await createEvents(request, app, [newValidCategory, { name: "Category2" }], 2, accessTokens[0])
            events = eves;
        })

        describe("WHEN Login in as a Organizer", () => {

            describe("WHEN Organizer[1] try to update Organizer[0] TicketType", () => {

                it("SHOULD return 401 and error object", async () => {
                    const response = await request(app).patch(`${eventPrivateUrl()}update/ticketType/${events[0].id}/${events[0].ticketTypes[0].id}`).set('authorization', `Bearer ${accessTokens[1]}`).send({});
                    expectError(response, 401);
                })
            })

            describe("WHEN Organizer try to update there TicketType", () => {
                it("SHOULD update only one Attributes Not the rest and return 200 with the event", async () => {
                    let response = await request(app).patch(`${eventPrivateUrl()}update/ticketType/${events[0].id}/${events[0].ticketTypes[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                        type: "TEMP"
                    });
                    // console.log({ response: response.body });
                    response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                    // console.log({ response: response.body });
                    expect(response.body.body.ticketTypes[0].type).toBe("TEMP");
                });
            });

        });

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).patch(`${eventPrivateUrl()}update/ticketType/${events[0].id}/$  {events[0].ticketTypes[0].id}`).send({});
                expectError(response, 401);
            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var userAccessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    userAccessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).patch(`${eventPrivateUrl()}update/ticketType/${events[0].id}/$  {events[0].ticketTypes[0].id}`).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })

})