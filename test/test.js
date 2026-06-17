const { ethers } = require("hardhat");
const { expect } = require("chai");

// Reserve amounts and addresses from DigitX.sol
const DECIMALS = 18n;
const lpReserve = 200_000_000n * (10n ** DECIMALS);
const exchangeReserve = 150_000_000n * (10n ** DECIMALS);
const treasuryReserve = 150_000_000n * (10n ** DECIMALS);
const marketingReserve = 150_000_000n * (10n ** DECIMALS);
const teamReserve = 200_000_000n * (10n ** DECIMALS);
const developmentReserve = 150_000_000n * (10n ** DECIMALS);
const TOTAL_SUPPLY = lpReserve + exchangeReserve + treasuryReserve + marketingReserve + teamReserve + developmentReserve;

const ADDR_LP = "0x56Dc76356Df23faF940d70fCAe9Cb0e9fA0DA9C4";
const ADDR_EXCHANGE = "0x22914550EE4b973f892ED0f344bCa7495987747e";
const ADDR_TREASURY = "0x08EcAF0a9D4FE0B5AA0771ce6b290b17D5259366";
const ADDR_MARKETING = "0x5E7F1CF4c832B754e06510680caB12bD0e922A8D";
const ADDR_TEAM = "0x39FC6A84499A3CBd81A8230031bBbE7317B0Fed8";
const ADDR_DEVELOPMENT = "0x5E16515222cC3ACd044205508d14110AA2c24010";

