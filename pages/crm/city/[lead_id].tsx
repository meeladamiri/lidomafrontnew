import Search from "@/components/Search";
import type { GetServerSideProps, NextPage } from "next";

const SearchPage: NextPage = () => {
  return (
    <>
      <Search />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  // const asPath = "/crm/city/[lead_id]";

  return {
    props: {
      //
    },
  };
};

export default SearchPage;
