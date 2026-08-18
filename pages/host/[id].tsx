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

  await Promise.all([
    queryClient.prefetchQuery(["getMizbanAccountInfo", reference], async () => {
      const resp = await fetch(`${BASE_URL}/api/about_host`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            reference: reference,
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      // console.log("Inside Promise.all, getMizbanAccountInfo is: ", parsedData);
      return parsedData;
    }),
  ]);

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RentalsPage;
