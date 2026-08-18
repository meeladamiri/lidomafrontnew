import ReserveCancellationPolicy from "@/components/ReserveCancellationPolicy";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "مقررات لغو رزرو";

const ReserveCancellationPolicyPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <ReserveCancellationPolicy/>
    </>
  );
};

export default ReserveCancellationPolicyPage;
