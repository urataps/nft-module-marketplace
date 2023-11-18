import { task } from "hardhat/config";
import { ModuleCollection__factory } from "../typechain-types";
import { MockPlugin__factory } from "../typechain-types";
import { deployRelayPluginMetadata } from "./modules";

task("deploy-collection", "Deploys the module collection").setAction(async (args, hre) => {
  const [account] = await hre.ethers.getSigners();
  const moduleCollection = await new ModuleCollection__factory(account).deploy(account.address);
  await moduleCollection.deployed();
  console.log("ModuleCollection deployed to:", moduleCollection.address);
});

task("add-modules", "Adds a module to the collection")
  .addParam("collection", "Collection address")
  .setAction(async (args, hre) => {
    const [account] = await hre.ethers.getSigners();

    const moduleCollection = ModuleCollection__factory.connect(args.collection, account);

    // deploy relay
    const relayPlugin = await new MockPlugin__factory(account).deploy();
    const relayPluginURI = await deployRelayPluginMetadata();

    // deploy recovery
    // const recoveryPlugin = await new MockPlugin__factory(account).deploy();
    // deploy whitelist
    // const whitelistPlugin = await new MockPlugin__factory(account).deploy();

    const tx = await moduleCollection.addModule(relayPlugin.address, relayPluginURI, {
      recipient: account.address,
      royaltyBps: "100", // 10%
    });

    console.log(relayPluginURI);

    await tx.wait();
  });

// const collection = "0x82Ab664f349dA102f0650181d4F40B2dE679cc54";

task("mint-module", "Mints a module")
  .addParam("collection", "Collection address")
  .addParam("moduleId", "Module ID")
  .setAction(async (args, hre) => {
    const [account] = await hre.ethers.getSigners();

    const moduleCollection = ModuleCollection__factory.connect(args.collection, account);

    const tx = await moduleCollection.mintModule(account.address, args.moduleId, 1);

    await tx.wait();
  });
