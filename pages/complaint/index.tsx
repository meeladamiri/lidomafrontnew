import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";
import Complaint from "@/components/Complaint";

const page = "فرم ثبت شکایت";

const ComplaintPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <Complaint/>
    </>
  );
};

export default ComplaintPage;
