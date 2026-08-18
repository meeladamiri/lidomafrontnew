import About from "@/components/About";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "درباره لیدوماتریپ";

const AbouPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <About/>
    </>
  );
};

export default AbouPage;
