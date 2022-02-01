const { expect } = require("chai");

describe("Charity contract", function () {

    let Charity;
    let charity;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    beforeEach(async function () {
        Charity = await ethers.getContractFactory("Charity");
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        charity = await Charity.deploy();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            // This test expects the owner variable stored in the contract to be equal
            // to our Signer's owner.
            expect(await charity.owner()).to.equal(owner.address);
        });
    });

    describe("Donation", function () {
        it("Should add account who donated", async function () {
            await charity.connect(addr1).donate({ from: addr1.address, value: ethers.utils.parseEther("0.1") });

            const donaters = await charity.getAllDonaters();

            expect(addr1.address).to.equal(donaters[0]);
            expect(1).to.equal(donaters.length);
        });

        it("Should be balance equal to donated amount and stored correctly", async function () {
            const value = await ethers.utils.parseEther("0.1");
            await charity.donate({ value: value });

            const balance = await charity.balanceOf(owner.address);
            const totalDonations = await charity.balanceOfDonations();

            expect(value).to.equal(balance);
            expect(value).to.equal(totalDonations);
        });

        it("Requires to amount of ether be more than 0", async function () {
            try {
                await charity.donate({ value: 0 });

                expect(false);
            } catch (err) {
                expect(err);
            }

        });

        it("Only owner can call donate function", async function () {
            try {
                await charity.connect(addr1).donate({ value: ethers.utils.parseEther("0.1") });

                expect(false);
            } catch (err) {
                expect(err);
            }
        });

    });

    describe("Withdraw all", function () {
        it("withdraw all to any address", async function () {
            const initialBalance = await addr2.getBalance();
            await charity.connect(addr1).donate({ from: addr1.address, value: ethers.utils.parseEther("2") });

            await charity.withdrawAll(addr2.address);
            const finalBalance = await addr2.getBalance();

            const difference = finalBalance - initialBalance;
            const totalDonations = await charity.balanceOfDonations();

            expect(difference > ethers.utils.parseEther("1.8"));
            expect(0).to.equal(totalDonations);
        });

        it("Only owner can call withdraw function", async function () {
            try {
                await charity.connect(addr1.address).withdrawAll({ value: ethers.utils.parseEther("0.1") });

                expect(false);
            } catch (err) {
                expect(err);
            }
        });
    });

    describe("Partial withdraw", function () {
        it("Partial withdraw to any address", async function () {
            const initialBalance = await addr1.getBalance();

            await charity.connect(addr2).donate({ from: addr2.address, value: ethers.utils.parseEther("2") });

            await charity.partialWithdraw(addr1.address, { value: ethers.utils.parseEther("1") });

            const finalBalance = await addr1.getBalance();

            const difference = finalBalance - initialBalance;

            expect(difference > ethers.utils.parseEther("0.8"));
        });

        it("cheks result of total donation after partial withdraw function", async function () {
            const initialBalanceDonations = await charity.balanceOfDonations();

            await charity.connect(addr2).donate({ from: addr2.address, value: ethers.utils.parseEther("2") });

            await charity.partialWithdraw(addr2.address, { value: ethers.utils.parseEther("1") });

            const finalBalanceDonations = await charity.balanceOfDonations();

            const difference = finalBalanceDonations - initialBalanceDonations;
            expect(difference > ethers.utils.parseEther("0.8"));
        });

        it("Only owner can call partial withdraw function", async function () {
            try {
                await charity.connect(addr1.address).partialWithdraw({ value: ethers.utils.parseEther("0.1") });

                expect(false);
            } catch (err) {
                expect(err);
            }
        });

        it("Requires to amount of ether be more than 0", async function () {
            try {
                await charity.partialWithdraw({ value: 0 });

                expect(false);
            } catch (err) {
                expect(err);
            }

        });
    });

    describe("View functions", function () {
        it("Should return all donaters", async function () {
            await charity.donate({ value: ethers.utils.parseEther("2") });

            const donaters = await charity.getAllDonaters();

            expect(owner.address).to.equal(donaters[0]);
        });

        it("Should return balance of account who donated", async function () {
            await charity.donate({ value: ethers.utils.parseEther("2") });

            const balanceOf = await charity.balanceOf(owner.address);

            expect(2).to.equal(parseInt(ethers.utils.formatEther(balanceOf)));
        });

        it("Should return balance of donations", async function () {
            await charity.donate({ value: ethers.utils.parseEther("2") });

            const balanceOfDonations = await charity.balanceOfDonations();

            expect(2).to.equal(parseInt(ethers.utils.formatEther(balanceOfDonations)));
        });
    });
});