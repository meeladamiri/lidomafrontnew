import Host from "@/components/Host";
import { mapHostProfileResponse } from "@/api/Residences/getMizbanAccountInfo";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";

const RentalsPage: NextPage = () => {
  return (
    <>
      <Host />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const queryClient = new QueryClient();
  const reference = query?.id;

  // Server-side rewrites don't apply to server-to-server fetches, so this hits
  // the backend by its real URL (same pattern as pages/rentals/[id].tsx).
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

  await queryClient.prefetchQuery(["getMizbanAccountInfo", reference], async () => {
    const resp = await fetch(`${backendUrl}/api/residences/hosts/${reference}`);
    const body = await resp.json();
    return mapHostProfileResponse(body);
  });

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RentalsPage;
