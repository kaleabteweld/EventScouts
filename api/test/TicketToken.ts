import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

describe("TicketToken", () => {
    const name = "TicketToken";
    const symbol = "TT";
    const events: { id: string, cost: BigNumber }[] = [{
        id: "ds786fsdb6f76ds87f96sdb87",
        cost: ethers.utils.parseUnits("200", 'wei')
    }]

    describe("Deployment", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;

        let contract: Contract;


        beforeEach(async function () {
            // Create the smart contract object to test from
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
        });

        it("Should set the right name", async function () {
            const _name = await contract.name();
            expect(_name).to.equal(name);
        });

        it("Should set the right symbol", async function () {
            const _symbol = await contract.symbol();
            expect(_symbol).to.equal(symbol);
        });

        it("Should set the right owner", async function () {
            const _owner = await contract.owner();
            expect(_owner).to.equal(owner.address);
        });
    })

    describe("Event", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;

        let contract: Contract;


        beforeEach(async function () {
            // Create the smart contract object to test from
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
        });

        it("should allow the owner to add event cost", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);
            const cost: BigNumber = await contract.getEventCost(events[0].id);
            expect(cost.eq(events[0].cost));
        });

        it("Should Not let any one be able to add event cost", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);
            const cost: BigNumber = await contract.getEventCost(events[0].id);
            expect(!cost.eq(events[0].cost));
        });

        it("Should Throw error if eventId does not exist", async function () {
            try {
                await await contract.getEventCost(" ")
            } catch (error: any) {
                expect(error.reason).to.equals("eventId does not exist");
            }
        });

        it("Should Not let buyer be able to buy TicketToken with Out Enough funds", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);
            try {
                await contract.connect(buyer).mint(events[0].id, 1, { value: (ethers.utils.parseUnits("100", 'wei')) })
            } catch (error: any) {
                expect(error.toString()).to.equals(`Error: VM Exception while processing transaction: reverted with reason string 'Not enough funds'`);
            }
        });

        it("Should Not let buyer be able to buy TicketToken with Overpayment", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);
            try {
                await contract.connect(buyer).mint(events[0].id, 1, { value: (ethers.utils.parseUnits("300", 'wei')) })
            } catch (error: any) {
                expect(error.toString()).to.equals(`Error: VM Exception while processing transaction: reverted with reason string 'Overpayment'`);
            }
        });

        it("Should Not let buyer be able to buy less then 1 TicketToken", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);

            try {
                await contract.connect(buyer).mint(events[0].id, 0, { value: (ethers.utils.parseUnits("200", 'wei')) })
            } catch (error: any) {
                expect(error.toString()).to.equals(`Error: VM Exception while processing transaction: reverted with reason string 'amount must be 1 to 5'`);

            }
        });

        it("Should Not let buyer be able to buy greater then 5 TicketToken", async function () {
            await contract.addEventCost(events[0].id, events[0].cost);

            try {
                await contract.connect(buyer).mint(events[0].id, 6, { value: (ethers.utils.parseUnits("200", 'wei')) })
            } catch (error: any) {
                expect(error.toString()).to.equals(`Error: VM Exception while processing transaction: reverted with reason string 'amount must be 1 to 5'`);

            }
        });
    })

})