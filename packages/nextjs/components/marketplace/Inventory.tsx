import React from "react";
import Image from "next/image";
import Link from "next/link";
import { SafeGlobalLogo } from "../assets/SafeGlobalLogo";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  Container,
  GridItem,
  Heading,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

export default function Inventory() {
  const identicon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANIAAADSCAMAAAAIR25wAAAABlBMVEX///+s2IwoT/dmAAABRUlEQVR4nO3PgQ0DAQgDse/+S3eFSgTU6H0DEPw8kiRJkqSf+nSF1BBSQ0gNITWE1BBSQ0gNITWE1BBSQ0gNITWE1BBSQ0gNITWE1NAd6Z+GkAZLZ0NIg6WzIaTB0tkQ0mDpbAhpsHQ2hDRYOhtCGiydDSENls6GkAZLZ0NIg6WzIaTB0tkQ0mDpbAhpsHQ2hDRYOhtCGiydDSENls6GkAZLZ0Oh/uqZTEgNITWE1BBSQ0gNITWE1BBSQ0gNITWE1BBSQ0gNITWE1BBSQ0jveSb0C9JqSMtnIiEtn4mEtHwmEtLymUhIy2ciIS2fiYS0fCYS0vKZSEjLZyIhLZ+JhLR8JhLS8plISMtnIiEtn4mEtHwmEtLymUh3v/ywlCn0LxISEhISEhISEhISEhISEhISEhISEhISEhIS0gtJkiRJkiRpqS+JcEfIQXj9pAAAAABJRU5ErkJggg==";

  return (
    <>
      <Box>
        <Container maxW="1280px">
          <Link href="#">
            <ArrowBackIcon />
          </Link>
          <Box>
            <SimpleGrid columns={12} columnGap={[2, 2, 4, 4]} rowGap={[2, 2, 4, 4]}>
              <GridItem colSpan={[12, 12, 3, 3, 3]}>
                <Box>
                  <Image src={identicon} height={180} width={180} alt="" />
                  <Heading as="h4">Username</Heading>
                  <Text>n1Cpmv...8zM8oTF</Text>
                </Box>
              </GridItem>
              <GridItem colSpan={[12, 12, 9, 9, 9]}>
                <Box>
                  <Box>
                    <TableContainer>
                      <Table>
                        <Thead>
                          <Tr>
                            <Th>Token Id</Th>
                            <Th>Name</Th>
                            <Th>Validity</Th>
                            <Th>Price</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td>0123456789</Td>
                            <Td>
                              <Box>
                                <SafeGlobalLogo width={40} height={40} />
                                Lorem ipsum
                              </Box>
                            </Td>
                            <Td>5 Days</Td>
                            <Td>$2,668.1674</Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>
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
