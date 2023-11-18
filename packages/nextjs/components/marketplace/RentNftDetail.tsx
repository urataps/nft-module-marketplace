import React from "react";
import Link from "next/link";
import data from "../../data/pluginInfo.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button, Flex } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";
import { GridItem, Heading, Select, SimpleGrid, Text } from "@chakra-ui/react";
import { formatUnits } from "viem";
import { useWalletClient } from "wagmi";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

type NftDetailProps = {
  tokenId: string;
};

export default function RentNftDetail({ tokenId }: NftDetailProps) {
  const pluginInfo = data.find(item => item.deploymentResult.tokenId === tokenId);
  if (!pluginInfo) {
    throw new Error(`No plugin found with tokenId ${tokenId}`);
  }

  const { data: walletClient } = useWalletClient();
  const { data: marketplace } = useScaffoldContract({
    contractName: "Marketplace",
    walletClient,
  });

  const listingId = BigInt(pluginInfo.rentListingId);

  const rent = async () => {
    if (marketplace && walletClient) {
      await marketplace.write.rent([listingId, walletClient.account.address, 1n], {
        value: BigInt(pluginInfo.rentPricePerDay),
      });
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
                  <Box className="mb-2 flex justify-between items-center">
                    <div>
                      <Text className="text-lg font-semibold">Rent Price</Text>
                    </div>
                    <div>
                      <Heading as={"h3"} className="text-2xl font-bold text-blue-500">
                        {formatUnits(BigInt(pluginInfo.rentPricePerDay), 18)} ETH/day
                      </Heading>
                    </div>
                  </Box>

                  <Box>
                    <Flex alignItems="center">
                      <Box flex="1">
                        <Select className="w-full mt-2 p-2 border bg-sky-300 rounded-md" placeholder="Select duration">
                          <option value="option1">1 Day</option>
                          <option value="option2">15 Days</option>
                          <option value="option3">30 Days</option>
                        </Select>
                      </Box>
                      <Box className="mt-4 ml-4">
                        <Button onClick={rent} className="bg-blue-500 text-white hover:bg-blue-600 rounded-lg p-4">
                          Rent Now
                        </Button>
                      </Box>
                    </Flex>
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
