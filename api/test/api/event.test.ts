import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { categoryPrivateUrl, categoryPublicUrl, createOrganizer, eventPrivateUrl, eventPublicUrl, expectError, expectValidCategory, expectValidEvent, newInValidTicketTypes, newValidCategory, newValidEvent, newValidOrganizer, newValidOrganizer2, newValidTicketType, newValidTicketTypes, newValidUser, sighupUrl, userPrivateUrl } from './common';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { INewCategoryFrom } from '../../src/Domains/Category/types';

const app = makeServer();

export const createEvents = async (request: Function, app: any, newValidCategorys: INewCategoryFrom[], eventCount: number = 2, accessToken: string): Promise<{ categorys: ICategory[], events: IEvent[] }> => {

    var categorys: ICategory[] = [];
    var events: IEvent[] = [];

    for (const validCategory of newValidCategorys) {
        const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send(validCategory);
        categorys.push(categoryResponse.body.body)
    }

    for (let index = 1; index < eventCount; index++) {
        var _response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessToken}`)
            .send(newValidEvent({ name: `event ${index}`, categorys: [...categorys.map((category => category.id))], ticketTypes: newValidTicketTypes }));

        events.push(_response.body.body)
    }

    return { events, categorys }

}
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

        describe("WHEN Login in as a Organizer", () => {
            var accessTokens: string[] = [];
            var categorys: ICategory[] = [];

            beforeEach(async () => {
                const { accessTokens: ats } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
                accessTokens = ats;

                const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`).send(newValidCategory);
                categorys = [];
                categorys.push(categoryResponse.body.body);
            })

            describe("WHEN the Event is Valid and Valid category and Valid ticket Types", () => {

                it("SHOULD return a 200 status code AND event obj With category and ticket Types", async () => {

                    const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                        .send(newValidEvent({ categorys: [categorys[0].id], ticketTypes: newValidTicketTypes }));

                    expectValidEvent(response, [categorys[0]]);

                });

                describe("WHEN the Event is Valid and Valid category Which is created by other organizers and Valid ticket Types", () => {

                    it("SHOULD return a 200 status code AND event obj With category and ticket Types", async () => {

                        const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessTokens[1]}`).send({ name: "Category2" });
                        categorys.push(categoryResponse.body.body);

                        const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidEvent({ categorys: [categorys[1].id], ticketTypes: newValidTicketTypes }));

                        expectValidEvent(response, [categorys[1]]);

                    });

                })

                describe("WHEN the Event is Valid and Valid category, Then the category", () => {
                    it("SHOULD return a 200 status code AND category obj With eventCount 1", async () => {

                        const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidEvent({ categorys: [categorys[0].id], ticketTypes: newValidTicketTypes }));

                        expectValidEvent(response, [categorys[0]]);

                        const categoryResponse = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();
                        expectValidCategory(categoryResponse, newValidCategory, {
                            eventCount: 1
                        });

                    });
                });

                describe("WHEN the Event is Valid and Valid category, Organizer", () => {
                    it("SHOULD  have events with new event in there", async () => {

                        const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidEvent({ categorys: [categorys[0].id], ticketTypes: newValidTicketTypes }));
                        expectValidEvent(response, [categorys[0]]);

                        const organizerResponse = await request(app).get(userPrivateUrl(UserType.organizer)).set("Authorization", `Bearer ${accessTokens[0]}`).send();
                        expect(organizerResponse.status).toBe(200);

                        expect(organizerResponse.body.body.events.length).toBeGreaterThan(0)

                    });
                });

            });

            describe.each([...Object.keys(newInValidTicketTypes)])(`WHEN %s in ticket Types is NOT valid`, (key) => {

                it("SHOULD return a 400 status code AND error obj", async () => {
                    const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                        .send(newValidEvent({ categorys: [categorys[0].id], ticketTypes: [(newInValidTicketTypes[key] as any)] }));

                    expectError(response, 400);
                })
            });

            describe("WHEN the Event is Valid and Valid category and sellingStartDate > event endDate", () => {
                it("SHOULD return a 400 status code AND error obj", async () => {

                    const response = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                        .send(newValidEvent({ categorys: [categorys[0].id], ticketTypes: [{ ...newValidTicketType, sellingStartDate: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)) }] }));

                    expectError(response, 400);
                });
            })

        });

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(eventPrivateUrl()).send({});
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
                    const response = await request(app).post(eventPrivateUrl()).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    });

    describe("Get Events", () => {

        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var accessToken: string;


        beforeEach(async () => {
            const { accessTokens } = await createOrganizer(request, app, [newValidOrganizer]);
            accessToken = accessTokens[0];

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 2, accessToken)
            categorys = cats;
            events = eves;
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

                    const response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                    expectValidEvent(response, categorys, undefined, {
                        name: "event 1"
                    });
                })
            })

            describe("WHEN trying to get Event by InValid event id", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const response = await request(app).get(`${eventPublicUrl()}byId/75cfba229d3e6fb530a1d4d5`).send();
                    expectError(response, 404);
                });
            })
        })

    });

    describe("Remove Events", () => {

        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var accessTokens: string[];


        beforeEach(async () => {
            const { accessTokens: ats } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 2, accessTokens[0])
            categorys = cats;
            events = eves;
        })

        describe("WHEN Login in as a Organizer", () => {

            describe("WHEN Organizer[1] try to remove Organizer[0]'s event", () => {

                it("SHOULD return 401 and error object", async () => {
                    const response = await request(app).delete(`${eventPrivateUrl()}remove/${events[0].id}`).set('authorization', `Bearer ${accessTokens[1]}`).send({});
                    expectError(response, 401);
                })
            })

            describe("WHEN Organizer try to remove there event", () => {
                it("SHOULD remove and return 200 with the event And get Event by id SHOULD remove and return 404", async () => {
                    let response = await request(app).delete(`${eventPrivateUrl()}remove/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({});
                    expect(response.status).toBe(200);

                    response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                    expect(response.status).toBe(404)

                });

            });

        });

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).delete(`${eventPrivateUrl()}remove/${events[0].id}`).send({});
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
                    const response = await request(app).delete(`${eventPrivateUrl()}remove/${events[0].id}`).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })

    describe("Update Events", () => {
        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var accessTokens: string[];


        beforeEach(async () => {
            const { accessTokens: ats } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory, { name: "Category2" }], 2, accessTokens[0])
            categorys = cats;
            events = eves;
        })

        describe("WHEN Login in as a Organizer", () => {

            describe("WHEN Organizer[1] try to update Organizer[0] event", () => {

                it("SHOULD return 401 and error object", async () => {
                    const response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${accessTokens[1]}`).send({});
                    expectError(response, 401);
                })
            })

            describe("WHEN Organizer try to update there event", () => {
                it("SHOULD update only one Attributes Not the rest and return 200 with the event", async () => {
                    let response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                        name: "updated Event"
                    });
                    response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();

                    expectValidEvent(response, categorys, null, { name: "updated Event" });
                });

                describe("WHEN update TicketTypes the minimumTicketPrice must be recalculated", () => {

                    it("SHOULD update only minimumTicketPrice Attributes to the new min and return 200 with the event", async () => {
                        let response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            name: "updated Event",
                            ticketTypes: [...newValidTicketTypes, newValidTicketType]
                        });

                        response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();

                        expectValidEvent(response, categorys, [...newValidTicketTypes, newValidTicketType], {
                            name: "updated Event",
                        });
                    });

                })

                describe("WHEN update the Event to reset it's category, Then the category", () => {
                    it("SHOULD return a 200 status code AND category obj With less events", async () => {

                        var eventResponse = await request(app).post(eventPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidEvent({ name: `temp`, categorys: [...categorys.map((category => category.id))], ticketTypes: newValidTicketTypes }));

                        var categoryResponse0 = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();
                        const initEvents = categoryResponse0.body.body.events.length;

                        const response = await request(app).patch(`${eventPrivateUrl()}update/${eventResponse.body.body.id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            name: "updated Event",
                            ticketTypes: [...newValidTicketTypes, newValidTicketType],
                            categorys: [categorys[1].id]
                        });

                        expectValidEvent(response, [categorys[1]], undefined, {
                            name: "updated Event",
                        });

                        categoryResponse0 = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();
                        const afterEvents = categoryResponse0.body.body.events.length;

                        expect(initEvents).toBeGreaterThan(afterEvents)

                    });
                });

                describe("WHEN update the Event TicketTypes sellingStartDate with sellingStartDate > event endDate", () => {
                    it("SHOULD return a 400 status code AND error obj", async () => {

                        const response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            ticketTypes: [{ ...newValidTicketType, sellingStartDate: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)) }],
                        });
                        expectError(response, 400);
                    });
                })

                describe("WHEN update the Event endDate with sellingStartDate > event endDate", () => {
                    it("SHOULD return a 400 status code AND error obj", async () => {

                        const response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            endDate: new Date(new Date().getTime() - 2 * (24 * 60 * 60 * 1000))
                        });
                        expectError(response, 400);
                    });
                })

            });

        });

        describe("WHEN not Login in as a Organizer", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).send({});
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
                    const response = await request(app).patch(`${eventPrivateUrl()}update/${events[0].id}`).set('authorization', `Bearer ${userAccessToken}`).send({});
                    expectError(response, 401);
                })
            })

        });

    })

});