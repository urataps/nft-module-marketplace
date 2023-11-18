import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DeployPluginResult, deployPlugin } from "../tasks/modules";
import { ModuleCollection } from "../typechain-types";
import { writeFileSync } from "fs";

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

  pluginDeployResults.push(await deployPlugin(hre, "RelayPlugin", collection));
  pluginDeployResults.push(await deployPlugin(hre, "RecoveryWithDelayPlugin", collection));
  pluginDeployResults.push(await deployPlugin(hre, "WhitelistPlugin", collection));

  await deploy("Marketplace", {
    from: deployer,
    args: [collection.address],
    log: true,
    autoMine: true,
  });

  console.log(pluginDeployResults);
  writeFileSync("deployResults.json", JSON.stringify(pluginDeployResults), "utf-8");
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
