import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { describe, beforeEach, afterEach, beforeAll, afterAll, it, expect } from '@jest/globals';
import { connectDB, dropCollections, dropDB } from "../api/util";
import Cache from "../../src/Util/cache";
import request from "supertest";
import { makeServer } from "../../src/Util/Factories";
import { categoryPrivateUrl, createEvents, createOrganizer, eventPrivateUrl, newValidCategory, newValidEvent, newValidOrganizer, sighupUrl } from "../api/common";
import { UserType } from "../../src/Types";
import { IOrganizer } from "../../src/Schema/Types/organizer.schema.types";
import { ICategory } from "../../src/Schema/Types/category.schema.types";
import { IEvent } from "../../src/Schema/Types/event.schema.types";
import { dollarsToWei } from "./common";

const app = makeServer();

const newValidOrganizerWithOutPassword = { ...newValidOrganizer }
delete (newValidOrganizerWithOutPassword as any).password;


describe("organizer integration", () => {
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


    describe("Event Ticket", () => {

        var owner: SignerWithAddress;
        var buyer: SignerWithAddress;
        var contract: Contract;
        var accessTokens: string[] = [];
        var organizers: IOrganizer[] = [];
        var categorys: ICategory[] = [];
        var events: IEvent[] = [];


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
        });

        it("Should set the right owner, to be the organizer", async function () {
            const _owner = await contract.owner();
            expect(_owner).toEqual(organizers[0].walletAccounts[0]);
        });

        it("should allow the owner to add event and each Tickets type cost", async function () {

            for (let index = 0; index != events[0].ticketTypes.length; index++) {
                const ticketTypes = events[0].ticketTypes[index];
                const temp = await contract.addTicketTypeCost(ticketTypes.id, events[0].id, dollarsToWei(ticketTypes.price), ticketTypes.maxNumberOfTickets);
                console.log({ temp })

            }
            const cost: BigNumber = await contract.getTicketTypeCost(events[0].ticketTypes[0].id);
            expect(cost.eq(dollarsToWei(events[0].ticketTypes[0].price))).toBe(true);
        });


    })



});