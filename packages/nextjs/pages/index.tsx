import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import BuyTable from "~~/components/marketplace/BuyTable";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <BuyTable />
    </>
  );
};

export default Home;
