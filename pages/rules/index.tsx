import Rules from "@/components/Rules";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "قوانین سایت";

const RulesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <Rules />
    </>
  );
};

export default RulesPage;
