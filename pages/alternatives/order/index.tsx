import Search from "@/components/Search";
import type { GetServerSideProps, NextPage } from "next";

const SearchPage: NextPage = () => {
  return (
    <>
      <Search />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // const asPath = "/alternatives/order";

  return {
    props: {
      //
    },
  };
};

export default SearchPage;
