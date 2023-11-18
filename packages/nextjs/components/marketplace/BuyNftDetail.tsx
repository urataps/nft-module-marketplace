import React from "react";
import Link from "next/link";
import data from "../../data/pluginInfo.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";
import { GridItem, Heading, SimpleGrid, Text } from "@chakra-ui/react";
import { formatUnits } from "viem";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

type NftDetailProps = {
  tokenId: string;
};

export default function BuyNftDetail({ tokenId }: NftDetailProps) {
  const pluginInfo = data.find(item => item.deploymentResult.tokenId === tokenId);
  if (!pluginInfo) {
    throw new Error(`No plugin found with tokenId ${tokenId}`);
  }

  const { data: walletClient } = useWalletClient();
  const { data: marketplace } = useScaffoldContract({
    contractName: "Marketplace",
    walletClient,
  });

  const listingId = BigInt(pluginInfo.saleListingId);

  const buy = async () => {
    if (marketplace) {
      await marketplace.write.buy([listingId], { value: BigInt(pluginInfo.buyPrice) });
    }
  };

  return (
    <>
      <Box>
        <Container maxW="1280px">
          <Link href="#">
            <ArrowBackIcon className="text-blue-500 hover:text-blue-700 cursor-pointer" />
          </Link>

          <Box className=" p-8 rounded-lg shadow-lg">
            <SimpleGrid columns={10} columnGap={14} rowGap={2}>
              <GridItem colSpan={[10, 10, 10, 4]}>
                <Box className="text-center">
                  <SafeGlobalLogo width={512} height={512} />
                </Box>
              </GridItem>

              <GridItem colSpan={[10, 10, 10, 6]}>
                <Heading as="h2" className="text-3xl font-semibold">
                  {pluginInfo.deploymentResult.name}
                </Heading>
                <Text className="text-gray-600 mt-4">{pluginInfo.deploymentResult.metadata.description}</Text>

                <Box className="mt-6">
                  <Text className="text-lg font-semibold">Plugin Metadata</Text>
                  <div className="border border-gray-300 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(pluginInfo.deploymentResult.metadata.properties).map(([key, value], index) => (
                        <div key={index} className="mb-4">
                          <div className="font-semibold">{key}</div>
                          <div>{value.toString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Box>

                <Box className="mt-6">
                  <Box>
                    <Box className="mb-2 flex justify-between items-center">
                      <div>
                        <Text className="text-lg font-semibold">Buy Price</Text>
                      </div>
                      <div>
                        <Heading as={"h3"} className="text-2xl font-bold text-green-500">
                          {formatUnits(BigInt(pluginInfo.buyPrice), 18)} ETH
                        </Heading>
                      </div>
                    </Box>

                    <Box className="mt-4 text-center">
                      <Button
                        onClick={buy}
                        className="bg-green-500 text-white hover:bg-green-600 rounded-lg px-6 py-3 text-xl"
                      >
                        Buy Now
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </GridItem>
            </SimpleGrid>
          </Box>
        </Container>
      </Box>
    </>
  );
}
