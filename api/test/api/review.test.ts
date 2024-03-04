import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from './util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { categoryPrivateUrl, categoryPublicUrl, createEvents, createOrganizer, createUser, eventPrivateUrl, eventPublicUrl, expectError, expectValidCategory, expectValidEvent, expectValidReview, newInValidTicketTypes, newValidCategory, newValidEvent, newValidOrganizer, newValidOrganizer2, newValidReview, newValidTicketType, newValidTicketTypes, newValidUser, reviewPrivateUrl, reviewPublicUrl, sighupUrl, userPrivateUrl } from './common';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { INewCategoryFrom } from '../../src/Domains/Category/types';
import { IReview } from '../../src/Schema/Types/review.schema.types';

const app = makeServer();

describe('Review', () => {

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe("Creating Review", () => {

        describe("WHEN Login in as a User", () => {
            var accessTokens: string[] = [];
            var categorys: ICategory[] = [];
            var events: IEvent[] = [];

            beforeEach(async () => {
                const { accessTokens: ats } = await createUser(request, app, [newValidUser]);
                accessTokens = ats;

                const categoryResponse = await request(app).post(categoryPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`).send(newValidCategory);
                categorys = [];
                categorys.push(categoryResponse.body.body);

                const { accessTokens: ats2 } = await createOrganizer(request, app, [newValidOrganizer]);

                const { events: evs } = await createEvents(request, app, [newValidCategory], 2, ats2[0]);
                events = evs;
            })

            describe("WHEN the Review is Valid", () => {
                it("SHOULD return a 200 status code AND review obj", async () => {

                    const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                        .send(newValidReview(events[0].id));

                    expectValidReview(response, newValidReview(events[0].id))
                });

                describe("WHEN Review is added to Events, Events", () => {
                    it("SHOULD set Events Review list", async () => {

                        const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidReview(events[0].id));

                        expectValidReview(response, newValidReview(events[0].id))

                        const reviewResponse = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3`).send();
                        expect(reviewResponse.status).toBe(200)

                        expect(reviewResponse.body.body.total).toBe(1)
                        expect(reviewResponse.body.body.reviews.length).toBeGreaterThan(0)
                        expect(reviewResponse.body.body.reviews.length).toBeLessThan(3)
                    });
                    it("SHOULD update Event avgRating and ratingCount", async () => {

                        var eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                        const avgRating = eventResponse.body.body.rating.avgRating;
                        const ratingCount = eventResponse.body.body.rating.ratingCount;

                        const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${accessTokens[0]}`)
                            .send(newValidReview(events[0].id));

                        expectValidReview(response, newValidReview(events[0].id))

                        eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();

                        expect(eventResponse.body.body.rating.ratingCount).toBeGreaterThan(ratingCount);
                        expect(eventResponse.body.body.rating.avgRating).toBe(
                            (avgRating * ratingCount + newValidReview(events[0].id).rating) / (ratingCount + 1)
                        )
                    });
                });
            });

        });

        describe("WHEN not Login in as a User", () => {
            it("SHOULD return a 401 status code AND Error obj", async () => {
                const response = await request(app).post(reviewPrivateUrl()).send({});
                expectError(response, 401);
            });

            // describe("WHEN Login in as a Organizer", () => {

            //     var user: IUser;
            //     var userAccessToken: string;

            //     beforeEach(async () => {
            //         const response = await request(app).post(sighupUrl(UserType.user)).send(newValidUser);
            //         user = response.body;
            //         userAccessToken = response.header.authorization.split(" ")[1];
            //     })

            //     it("SHOULD return a 401 status code AND Error obj", async () => {
            //         const response = await request(app).post(eventPrivateUrl()).set('authorization', `Bearer ${userAccessToken}`).send({});
            //         expectError(response, 401);
            //     })
            // })

        });

    });

    describe("Get Review", () => {

        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var organizerAccessTokens: string[];
        var userAccessTokens: string[];
        var reviews: IReview[] = [];


        beforeEach(async () => {

            const { accessTokens: ats } = await createUser(request, app, [newValidUser]);
            userAccessTokens = ats;

            const { accessTokens } = await createOrganizer(request, app, [newValidOrganizer]);
            organizerAccessTokens = accessTokens;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 2, organizerAccessTokens[0])
            categorys = cats;
            events = eves;

            reviews = [];
            const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                .send(newValidReview(events[0].id));
            reviews.push(response.body.body)
        })

        describe("WHEN trying to get Reviews by Pagination {skip}/{limit}", () => {

            it("SHOULD return a list of reviews Bigger then 1 and less then 3", async () => {
                const response = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3`).send();
                expect(response.status).toBe(200)

                expect(response.body.body.total).toBe(1)
                expect(response.body.body.reviews.length).toBeGreaterThan(0)
                expect(response.body.body.reviews.length).toBeLessThan(3)
            })

        });

        describe("WHEN trying to get Reviews by reviews id", () => {

            describe("WHEN trying to get Reviews by valid event id", () => {
                it("SHOULD return the Review with that id", async () => {

                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();
                    expectValidReview(response, newValidReview(events[0].id))
                })
            })

            describe("WHEN trying to get Review by InValid Review id", () => {
                it("SHOULD return 404 with error obj", async () => {
                    const response = await request(app).get(`${reviewPublicUrl()}byId/75cfba229d3e6fb530a1d4d5`).send();
                    expectError(response, 404);
                });
            })
        })

    });

    describe("Review Reaction", () => {

        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var organizerAccessTokens: string[];
        var userAccessTokens: string[];
        var reviews: IReview[] = [];


        beforeEach(async () => {

            const { accessTokens: ats } = await createUser(request, app, [newValidUser]);
            userAccessTokens = ats;

            const { accessTokens } = await createOrganizer(request, app, [newValidOrganizer]);
            organizerAccessTokens = accessTokens;

            const { categorys: cats, events: eves } = await createEvents(request, app, [newValidCategory], 2, organizerAccessTokens[0])
            categorys = cats;
            events = eves;

            reviews = [];
            const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                .send(newValidReview(events[0].id));
            reviews.push(response.body.body)
        })

        describe("WHEN trying to add a 👍 like Reaction", () => {

            it("SHOULD Increment the like Reaction counter ", async () => {
                const toggleReactResponse = await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                expectValidReview(response, newValidReview(events[0].id));
                expect(response.body.body.reactions.like.count).toBe(1)
            })

            describe("WHEN trying switch from 👍 like Reaction to a ❤️ love Reaction", () => {

                it("SHOULD decrement the 👍 like Reaction counter and Increment the ❤️ love Reaction counter", async () => {
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/love`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();

                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                    expectValidReview(response, newValidReview(events[0].id));
                    expect(response.body.body.reactions.like.count).toBe(0);
                    expect(response.body.body.reactions.love.count).toBe(1);
                })
            });

            describe("WHEN trying to toggle", () => {

                it("SHOULD decrement the like Reaction counter ", async () => {
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();

                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                    expectValidReview(response, newValidReview(events[0].id));
                    expect(response.body.body.reactions.like.count).toBe(0)
                })
                it("SHOULD remove user from the list", async () => {
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();
                    await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();

                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                    expectValidReview(response, newValidReview(events[0].id));
                    expect(response.body.body.reactedUsers.length).toBe(0);
                })
            });
        });

    });

});