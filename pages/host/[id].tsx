import Host from "@/components/Host";
import { BASE_URL } from "@/configs/info";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";

const RentalsPage: NextPage = () => {
  return (
    <>
      <Host />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  const queryClient = new QueryClient();
  const reference = query?.id;

  // Public host profile page — no backend endpoint yet (only a minimal host summary
  // is embedded in a residence's own detail response). Degrade to empty rather than
  // hitting the old production site.
  await Promise.all([
    queryClient.prefetchQuery(["getMizbanAccountInfo", reference], async () => ({
      status: "success",
      params: {},
    })),
  ]);

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RentalsPage;
