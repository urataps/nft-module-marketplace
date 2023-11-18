import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NFTStorage } from "nft.storage";
import { ModuleCollection } from "../typechain-types";

const API_KEY = process.env.NFT_STORAGE_API_KEY || "";

export type ModuleProperties = {
  source: string;
  author: string;
  requiresRootAccess: boolean;
  version: string;
  audits: {
    auditor: string;
    url: string;
  }[];
};

export type NftMetadata = {
  name: string;
  description: string;
  image: Blob;
  properties: ModuleProperties;
};

export type DeployPluginResult = {
  address: string;
  name: string;
  tokenId: string;
  metadataURI: string;
  metadata: NftMetadata;
};

const safeLogo =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAilBMVEUS/4ASExIw/5A6/5USJhsSvGES0msS93wS63YSnFISYTYSXDQSiUkSPyYSTi0SzWkS120SMyES8XkSFhMSHhcS+HwSplYSsVsSGhUShEYSVDAScD0Sj0sSZjgSOiQSLB4Stl4SUS8Sw2QSlk8Sd0ASq1kSbDsS5nQSRCgSKBsSIRgSfkQSNSFS/6L9943PAAAEAklEQVR4nO3de3uaMBTHcdhEtN4QRK2Xau16tXv/b2/Wbs9sm+Qg54Sc+vy+f5eZT8VNEsii6DL6EXoAUgGiLUC0BYi2ANEWINoCRFuAaAsQbQGiLUC0BYi2ANEWINoCRFuA/CtZj2Nmk2E3DQ0pr7iK916zsJDsRsZxeFemISH5RspxaBYQ0hV0xJsyHGQoCYmTYJB0Lgq5DgbJRB3xOhhkJAvpAQIIIIAAAggggADyv92lQESvq0JCZK+rwkG2so74KhAkZc9nfepXGEjaE3bEvAmhupBE+v2IJ3kTkDI7bTcV/py/1Wc5KkHS6UJ2vsQU7xNSCZKJn0Vfm9wzHRUgpdj8rrV5jz2HXQFCz7e/LKe7NqOMv6hQAZKQjkVHYBzsSMiacnA/pUKREGrlYNHEKCtEQghHS8V5FdGQlIAsGxllhbgQ7oqZWFzIqJFRVogLaTcyygoBAoinAAHEU4AA4ilAAPEUIH9zfI3P7x9uhx9bdx9FR3+SN0i6n5h+vnjwdG3sC/JondZr+TkbPUHKJ/shz17eE0+QlesYLxMWniDO2bCCtxJizg+EuNuRPfVuyA+EWLj2cW5xZxrN6wF990G89VtzJIRY5TGf7hohS+eQBuaDNEIy5/Lh1nyQRkh05xiR7VOrEhItrAMa2NbMdELy/YtxOHP79z+dkLeF9t649bHxU9/xlYkDKTufqvY9wM9Tb/Uh29viy4+PrytcxeiCjAbmA+ZL8m1RBcmM12LHbqmX1ARx3mPRJV5SE+TadcyE+JwogpT2E+st4hEsRRDiImbofkk/EOeVrg1C3PUydr+kH8i9e0x740EEpOV+ST+QjntMO+NBGiHue5ufzQ+zqoQ4b26+Mx+jEhLt7SOy/fWjE2KX9Gxfm5RComT49Xvs4VrMPqelFXK4Iku6n9q6pn31Qs4MkGOAyAfIMUDkA+QYIPIBcgwQ+QA5pggyuxQIMRn2fSD2Jb7vBWmbroxPCjLTWKOcev6UWCHRAskdN3i9t3L/AUogbfJ54KKR9ZHHXcJotloQn4/YOj0pCpk18Hg1uUEdH1K6b7uRaeF/VbfjYbOBjxWvS/M6hCyE+GesRpt+u5OeVG1HTS5EeP+gw+9/VW8rUC7EuaRco3ndjUC5EOkzi7ovwBvEcvNI3Qa1t5hVBqn/MLYySP2nMpRB6m9erAxSfyCAAAIIIIAAAgggFwghJwjPqggHeRCF3ISDEDfGnhljGzguJDc/7VOzCvNXviCiuxdz9rPjT5neiW0PuuY8jCwwiS30XycVxAKIf4jpWbJz2wz7zN0glCz08ANEW4BoCxBtAaItQLQFiLYA0RYg2gJEW4BoCxBtAaItQLQFiLYuCPLzMvr9B31CR00T/nWNAAAAAElFTkSuQmCC";

export const deployPlugin = async (
  hre: HardhatRuntimeEnvironment,
  name: string,
  collection: ModuleCollection,
): Promise<DeployPluginResult> => {
  const [deployer] = await hre.ethers.getSigners();
  const pluginFactory = await hre.ethers.getContractFactory(name);
  const plugin = await pluginFactory.deploy(collection.address);
  await plugin.deployed();

  const nftMetadata: NftMetadata = {
    image: await fetch(safeLogo).then(res => res.blob()),
    name: name,
    description: "This is a plugin that extends functionality of a Safe{WALLET}.",
    properties: {
      version: "1.0",
      source: "https://github.com",
      author: "Safe Team",
      requiresRootAccess: false,
      audits: [
        {
          auditor: "Satoshi Nakamoto",
          url: "https://openzeppelin.com",
        },
      ],
    },
  };

  const client = new NFTStorage({ token: API_KEY });
  const metadata = await client.store(nftMetadata);

  const tx = await collection.addModule(plugin.address, metadata.url, {
    recipient: deployer.address,
    royaltyBps: 100, // 1%
  });

  const receipt = await tx.wait();
  const tokenId = receipt.events?.find(e => e.event === "ModuleAdded")?.args?.tokenId.toString();

  // mint tokens to deployer
  await collection.mintModule(deployer.address, tokenId, 100);

  return {
    address: plugin.address,
    name: name,
    tokenId: tokenId,
    metadataURI: metadata.url,
    metadata: nftMetadata,
  };
};
