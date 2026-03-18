const hre = require("hardhat");
const { ethers } = hre;


const main = async () => {
    try {
        const { ethers, network } = hre;

        const [deployer] = await ethers.getSigners();

        const { chainId } = await deployer.provider.getNetwork();

        console.log(`Network: ${network.name}(ChainId ${chainId})`);
        console.log(`Deployer: ${deployer.address}`);

        const DigitX = await ethers.getContractFactory("DigitX", deployer);
        const token = await DigitX.deploy(
            process.env.LP_WALLET,
            process.env.EXCHANGE_WALLET,
            process.env.TREASURY_WALLET,
            process.env.MARKETING_WALLET,
            process.env.TEAM_WALLET,
            process.env.DEV_WALLET
        );

        await token.waitForDeployment();

        const contractAddress = await token.getAddress();
        const DeploymentTx = token.deploymentTransaction();
        const txHash = DeploymentTx ? DeploymentTx.hash : "N/A";

        const totalSupply = await token.totalSupply();
        const totalSupplyFormated = ethers.formatUnits(totalSupply, 18);

        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Deployment tx Hash: ${txHash}`);
        console.log(`Total supply: ${totalSupplyFormated} DigitX`);

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exitCode = 1;

    }
}
main();