import ReservationsList from "components/Reservations/List";
import type { NextPage } from "next";
import Head from "next/head";

const ReservationsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>رزرو ها | لیدوما تریپ</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ReservationsList />
    </>
  );
};

export default ReservationsPage;
