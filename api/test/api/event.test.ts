import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { categoryPrivateUrl, categoryPublicUrl, createEvents, createOrganizer, eventPrivateUrl, eventPublicUrl, expectError, expectValidCategory, expectValidEvent, newInValidTicketTypes, newValidCategory, newValidEvent, newValidOrganizer, newValidOrganizer2, newValidTicketType, newValidTicketTypes, newValidUser, searchFactory, sighupUrl, userPrivateUrl } from './common';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { IEventSearchFrom } from '../../src/Domains/Event/types';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { encryptId, getEncryptedIdFromUrl } from '../../src/Util';

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
        var organizers: IOrganizer[] = [];


        beforeEach(async () => {
            const { accessTokens, organizers: orgs } = await createOrganizer(request, app, [newValidOrganizer]);
            accessToken = accessTokens[0];
            organizers = orgs;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 3, accessToken)
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

        describe("WHEN trying to get Events by event search", () => {

            describe("WHEN using unsupported inputs", () => {

                describe("WHEN using page [must start with one]", () => {
                    it("SHOULD 400 with error obj", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/0`).send(searchFactory({}));
                        expectError(response, 400);
                    })
                });

                describe("WHEN using organizer [must a ObjectID]", () => {

                    it("SHOULD 400 with error obj", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            organizer: "abc"
                        }));
                        expectError(response, 400);
                    })
                });

                describe("WHEN using categorys [must a ObjectID[]]", () => {

                    it("SHOULD 400 with error obj", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            categorys: ["as"]
                        }));
                        expectError(response, 400);
                    })
                });

                describe("WHEN using Location  [must set both longitude && latitude]", () => {
                    it("SHOULD 400 with error obj", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            location: {
                                latitude: 9.01017227324446,
                            }
                        }));
                        expectError(response, 400);
                    })
                })
            })

            describe("WHEN using supported inputs", () => {

                describe("WHEN using categorys which has nothing to do with the event", () => {
                    it("SHOULD []", async () => {
                        const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessToken}`).send({
                            name: "kolo"
                        });
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            categorys: [categoryResponse.body.body.id],
                        }));
                        expect(response.body.body).toEqual([]);
                    })
                });

                describe("WHEN using startDate", () => {
                    it("SHOULD returns every Event starting after given Date", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            startDate: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })

                    it("SHOULD returns [] if there events start before given Date", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            startDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
                        }));

                        expect(response.body.body).toEqual([]);
                    })
                });

                describe("WHEN using endDate", () => {
                    it("SHOULD returns every Event before the given Date", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            endDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
                        }));

                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })

                    it("SHOULD returns [] if there events ends after given Date", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            endDate: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000))
                        }));

                        expect(response.body.body).toEqual([]);
                    })
                });

                describe("WHEN using startDate and endDate", () => {
                    it("SHOULD returns every Event with the given range Date", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            startDate: new Date(new Date().getTime() - (7 * 24 * 60 * 60 * 1000)),
                            endDate: new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000))
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })
                });

                describe("WHEN using minPrice", () => {
                    it("SHOULD returns every Event having minimumTicketPrice > given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            minPrice: 1,
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })

                    it("SHOULD returns [] if there events minimumTicketPrice < given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            minPrice: Number.MAX_SAFE_INTEGER,
                        }));
                        expect(response.body.body).toEqual([]);
                    })
                })

                describe("WHEN using maxPrice", () => {
                    it("SHOULD returns every Event having minimumTicketPrice < given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            maxPrice: Number.MAX_SAFE_INTEGER,
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })

                    it("SHOULD returns [] if there events minimumTicketPrice > given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory(
                            {
                                maxPrice: 1,
                            }));
                        expect(response.body.body).toEqual([]);
                    })
                })

                describe("WHEN using minPrice and maxPrice", () => {
                    it("SHOULD returns every Event having minimumTicketPrice < given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            minPrice: 1,
                            maxPrice: Number.MAX_SAFE_INTEGER,
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1)
                    })

                    it("SHOULD returns [] if there events minimumTicketPrice > given price", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send({
                            search: {
                                maxPrice: 1,
                                minPrice: Number.MAX_SAFE_INTEGER,
                            } as IEventSearchFrom
                        });
                        expect(response.body.body).toEqual([]);
                    })
                })

                describe("WHEN using organizer", () => {
                    it("SHOULD returns every Event That's organized by the give Organizer", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            organizer: organizers[0].id
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1);

                        response.body.body.forEach((event: IEvent, index: number) => {
                            expect(event.organizer).toMatchObject({
                                organizer: organizers[0].id,
                                name: organizers[0].name,
                            })
                        })
                    })
                })

                describe.skip("WHEN using Full Text", () => {

                    it("SHOULD returns every Event That's has the term ", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            fullText: "1"
                        }));
                        expect(response.body.body.length).toBe(1);

                        response.body.body.forEach((event: IEvent, index: number) => {
                            expect(event.organizer).toMatchObject({
                                organizer: organizers[0].id,
                                name: organizers[0].name,
                            })
                        })
                    })
                })

                describe.skip("WHEN using Location", () => {

                    it("SHOULD returns every Event That's near the give cords with in 1000M", async () => {
                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            location: {
                                longitude: 9.006103214329574,
                                latitude: 38.79379827766147,
                            }
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(1);
                    })

                    it("SHOULD NOT returns every Event that are more then 1000M", async () => {

                        const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            location: {
                                longitude: 9.013449265859052,
                                latitude: 38.8369413669223,
                            }
                        }));
                        expect(response.body.body.length).toBeGreaterThanOrEqual(0);
                    })
                })

                // describe("WHEN using Sort", () => {
                //     it("SHOULD returns every Event Sorted by name in desc order", async () => {
                //         const response = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                //         }, {
                //             name: "desc"
                //         }));
                //         expect(response.body.body.length).toBeGreaterThanOrEqual(1);
                //         response.body.body.forEach((event: IEvent, index: number) => {
                //             expect(event.organizer).toMatchObject({
                //                 organizer: organizers[0].id,
                //                 name: organizers[0].name,
                //             })
                //         })

                //         const firstName = response.body.body[0].name;
                //         const secondName = response.body.body[1].name;

                //         expect(firstName > secondName).toBeTruthy();
                //     })
                // })

            });
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

                describe("When Event is removed, in category event count", () => {
                    it("SHOULD Decrement BY 1", async () => {

                        const preCategoryResponse = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();

                        let response = await request(app).delete(`${eventPrivateUrl()}remove/${events[0].id}`).set('authorization', `Bearer ${accessTokens[0]}`).send({});
                        expect(response.status).toBe(200);

                        const postCategoryResponse = await request(app).get(`${categoryPublicUrl()}byId/${categorys[0].id}?withEventCount=true`).send();

                        expect(preCategoryResponse.body.body.eventCount).toBeGreaterThan(postCategoryResponse.body.body.eventCount)
                        expect(preCategoryResponse.body.body.events.length).toBeGreaterThan(postCategoryResponse.body.body.events.length)
                    })
                })

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
        var organizers: IOrganizer[] = []


        beforeEach(async () => {
            const { accessTokens: ats, organizers: orgs } = await createOrganizer(request, app, [newValidOrganizer, newValidOrganizer2]);
            accessTokens = ats;
            organizers = orgs;

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
                    console.log({ response: response.body.body });
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

                describe("WHEN Organizer try to update there name, logoURL", () => {

                    it("SHOULD update organizer.name,organizer.logoURL on events that belong to the organizer", async () => {

                        await request(app).patch(`${userPrivateUrl(UserType.organizer)}update`).set('authorization', `Bearer ${accessTokens[0]}`).send({
                            name: "kolo",
                            logoURL: "https://www.facebook.com/kolo"
                        });

                        const eventsResponse = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                            organizer: organizers[0].id
                        }));
                        expect(eventsResponse.body.body.length).toBeGreaterThanOrEqual(1);

                        eventsResponse.body.body.forEach((event: IEvent, index: number) => {
                            expect(event.organizer).toMatchObject({
                                organizer: organizers[0].id,
                                name: 'kolo',
                                logoURL: 'https://www.facebook.com/kolo'
                            })
                        })
                    })
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

    describe("Events Shareable Link", () => {

        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var accessToken: string;
        var organizers: IOrganizer[] = [];


        beforeEach(async () => {
            const { accessTokens, organizers: orgs } = await createOrganizer(request, app, [newValidOrganizer]);
            accessToken = accessTokens[0];
            organizers = orgs;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 3, accessToken)
            categorys = cats;
            events = eves;
        })

        describe("WHEN event is returned", () => {
            it("SHOULD return event object with shareableLink", async () => {
                const response = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                expectValidEvent(response, categorys, undefined, {
                    name: "event 1",
                    shareableLink: `${process.env.SHAREABLE_LINK_BASE_URL ?? ""}/event/${encryptId(events[0].id)}`
                });
            })

            describe("WHEN using valid shareable Link to get event", () => {
                it("SHOULD return event object", async () => {
                    const id = getEncryptedIdFromUrl(events[0].shareableLink);

                    const response = await request(app).get(`${eventPublicUrl()}byId/${id}`).send();
                    expectValidEvent(response, categorys, undefined, {
                        name: "event 1",
                    });
                })
            });

            describe("WHEN using InValid shareable Link to get event", () => {
                it("SHOULD return error object", async () => {
                    const id = getEncryptedIdFromUrl("invalidUrl");
                    const response = await request(app).get(`${eventPublicUrl()}byId/${id}`).send();
                    expectError(response, 400);
                })
            });
        })



    });

});