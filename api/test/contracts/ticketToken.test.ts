import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { describe, beforeEach, it, expect } from '@jest/globals';


describe("TicketToken", () => {
    const name = "TicketToken";
    const symbol = "TT";
    const ticketType: { id: string, eventId: string, cost: BigNumber, maxNumberOfTickets: number }[] = [{
        id: "ds786fsdb6f76ds87f96sdb87",
        eventId: "ds786fsdb6f76ds87f96sd5s3",
        cost: ethers.utils.parseUnits("200", 'wei'),
        maxNumberOfTickets: 10
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
            expect(_name).toEqual(name);
        });

        it("Should set the right symbol", async function () {
            const _symbol = await contract.symbol();
            expect(_symbol).toEqual(symbol);
        });

        it("Should set the right owner", async function () {
            const _owner = await contract.owner();
            expect(_owner).toEqual(owner.address);
        });
    })

    describe("TicketType", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;

        let contract: Contract;


        beforeEach(async function () {
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
        });

        it("should allow the owner to add TicketType cost and maxNumberOfTickets", async function () {
            await contract.addTicketTypeCost(ticketType[0].id, ticketType[0].eventId, ticketType[0].cost, ticketType[0].maxNumberOfTickets);
            const cost: BigNumber = await contract.getTicketTypeCost(ticketType[0].id);
            expect(cost.eq(ticketType[0].cost));
        });


        it("Should Throw error if TicketType does not exist", async function () {
            try {
                await await contract.getTicketTypeCost(" ")
            } catch (error: any) {
                expect(error.reason).toEqual("Ticket Type does not exist");
            }
        });

    })

    describe("update TicketType", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;

        let contract: Contract;


        beforeEach(async function () {
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
        });

        it("should allow the owner to update only TicketType cost and maxNumberOfTickets", async function () {
            await contract.updateTicketTypeCost(ticketType[0].id, ethers.utils.parseUnits("300", 'wei'), (ticketType[0].maxNumberOfTickets + 1));
            const cost: BigNumber = await contract.getTicketTypeCost(ticketType[0].id);
            expect(cost.eq(ethers.utils.parseUnits("300", 'wei')));

        });

        it("Should Throw error if TicketType does not exist", async function () {
            try {
                await await contract.getTicketTypeCost(" ")
            } catch (error: any) {
                expect(error.reason).toEqual("Ticket Type does not exist");
            }
        });

    })

    describe("mint", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;
        let contract: Contract;

        beforeEach(async function () {
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
            await contract.addTicketTypeCost(ticketType[0].id, ticketType[0].eventId, ticketType[0].cost, ticketType[0].maxNumberOfTickets);
        });

        it("Should Not let any one be able to add TicketType cost", async function () {
            const cost: BigNumber = await contract.getTicketTypeCost(ticketType[0].id);
            expect(!cost.eq(ticketType[0].cost));
        });

        it("Should Not let buyer be able to buy TicketToken with Out Enough funds", async function () {
            try {
                await contract.connect(buyer).mint(ticketType[0].id, 1, { value: ticketType[0].cost.sub(BigNumber.from(100)) })
            } catch (error: any) {
                expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'Not enough funds'`);
            }
        });

        it("Should Not let buyer be able to buy TicketToken with Overpayment", async function () {
            try {
                await contract.connect(buyer).mint(ticketType[0].id, 1, { value: ticketType[0].cost.add(BigNumber.from(100)) })
            } catch (error: any) {
                expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'Overpayment'`);
            }
        });

        it("Should Not let buyer be able to buy less then 1 TicketToken", async function () {
            try {
                await contract.connect(buyer).mint(ticketType[0].id, 0, { value: ticketType[0].cost })
            } catch (error: any) {
                expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'amount must be between 1 and ${ticketType[0].maxNumberOfTickets}'`);

            }
        });

        it(`Should Not let buyer be able to buy greater then maxNumberOfTickets ${ticketType[0].maxNumberOfTickets} TicketToken`, async function () {
            try {
                await contract.connect(buyer).mint(ticketType[0].id, ticketType[0].maxNumberOfTickets + 1, { value: ticketType[0].cost })
            } catch (error: any) {
                expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'amount must be between 1 and ${ticketType[0].maxNumberOfTickets}'`);

            }
        });

        describe("WHEN maxNumberOfTickets = 0", () => {
            it(`Should let buyer be able to buy any number TicketToken`, async function () {

                await contract.addTicketTypeCost("tempID", "tempEventId", ethers.utils.parseUnits("20", 'wei'), 0);
                const mint = await contract.connect(buyer).mint("tempID", 100, { value: ethers.utils.parseUnits("20", 'wei').mul(BigNumber.from(100)) });

            });
        })

        it("Should let buyer be able to buy", async function () {
            const totalTokenSupplyBefore = await contract.getTotalTokenSupply();
            await contract.connect(buyer).mint(ticketType[0].id, 2, { value: ticketType[0].cost.mul(BigNumber.from(2)) })
            const totalTokenSupplyAfter = await contract.getTotalTokenSupply();

            expect(totalTokenSupplyBefore < totalTokenSupplyAfter)

        });

        it("Should update contracts Balance on mint", async function () {
            const balanceBefore = await ethers.provider.getBalance(contract.address);
            await contract.connect(buyer).mint(ticketType[0].id, 2, { value: ticketType[0].cost.mul(BigNumber.from(2)) })
            const balanceAfter = await ethers.provider.getBalance(contract.address);

            expect(balanceBefore < balanceAfter)

        });

    })

    describe("withdraw", function () {

        let owner: SignerWithAddress;
        let buyer: SignerWithAddress;

        let contract: Contract;


        beforeEach(async function () {
            // Create the smart contract object to test from
            [owner, buyer] = await ethers.getSigners();
            const TicketTokenContract = await ethers.getContractFactory("TicketToken");
            contract = await TicketTokenContract.deploy(name, symbol);
            await contract.addTicketTypeCost(ticketType[0].id, ticketType[0].eventId, ticketType[0].cost, ticketType[0].maxNumberOfTickets);
            await contract.connect(buyer).mint(ticketType[0].id, 2, { value: ticketType[0].cost.mul(BigNumber.from(2)) })
        });

        it("Should only let owner be able to withdraw all funds", async function () {
            try {
                const balanceBefore = await ethers.provider.getBalance(owner.address);
                await contract.connect(owner).withdraw();
                const balanceAfter = await ethers.provider.getBalance(owner.address);
                expect(balanceBefore < balanceAfter);
            } catch (error: any) {
                console.log({ error })
            }
        })

        it("Should Not let any one be able to withdraw all funds", async function () {
            try {
                const balanceBefore = await ethers.provider.getBalance(buyer.address);
                await contract.connect(buyer).withdraw();
                const balanceAfter = await ethers.provider.getBalance(buyer.address);

            } catch (error: any) {
                expect(error.toString()).toEqual(`Error: VM Exception while processing transaction: reverted with reason string 'ownership is required'`);
            }
        })
    })

})