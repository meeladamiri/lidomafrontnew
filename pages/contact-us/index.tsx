import ContactUs from "@/components/ContactUs";
import { PROJECTNAMEFA } from "configs/info";
import type { NextPage } from "next";
import Head from "next/head";

const page = "تماس با ما";

const ContactUsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>
          {page} | {PROJECTNAMEFA}
        </title>
      </Head>
      <ContactUs/>
    </>
  );
};

export default ContactUsPage;
