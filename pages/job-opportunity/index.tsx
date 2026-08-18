import Jobopportunity from "@/components/JopOpportunity";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "فرصت های شغلی";

const JobOpportunityPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <Jobopportunity/>
    </>
  );
};

export default JobOpportunityPage;
