import React from "react";
import Link from "next/link";
import data from "../../data/data.json";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Button } from "@chakra-ui/react";
import { Container } from "@chakra-ui/react";
import { GridItem, Heading, Select, SimpleGrid, Text } from "@chakra-ui/react";

type NftDetailProps = {
  tokenId: string;
};

export default function NftDetail({ tokenId }: NftDetailProps) {
  // Sample price, replace with the actual price for the NFT
  const nftPrice = "$500.00";

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
                  {data.find(item => item.tokenId === tokenId)?.name}
                </Heading>
                <Text className="text-gray-600 mt-4">
                  Descriptione cabrone
                  {/* todo: remove */}
                </Text>

                <Box className="mt-6">
                  <Text className="text-lg font-semibold">Metadata</Text>
                  <SimpleGrid columns={12} columnGap={5} rowGap={2}>
                    <GridItem colSpan={[12, 6, 6, 6]}>Something</GridItem>
                    <GridItem colSpan={[12, 6, 6, 6]}>Something</GridItem>
                  </SimpleGrid>
                </Box>

                <Box className="mt-6">
                  <Text className="text-lg font-semibold">Owner</Text>
                  <SimpleGrid columns={12} columnGap={5} rowGap={2}>
                    <GridItem colSpan={[12]}>
                      <Box>
                        <span className="text-blue-500">urataps.eth</span>
                      </Box>
                    </GridItem>
                  </SimpleGrid>
                </Box>

                <Box className="mt-6">
                  <Box className="mb-4">
                    <Text className="text-lg font-semibold">Rent price</Text>
                    <Heading as={"h3"} className="text-2xl font-bold text-blue-500">
                      $43.5467 / Day
                    </Heading>
                  </Box>
                  <Box>
                    <Box className="mb-2">
                      <Text className="text-lg font-semibold">Buy price</Text>
                      <Heading as={"h3"} className="text-2xl font-bold text-green-500">
                        {nftPrice}
                      </Heading>
                    </Box>
                    <Box>
                      <span className="text-lg">Duration</span>
                      <Select className="w-full mt-2 p-2 border rounded-md" placeholder="Select option">
                        <option value="option1">10 Days</option>
                        <option value="option2">15 Days</option>
                        <option value="option3">30 Days</option>
                      </Select>
                    </Box>
                    <Box className="mt-4 space-x-2">
                      <Button className="bg-blue-500 text-white hover:bg-blue-600">Rent Now</Button>
                      <Button className="bg-green-500 text-white hover:bg-green-600">Buy Now</Button>
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
