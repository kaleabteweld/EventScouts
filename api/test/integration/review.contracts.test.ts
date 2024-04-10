import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from '../api/util';
import Cache from '../../src/Util/cache';
import request from "supertest";
import { makeServer } from '../../src/Util/Factories';
import { createEvents, createOrganizer, createUser, eventPublicUrl, expectError, newValidUser2, expectValidReview, newValidCategory, newValidOrganizer, newValidReview, newValidUser, reviewPrivateUrl, reviewPublicUrl, transactionPrivateUrl, userPrivateUrl } from '../api/common';
import { UserType } from '../../src/Types';
import { IUser } from '../../src/Schema/Types/user.schema.types';
import { ICategory } from '../../src/Schema/Types/category.schema.types';
import { IEvent } from '../../src/Schema/Types/event.schema.types';
import { INewCategoryFrom } from '../../src/Domains/Category/types';
import { IReview } from '../../src/Schema/Types/review.schema.types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Contract } from 'ethers';
import { IOrganizer } from '../../src/Schema/Types/organizer.schema.types';
import { ethers } from "hardhat";
import { dollarsToWei } from './common';


const app = makeServer();

describe('Review', () => {

    const name = "TicketToken";
    const symbol = "TT";

    beforeAll(() => {
        return Promise.all([connectDB(), Cache.connect()]);
    });

    afterAll(() => {
        return Promise.all([dropDB(), Cache.disconnect()]);
    });

    afterEach(async () => {
        return await dropCollections();
    });

    describe('Integration', () => {
        var owner: SignerWithAddress;
        var buyer: SignerWithAddress;
        var buyer2: SignerWithAddress;
        var contract: Contract;
        var accessTokens: string[] = [];
        var organizers: IOrganizer[] = [];
        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var users: IUser[] = [];
        var userAccessTokens: string[] = [];


        beforeEach(async function () {
            [owner, buyer, buyer2] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);

            const { accessTokens: ats, organizers: orgs } = await createOrganizer(request, app, [{ ...newValidOrganizer, walletAccounts: [owner.address] }]);
            accessTokens = ats;
            organizers = orgs;

            const { events: evs, categorys: cats } = await createEvents(request, app, [newValidCategory], 2, accessTokens[0]);
            events = evs;
            categorys = cats

            const { accessTokens: uts, users: usr } = await createUser(request, app, [{ ...newValidUser, walletAccounts: [buyer.address] }, { ...newValidUser2, walletAccounts: [buyer2.address] }]);
            userAccessTokens = uts;
            users = usr;

            await contract.addTicketTypeCost(events[0].ticketTypes[0].id, events[0].id, dollarsToWei(events[0].ticketTypes[0].price), events[0].ticketTypes[0].maxNumberOfTickets);
        });

        describe("Creating Review", () => {

            describe("WHEN Login in as a User", () => {

                describe("WHEN the Review is Valid", () => {

                    describe("WHEN User Has a Ticket", () => {

                        it("SHOULD return a 200 status code AND review obj", async () => {

                            const amount = 1;
                            const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                            expect(mint).toBeTruthy();
                            await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                                eventId: events[0].id,
                                ticketType: events[0].ticketTypes[0].id,
                                amount: amount,
                                mintHash: mint.hash
                            });


                            const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                                .send(newValidReview(events[0].id));
                            expectValidReview(response, newValidReview(events[0].id))
                        });

                        describe("WHEN Review is added to Events, Events", () => {

                            it("SHOULD set Events Review list", async () => {

                                const amount = 1;
                                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                                expect(mint).toBeTruthy();
                                await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                                    eventId: events[0].id,
                                    ticketType: events[0].ticketTypes[0].id,
                                    amount: amount,
                                    mintHash: mint.hash
                                });
                                const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                                    .send(newValidReview(events[0].id));

                                expectValidReview(response, newValidReview(events[0].id))

                                const reviewResponse = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3`).send();
                                expect(reviewResponse.status).toBe(200)

                                expect(reviewResponse.body.body.reviews.length).toBeGreaterThan(0)
                                expect(reviewResponse.body.body.reviews.length).toBeLessThan(3)
                            });

                            it("SHOULD update Event avgRating and ratingCount", async () => {

                                const amount = 1;

                                var eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                                const avgRating = eventResponse.body.body.rating.avgRating;
                                const ratingCount = eventResponse.body.body.rating.ratingCount;

                                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                                expect(mint).toBeTruthy();
                                await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                                    eventId: events[0].id,
                                    ticketType: events[0].ticketTypes[0].id,
                                    amount: amount,
                                    mintHash: mint.hash
                                });
                                const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                                    .send(newValidReview(events[0].id));

                                expectValidReview(response, newValidReview(events[0].id))

                                eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();

                                expect(eventResponse.body.body.rating.ratingCount).toBeGreaterThan(ratingCount);
                                expect(eventResponse.body.body.rating.avgRating).toBe(
                                    (avgRating * ratingCount + newValidReview(events[0].id).rating) / (ratingCount + 1)
                                )
                            });

                            it("SHOULD update Event totalReviews", async () => {

                                const amount = 1;

                                var eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                                const totalReviews = eventResponse.body.body.totalReviews;

                                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                                expect(mint).toBeTruthy();
                                await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                                    eventId: events[0].id,
                                    ticketType: events[0].ticketTypes[0].id,
                                    amount: amount,
                                    mintHash: mint.hash
                                });
                                const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                                    .send(newValidReview(events[0].id));

                                expectValidReview(response, newValidReview(events[0].id))

                                eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();

                                expect(eventResponse.body.body.totalReviews).toBeGreaterThan(totalReviews);
                            });
                        });
                    })

                    describe("WHEN User Dose not have a Ticket", () => {

                        it("SHOULD return a 400 status code AND review obj", async () => {

                            const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                                .send(newValidReview(events[0].id));
                            expectError(response, 400);
                        });
                    })
                });

            });

            describe("WHEN not Login in as a User", () => {

                it("SHOULD return a 401 status code AND Error obj", async () => {
                    const response = await request(app).post(reviewPrivateUrl()).send({});
                    expectError(response, 401);
                });

                describe("WHEN Login in as a Organizer", () => {

                    it("SHOULD return a 401 status code AND Error obj", async () => {
                        const response = await request(app).post(reviewPrivateUrl()).set('authorization', `Bearer ${accessTokens[0]}`).send({});
                        expectError(response, 401);
                    })
                })

            });

        });

        describe("Get Review", () => {

            var reviews: IReview[] = [];

            beforeEach(async () => {

                const amount = 1;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                expect(mint).toBeTruthy();
                await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                    eventId: events[0].id,
                    ticketType: events[0].ticketTypes[0].id,
                    amount: amount,
                    mintHash: mint.hash
                });

                reviews = [];
                const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                    .send(newValidReview(events[0].id));
                reviews.push(response.body.body)
            })

            describe("WHEN trying to get Reviews by Pagination {skip}/{limit}", () => {

                it("SHOULD return a list of reviews Bigger then 1 and less then 3", async () => {
                    const response = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3`).send();
                    expect(response.status).toBe(200)

                    expect(response.body.body.reviews.length).toBeGreaterThan(0)
                    expect(response.body.body.reviews.length).toBeLessThan(3)
                })

                describe("WHEN trying to get Reviews with includeAuthor flag true", () => {

                    it("SHOULD return a list of reviews With Author set", async () => {
                        const response = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3?includeAuthor=true`).send();
                        expect(response.status).toBe(200);

                        expect(response.body.body.reviews[0].user).toMatchObject({ id: users[0].id, userName: users[0].userName, profilePic: users[0].profilePic });
                        expect(response.body.body.reviews.length).toBeGreaterThan(0)
                        expect(response.body.body.reviews.length).toBeLessThan(3)
                    })
                })

                describe("WHEN trying to get Reviews with includeReactedUsers flag true and includeAuthor flag true", () => {

                    it("SHOULD return a list of reviews With includeReactedUsers set and Author set", async () => {

                        const amount = 1;
                        const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                        await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send({
                            eventId: events[0].id,
                            ticketType: events[0].ticketTypes[0].id,
                            amount: amount,
                            mintHash: mint.hash
                        });
                        const toggleReactResponse = await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();

                        const response = await request(app).get(`${reviewPublicUrl()}list/${events[0].id}/0/3?includeAuthor=true&includeReactedUsers=true`).send();
                        expect(response.status).toBe(200);

                        expect(response.body.body.reviews[0].user).toMatchObject({ id: users[0].id, userName: users[0].userName, profilePic: users[0].profilePic });
                        expect(response.body.body.reviews[0].reactedUsers[0].user).toMatchObject({ id: users[1].id, userName: users[1].userName, profilePic: users[1].profilePic });
                        expect(response.body.body.reviews.length).toBeGreaterThan(0)
                        expect(response.body.body.reviews.length).toBeLessThan(3)

                    });
                })

            });

            describe("WHEN trying to get Reviews by reviews id", () => {

                describe("WHEN trying to get Reviews by valid event id", () => {

                    it("SHOULD return the Review with that id", async () => {
                        const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();
                        expectValidReview(response, newValidReview(events[0].id))
                    })

                    describe("WHEN trying to get Reviews with includeAuthor flag true", () => {

                        it("SHOULD return a list of reviews With Author set", async () => {
                            const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}?includeAuthor=true`).send();
                            expect(response.status).toBe(200);

                            expectValidReview(response, newValidReview(events[0].id), {
                                user: { id: users[0].id, userName: users[0].userName, profilePic: users[0].profilePic }
                            })
                        })
                    })

                    describe("WHEN trying to get Reviews with includeReactedUsers flag true and includeAuthor flag true", () => {

                        it("SHOULD return a list of reviews With includeReactedUsers set and Author set", async () => {

                            const amount = 1;
                            const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                            await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send({
                                eventId: events[0].id,
                                ticketType: events[0].ticketTypes[0].id,
                                amount: amount,
                                mintHash: mint.hash
                            });
                            const toggleReactResponse = await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();

                            const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}?includeAuthor=true&includeReactedUsers=true`).send();
                            expect(response.status).toBe(200);

                            expectValidReview(response, newValidReview(events[0].id), {
                                user: { id: users[0].id, userName: users[0].userName, profilePic: users[0].profilePic }
                            })
                            expect(response.body.body.reactedUsers[0].user).toMatchObject({ id: users[1].id, userName: users[1].userName, profilePic: users[1].profilePic });
                        });
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

            var reviews: IReview[] = [];

            beforeEach(async () => {

                const amount = 1;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                expect(mint).toBeTruthy();
                await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                    eventId: events[0].id,
                    ticketType: events[0].ticketTypes[0].id,
                    amount: amount,
                    mintHash: mint.hash
                });

                reviews = [];
                const response = await request(app).post(reviewPrivateUrl()).set("Authorization", `Bearer ${userAccessTokens[0]}`)
                    .send(newValidReview(events[0].id));
                reviews.push(response.body.body)
            })

            describe("WHEN trying to add a 👍 like Reaction By any user", () => {

                it("SHOULD Increment the like Reaction counter", async () => {
                    const toggleReactResponse = await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();
                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                    expectValidReview(response, newValidReview(events[0].id));
                    expect(response.body.body.reactions.like.count).toBe(1)
                })

                it("SHOULD update review Authors notification queue", async () => {
                    const toggleReactResponse = await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();
                    const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();
                    expectValidReview(response, newValidReview(events[0].id));
                    expect(response.body.body.reactions.like.count).toBe(1)

                    const userResponse = await request(app).get(`${userPrivateUrl(UserType.user)}notifications/0/1`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send();

                    expect(userResponse.status).toBe(200)
                    expect(userResponse.body.body.length).toBeGreaterThanOrEqual(1);
                    expect(userResponse.body.body[0]).toMatchObject({
                        title: `${users[1]?.userName} react to review: "${reviews[0]?.review}"`,
                        body: `${users[1]?.userName} react like to review: "${reviews[0]?.review}"`,
                        reaction: "like",
                        user: users[1].id,
                        review: reviews[0].id
                    })

                })

                describe("WHEN trying switch from 👍 like Reaction to a ❤️ love Reaction", () => {

                    it("SHOULD decrement the 👍 like Reaction counter and Increment the ❤️ love Reaction counter", async () => {
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/love`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();

                        const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                        expectValidReview(response, newValidReview(events[0].id));
                        expect(response.body.body.reactions.like.count).toBe(0);
                        expect(response.body.body.reactions.love.count).toBe(1);
                    })
                });

                describe("WHEN trying to toggle", () => {

                    it("SHOULD decrement the like Reaction counter ", async () => {
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();

                        const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                        expectValidReview(response, newValidReview(events[0].id));
                        expect(response.body.body.reactions.like.count).toBe(0)
                    })
                    it("SHOULD remove user from the list", async () => {
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();
                        await request(app).patch(`${reviewPrivateUrl()}react/${reviews[0].id}/like`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send();

                        const response = await request(app).get(`${reviewPublicUrl()}byId/${reviews[0].id}`).send();

                        expectValidReview(response, newValidReview(events[0].id));
                        expect(response.body.body.reactedUsers.length).toBe(0);
                    })
                });
            });

        });
    })


});