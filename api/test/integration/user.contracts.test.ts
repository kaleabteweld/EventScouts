import { makeServer } from "../../src/Util/Factories";
import { describe, expect, beforeEach, afterEach, beforeAll, afterAll, it } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from "../api/util";
import Cache from "../../src/Util/cache";
import { newValidUser, createOrganizer, createEvents, newValidCategory, newValidOrganizer, createUser, transactionPrivateUrl, expectError, expectValidUserTransaction, eventPublicUrl, searchFactory } from "../api/common";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { IOrganizer } from "../../src/Schema/Types/organizer.schema.types";
import { ICategory } from "../../src/Schema/Types/category.schema.types";
import { IEvent } from "../../src/Schema/Types/event.schema.types";
import request from "supertest";
import { IUser } from "../../src/Schema/Types/user.schema.types";
import { dollarsToWei } from "./common";

const app = makeServer();

describe('User Integration', () => {
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


    describe("WHEN User tries to buy/mint a ticket ", () => {
        var owner: SignerWithAddress;
        var buyer: SignerWithAddress;
        var contract: Contract;
        var accessTokens: string[] = [];
        var organizers: IOrganizer[] = [];
        var categorys: ICategory[] = [];
        var events: IEvent[] = [];
        var users: IUser[] = [];
        var userAccessTokens: string[] = [];


        beforeEach(async function () {
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);

            const { accessTokens: ats, organizers: orgs } = await createOrganizer(request, app, [{ ...newValidOrganizer, walletAccounts: [owner.address] }]);
            accessTokens = ats;
            organizers = orgs;

            const { events: evs, categorys: cats } = await createEvents(request, app, [newValidCategory], 2, accessTokens[0]);
            events = evs;
            categorys = cats

            const { accessTokens: uts, users: usr } = await createUser(request, app, [{ ...newValidUser, walletAccounts: [buyer.address] }]);
            userAccessTokens = uts;
            users = usr;

            await contract.addTicketTypeCost(events[0].ticketTypes[0].id, events[0].id, dollarsToWei(events[0].ticketTypes[0].price), events[0].ticketTypes[0].maxNumberOfTickets);
        });

        it("SHOULD be able to buy/mint ticket", async () => {
            const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, 1, { value: dollarsToWei(events[0].ticketTypes[0].price) });
            expect(mint).toBeTruthy();
        });

        it("SHOULD be able to buy/mint ticket", async () => {
            const amount = 1;
            const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
            expect(mint).toBeTruthy();
            const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                eventId: events[0].id,
                ticketType: events[0].ticketTypes[0].id,
                amount: amount,
                mintHash: mint.hash
            });
            expectValidUserTransaction(response, events[0], events[0].ticketTypes[0], amount);
        });

        describe("WHEN User buys a ticket, Event", () => {

            it("SHOULD updated to have that user", async () => {
                const amount = 1;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                expect(mint).toBeTruthy();
                const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                    eventId: events[0].id,
                    ticketType: events[0].ticketTypes[0].id,
                    amount: amount,
                    mintHash: mint.hash
                });
                expectValidUserTransaction(response, events[0], events[0].ticketTypes[0], amount);

                const eventResponse = await request(app).get(`${eventPublicUrl()}byId/${events[0].id}`).send();
                expect(eventResponse.body.body.users.length).toBe(1);
                expect(eventResponse.body.body.users[0]).toBe(users[0].id);

            });

            describe("WHEN searching for Event that have people coming", () => {

                it("SHOULD have 1 event", async () => {
                    const amount = 1;
                    const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                    expect(mint).toBeTruthy();
                    const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                        eventId: events[0].id,
                        ticketType: events[0].ticketTypes[0].id,
                        amount: amount,
                        mintHash: mint.hash
                    });
                    expectValidUserTransaction(response, events[0], events[0].ticketTypes[0], amount);

                    const eventResponse = await request(app).post(`${eventPublicUrl()}search/1`).send(searchFactory({
                        amountOfPeopleComing: 1
                    }));
                    expect(eventResponse.body.body.length).toBe(1);

                });
            })
        })

        describe("WHEN Invalid User tries to buy/mint a ticket ", () => {

            it("SHOULD return 401 and error object", async () => {
                const amount = 1;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                expect(mint).toBeTruthy();
                const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer 1`).send({
                    eventId: events[0].id,
                    ticketType: events[0].ticketTypes[0].id,
                    amount: amount,
                    mintHash: mint.hash
                });

                expectError(response, 401)
            });

            describe("WHEN valid User tries to buy/mint a ticket with invalid wallet", () => {

                it("SHOULD return 401 and error object", async () => {
                    const amount = 1;
                    const mint = await contract.connect(owner).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                    expect(mint).toBeTruthy();
                    const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[1]}`).send({
                        eventId: events[0].id,
                        ticketType: events[0].ticketTypes[0].id,
                        amount: amount,
                        mintHash: mint.hash
                    });

                    expectError(response, 401)
                });

                it("SHOULD return 400 and error object", async () => {
                    const amount = 1;
                    const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                    expect(mint).toBeTruthy();
                    const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                        eventId: events[0].id,
                        ticketType: events[0].ticketTypes[0].id,
                        amount: amount,
                        mintHash: "0x12"
                    });

                    expectError(response, 400)
                });
            });
        });

        describe("WHEN User buys a ticket, Contract", () => {

            it("SHOULD updated totalTokenSupply to Amount of Bought", async () => {
                const amount = 1;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                expect(mint).toBeTruthy();
                const response = await request(app).patch(`${transactionPrivateUrl()}mint`).set("Authorization", `Bearer ${userAccessTokens[0]}`).send({
                    eventId: events[0].id,
                    ticketType: events[0].ticketTypes[0].id,
                    amount: amount,
                    mintHash: mint.hash
                });
                expectValidUserTransaction(response, events[0], events[0].ticketTypes[0], amount);

                const totalTokenSupply: BigNumber = await contract.connect(owner).getTicketTypeTotalTokenSupply(events[0].ticketTypes[0].id);
                expect(totalTokenSupply.eq(BigNumber.from(amount)));

            });

            it("SHOULD Not let the user buy more then current supply", async () => {
                const amount = events[0].ticketTypes[0].maxNumberOfTickets;
                const mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, amount, { value: dollarsToWei(events[0].ticketTypes[0].price, amount) });
                expect(mint).toBeTruthy();

                const totalTokenSupply: BigNumber = await contract.connect(owner).getTicketTypeTotalTokenSupply(events[0].ticketTypes[0].id);
                expect(totalTokenSupply.eq(BigNumber.from(events[0].ticketTypes[0].maxNumberOfTickets)));

                try {
                    const _mint = await contract.connect(buyer).mint(events[0].ticketTypes[0].id, 1, { value: dollarsToWei(events[0].ticketTypes[0].price) });
                    expect(_mint).toBeFalsy();
                } catch (error: any) {
                    expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'amount must be between 1 and ${events[0].ticketTypes[0].maxNumberOfTickets}'`);
                }

            });
        });

    })
});