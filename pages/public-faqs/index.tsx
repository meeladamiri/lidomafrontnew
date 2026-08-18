import PublicFAQs from "@/components/PublicFAQs";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "سوالات متداول";

const PublicFAQsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <PublicFAQs/>
    </>
  );
};

export default PublicFAQsPage;
