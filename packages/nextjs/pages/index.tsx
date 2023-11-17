import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import Table from "~~/components/marketplace/Table";

const Home: NextPage = () => {
  return (
    <>
      <MetaHeader />
      <Table />
    </>
  );
};

export default Home;
