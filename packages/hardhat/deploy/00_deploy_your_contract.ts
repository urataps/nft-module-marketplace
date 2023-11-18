import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DeployPluginResult, deployPlugin } from "../tasks/modules";
import { Marketplace, ModuleCollection } from "../typechain-types";
import { writeFileSync } from "fs";
import { parseEther } from "ethers/lib/utils";

export type PluginInfo = {
  saleListingId: string;
  buyPrice: string;
  rentListingId: string;
  rentPricePerDay: string;
  deploymentResult: DeployPluginResult;
};

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const pluginDeployResults: DeployPluginResult[] = [];
  const pluginInfo: PluginInfo[] = [];

  await deploy("ModuleCollection", {
    from: deployer,
    // Contract constructor arguments
    args: [deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const collection = (await hre.ethers.getContract("ModuleCollection", deployer)) as ModuleCollection;

  await deploy("Marketplace", {
    from: deployer,
    args: [collection.address],
    log: true,
    autoMine: true,
  });

  pluginDeployResults.push(await deployPlugin(hre, "RelayPlugin", collection));
  pluginDeployResults.push(await deployPlugin(hre, "RecoveryWithDelayPlugin", collection));
  pluginDeployResults.push(await deployPlugin(hre, "WhitelistPlugin", collection));

  const marketplace = (await hre.ethers.getContract("Marketplace", deployer)) as Marketplace;

  await collection.setApprovalForAll(marketplace.address, true);

  for (const pluginDeployInfo of pluginDeployResults) {
    const saleParams = {
      moduleId: pluginDeployInfo.tokenId,
      owner: deployer,
      listingType: 0,
      price: parseEther("0.1"),
    };
    const rentParams = {
      moduleId: pluginDeployInfo.tokenId,
      owner: deployer,
      listingType: 1,
      price: parseEther("0.0001"),
    };

    const saleListingId = await marketplace.computeListingId(saleParams);
    const rentListingId = await marketplace.computeListingId(rentParams);
    await marketplace.list(saleParams);
    await marketplace.list(rentParams);

    pluginInfo.push({
      saleListingId: saleListingId.toString(),
      buyPrice: saleParams.price.toString(),
      rentListingId: rentListingId.toString(),
      rentPricePerDay: rentParams.price.toString(),
      deploymentResult: pluginDeployInfo,
    });
  }

  console.log(pluginInfo);
  writeFileSync("pluginInfo.json", JSON.stringify(pluginInfo), "utf-8");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