describe("DigitX (custom logic only)", function () {
    let token, owner;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const DigitX = await ethers.getContractFactory("DigitX");
        token = await DigitX.deploy(
            ADDR_LP,
            ADDR_EXCHANGE,
            ADDR_TREASURY,
            ADDR_MARKETING,
            ADDR_TEAM,
            ADDR_DEVELOPMENT
        );
    });

    describe("Deployment", function () {
        it("sets name and symbol", async function () {
            expect(await token.name()).to.equal("DigitX");
            expect(await token.symbol()).to.equal("DigitX");
        });
        it("mints total supply to six reserve addresses", async function () {
            expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
            expect(await token.balanceOf(ADDR_LP)).to.equal(lpReserve);
            expect(await token.balanceOf(ADDR_EXCHANGE)).to.equal(exchangeReserve);
            expect(await token.balanceOf(ADDR_TREASURY)).to.equal(treasuryReserve);
            expect(await token.balanceOf(ADDR_MARKETING)).to.equal(marketingReserve);
            expect(await token.balanceOf(ADDR_TEAM)).to.equal(teamReserve);
            expect(await token.balanceOf(ADDR_DEVELOPMENT)).to.equal(developmentReserve);
        });
        it("owner has zero balance", async function () {
            expect(await token.balanceOf(owner.address)).to.equal(0n);
        });
        it("initial mode is NORMAL (0), firstBuyCompleted false, pool zero", async function () {
            expect(await token._mode()).to.equal(0);
            expect(await token.firstBuyCompleted()).to.equal(false);
            expect(await token.pancakeSwapPool()).to.equal(ethers.ZeroAddress);
        });
        it("exposes correct reserve constants", async function () {
            expect(await token.lpReserve()).to.equal(lpReserve);
            expect(await token.exchangeReserve()).to.equal(exchangeReserve);
            expect(await token.MODE_NORMAL()).to.equal(0);
            expect(await token.MODE_TRANSFER_RESTRICTED()).to.equal(1);
            expect(await token.MODE_TRANSFER_CONTROLLED()).to.equal(2);
        });
    });

    describe("setPancakeSwapPool", function () {
        it("sets pool address (onlyOwner)", async function () {
            const [, , pool] = await ethers.getSigners();
            await token.setPancakeSwapPool(pool.address);
            expect(await token.pancakeSwapPool()).to.equal(pool.address);
        });
        it("reverts when pool is zero", async function () {
            await expect(token.setPancakeSwapPool(ethers.ZeroAddress))
                .to.be.revertedWith("Pool address cannot be zero");
        });
    });

    describe("init", function () {
        it("sets _mode to MODE_TRANSFER_RESTRICTED (1) once", async function () {
            await token.init();
            expect(await token._mode()).to.equal(1);
        });
        it("reverts on second call", async function () {
            await token.init();
            await expect(token.init()).to.be.revertedWith("Token: already initialized");
        });
    });

    describe("setMode", function () {
        beforeEach(async function () { await token.init(); });

        it("changes mode when current is not NORMAL", async function () {
            await token.setMode(2);
            expect(await token._mode()).to.equal(2);
            await token.setMode(0);
            expect(await token._mode()).to.equal(0);
        });
        it("does not change mode when current is NORMAL", async function () {
            await token.setMode(0);
            await token.setMode(1);
            expect(await token._mode()).to.equal(0);
        });
    });

    describe("Transfer modes (_update)", function () {
        const amount = ethers.parseEther("100");
        let pool;

        // Unlock first-buy phase once for all mode tests
        beforeEach(async function () {
            [, pool] = await ethers.getSigners();
            await token.setPancakeSwapPool(pool.address);

            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ADDR_LP],
            });
            await network.provider.request({
                method: "hardhat_setBalance",
                params: [ADDR_LP, "0x" + (1n << 64n).toString(16)],
            });
            const signerLp = await ethers.getSigner(ADDR_LP);

            // fund pool from LP reserve (allowed during first phase)
            await token.connect(signerLp).transfer(pool.address, amount * 10n);
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [ADDR_LP],
            });

            // first buy: pool -> owner, sets firstBuyCompleted = true
            await token.connect(pool).transfer(owner.address, ethers.parseEther("1"));
        });

        it("MODE_TRANSFER_RESTRICTED: reverts any transfer", async function () {
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ADDR_LP],
            });
            await network.provider.request({
                method: "hardhat_setBalance",
                params: [ADDR_LP, "0x" + (1n << 64n).toString(16)],
            });
            const [, user] = await ethers.getSigners();
            const signerLp = await ethers.getSigner(ADDR_LP);
            await token.init();
            await expect(token.connect(signerLp).transfer(user.address, amount))
                .to.be.revertedWith("Token: Transfer is restricted");
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [ADDR_LP],
            });
        });

        it("MODE_TRANSFER_CONTROLLED: only owner as from or to", async function () {
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ADDR_LP],
            });
            await network.provider.request({
                method: "hardhat_setBalance",
                params: [ADDR_LP, "0x" + (1n << 64n).toString(16)],
            });
            const [, user1, user2] = await ethers.getSigners();
            const signerLp = await ethers.getSigner(ADDR_LP);
            await token.init();
            await token.setMode(2);
            await token.connect(signerLp).transfer(owner.address, amount);
            const expectedBalance = amount + ethers.parseEther("1");
            expect(await token.balanceOf(owner.address)).to.equal(expectedBalance);
            await token.connect(owner).transfer(user1.address, amount);
            await token.connect(user1).transfer(owner.address, amount);
            expect(await token.balanceOf(owner.address)).to.equal(expectedBalance);
            await expect(
                token.connect(user1).transfer(user2.address, ethers.parseEther("10"))
            ).to.be.revertedWith("Token: Invalid transfer");
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [ADDR_LP],
            });
        });

        it("MODE_NORMAL: any transfer works", async function () {
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ADDR_LP],
            });
            await network.provider.request({
                method: "hardhat_setBalance",
                params: [ADDR_LP, "0x" + (1n << 64n).toString(16)],
            });
            const [, user1, user2] = await ethers.getSigners();
            const signerLp = await ethers.getSigner(ADDR_LP);
            await token.connect(signerLp).transfer(user1.address, amount);
            await token.connect(user1).transfer(user2.address, ethers.parseEther("50"));
            expect(await token.balanceOf(user2.address)).to.equal(ethers.parseEther("50"));
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [ADDR_LP],
            });
        });
    });

    describe("First-buy (_update)", function () {
        let pool;
        const amount = ethers.parseEther("1000");

        beforeEach(async function () {
            [, pool] = await ethers.getSigners();
            await token.setPancakeSwapPool(pool.address);
            await network.provider.request({
                method: "hardhat_impersonateAccount",
                params: [ADDR_LP],
            });
            await network.provider.request({
                method: "hardhat_setBalance",
                params: [ADDR_LP, "0x" + (1n << 64n).toString(16)],
            });
            const signerLp = await ethers.getSigner(ADDR_LP);
            await token.connect(signerLp).transfer(pool.address, amount);
            await network.provider.request({
                method: "hardhat_stopImpersonatingAccount",
                params: [ADDR_LP],
            });
        });

        it("first transfer from pool to non-owner reverts with First Buy Pending", async function () {
            const [, , other] = await ethers.getSigners();
            await expect(
                token.connect(pool).transfer(other.address, ethers.parseEther("1"))
            ).to.be.revertedWith("First Buy Pending");
        });

        it("first transfer from pool to owner sets firstBuyCompleted and emits FirstBuyDone", async function () {
            await expect(
                token.connect(pool).transfer(owner.address, ethers.parseEther("1"))
            ).to.emit(token, "FirstBuyDone");
            expect(await token.firstBuyCompleted()).to.equal(true);
        });

        it("after first buy, transfer from pool to any address is allowed (when mode allows)", async function () {
            await token.connect(pool).transfer(owner.address, ethers.parseEther("1"));
            const [, , other] = await ethers.getSigners();
            await token.connect(pool).transfer(other.address, ethers.parseEther("10"));
            expect(await token.balanceOf(other.address)).to.equal(ethers.parseEther("10"));
        });
    });
});