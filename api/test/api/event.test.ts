import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { categoryPrivateUrl, eventPrivateUrl, eventPublicUrl, newInValidTicketTypes, newValidCategory, newValidEvent, newValidOrganizer, newValidTicketTypes, newValidUser, sighupUrl } from './common';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { ITicketTypes } from '../../src/Schema/Types/ticketTypes.schema.types';
import { INewTicketTypesFrom } from '../../src/Domains/TicketTypes/types';

const app = makeServer();


describe('Event', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Creating Event", () => {

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(eventPrivateUrl()).send({});
                expect(response.status).toBe(401);
                expect(response.body.body).toBeUndefined();
                expect(response.body.error).toMatchObject({ msg: expect.any(String) });
            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var accessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    accessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).post(eventPrivateUrl()).set('authorization', `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(401);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                })
            })

        });

        describe("WHEN Login in as a Organizer", () => {
            var organizer: IOrganizer;
            var accessToken: string;

            beforeAll(async () => {
                const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                organizer = response.body;
                accessToken = response.header.authorization.split(" ")[1];
            })

            describe("WHEN the Event is Valid and Valid category and ticket Types", () => {

                var category: ICategory;

                beforeAll(async () => {
                    const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                    category = categoryResponse.body.body;
                });

                it("SHOULD return a 200 status code AND event obj With category and ticket Types", async () => {

                    const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                        .send(newValidEvent({ categorys: [category.id], ticketTypes: newValidTicketTypes }));

                    expect(response.status).toBe(200);

                    const received = response.body.body.ticketTypes;
                    newValidTicketTypes.map((newTicketType: any, index) => {
                        const keys = Object.keys(newTicketType);
                        newTicketType["sellingStartDate"] = newTicketType["sellingStartDate"].toISOString();
                        newTicketType["sellingEndDate"] = newTicketType["sellingEndDate"].toISOString();
                        keys.forEach((key: string) => {
                            expect(newTicketType[key]).toEqual(received[index][key])
                        })
                    })

                    expect(response.body.body).toMatchObject({
                        ...newValidEvent({ categorys: [category.id], ticketTypes: newValidTicketTypes }),
                        categorys: expect.arrayContaining([expect.objectContaining({ ...newValidCategory })]),
                        // organizer: expect.objectContaining({ organizer: expect.any(String) }),
                        organizer: expect.any(String),
                        startDate: expect.any(String),
                        endDate: expect.any(String),
                    });

                });



            });

            describe.each([...Object.keys(newInValidTicketTypes)])(`WHEN %s in ticket Types is NOT valid`, (key) => {
                var category: ICategory;

                beforeAll(async () => {
                    const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
                    category = categoryResponse.body.body;
                });

                it("SHOULD return a 400 status code AND error obj", async () => {
                    const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                        .send(newValidEvent({ categorys: [category.id], ticketTypes: [(newInValidTicketTypes[key] as any)] }));

                    expect(response.status).toBe(400);

                    const error = response.body.error;
                    expect(error).toBeTruthy();
                    expect(error).toMatchObject({ msg: expect.any(String), type: "validation", attr: expect.any(String) });

                })
            });

        });


    });

    describe("Get Events", () => {

        var category: ICategory;
        var event: IEvent[] = [];
        var accessToken: string;


        beforeEach(async () => {
            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            accessToken = response.header.authorization.split(" ")[1];

            const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
            category = categoryResponse.body.body;

            event = [];
            var _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                .send(newValidEvent({ categorys: [category.id], ticketTypes: newValidTicketTypes }));

            event.push(_response.body.body)

            _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                .send(newValidEvent({ name: "event 2", categorys: [category.id], ticketTypes: newValidTicketTypes }));

            event.push(_response.body.body)
        })

        describe("WHEN trying to get Event by Pagination {skip}/{limit}", () => {

            it("SHOULD return a list of events Bigger then 1 and less then 3", async () => {
                const response = await request(app).get(`${eventPublicUrl()}list/0/3`).send();
                expect(response.status).toBe(200)

                expect(response.body.body.length).toBeGreaterThan(0)
                expect(response.body.body.length).toBeLessThan(3)
            })

        });

        describe("WHEN trying to get Event by event id", () => {

            describe("WHEN trying to get Event by valid event id", () => {

                it("SHOULD return the Event with that id", async () => {

                    const response = await request(app).get(`${eventPublicUrl()}byId/${event[0].id}`).send();

                    expect(response.status).toBe(200)

                    const received = response.body.body.ticketTypes;
                    newValidTicketTypes.map((newTicketType: any, index) => {
                        const keys = Object.keys(newTicketType);
                        keys.forEach((key: string) => {
                            expect(newTicketType[key]).toEqual(received[index][key])
                        })
                    })

                    expect(response.body.body).toMatchObject({
                        ...newValidEvent({ categorys: [category.id], ticketTypes: newValidTicketTypes }),
                        categorys: expect.arrayContaining([expect.objectContaining({ ...newValidCategory })]),
                        // organizer: expect.objectContaining({ organizer: expect.any(String) }),
                        organizer: expect.any(String),
                        startDate: expect.any(String),
                        endDate: expect.any(String),
                    });

                })
            })

            describe("WHEN trying to get Event by InValid event id", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const response = await request(app).get(`${eventPublicUrl()}byId/75cfba229d3e6fb530a1d4d5`).send();

                    expect(response.status).toBe(404)

                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                });
            })
        })

    });

    describe("Remove Events", () => {
        var category: ICategory;
        var event: IEvent[] = [];
        var accessToken: string;


        beforeEach(async () => {
            const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
            accessToken = response.header.authorization.split(" ")[1];

            const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(newValidCategory);
            category = categoryResponse.body.body;

            event = [];
            var _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                .send(newValidEvent({ categorys: [category.id], ticketTypes: newValidTicketTypes }));

            event.push(_response.body.body)

            _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
                .send(newValidEvent({ name: "event 2", categorys: [category.id], ticketTypes: newValidTicketTypes }));

            event.push(_response.body.body)
        })

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).delete(`${eventPrivateUrl()}remove/${event[0].id}`).send({});
                expect(response.status).toBe(401);
                expect(response.body.body).toBeUndefined();
                expect(response.body.error).toMatchObject({ msg: expect.any(String) });
            });

            describe("WHEN Login in as a User", () => {

                var user: IUser;
                var accessToken: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
                    user = response.body;
                    accessToken = response.header.authorization.split(" ")[1];
                })

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).delete(`${eventPrivateUrl()}remove/${event[0].id}`).set('authorization', `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(401);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                })
            })

        });

        describe("WHEN Login in as a Organizer", () => {

            describe("WHEN Organizer 2 try to remove Organizer 1 event", () => {
                var accessTokensSecond: string;

                beforeEach(async () => {
                    const response = await request(app).post(sighupUrl(UserType.organizer)).send(newValidOrganizer);
                    accessTokensSecond = response.header.authorization.split(" ")[1];

                })
                it("SHOULD return 401 and error object", async () => {
                    const response = await request(app).delete(`${eventPrivateUrl()}remove/${event[0].id}`).set('authorization', `Bearer ${accessTokensSecond}`).send({});
                    expect(response.status).toBe(401);
                    expect(response.body.body).toBeUndefined();
                    expect(response.body.error).toMatchObject({ msg: expect.any(String) });
                })
            })

            describe("WHEN Organizer try to remove there event", () => {
                it("SHOULD remove and return 200 with the event", async () => {
                    let response = await request(app).delete(`${eventPrivateUrl()}remove/${event[0].id}`).set('authorization', `Bearer ${accessToken}`).send({});
                    expect(response.status).toBe(200);

                    response = await request(app).get(`${eventPublicUrl()}byId/${event[0].id}`).send();
                    expect(response.status).toBe(404)


                });
            });

        });

    })

});