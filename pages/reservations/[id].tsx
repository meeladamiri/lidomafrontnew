import ReservationDetails from "components/Reservations/ReservationDetails";
import type { NextPage } from "next";
import Head from "next/head";

const ReservationDetailsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>رزرو ها | لیدوما تریپ</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ReservationDetails />
    </>
  );
};

export default ReservationDetailsPage;
