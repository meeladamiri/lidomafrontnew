import LidomaApp from "@/components/LidomaApp";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "دانلود اپلیکیشن لیدوماتریپ";

const AbouPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <LidomaApp />
    </>
  );
};

export default AbouPage;
