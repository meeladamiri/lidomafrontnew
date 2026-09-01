import { PROJECTNAMEFA } from "@/configs/info";
// import handleSSAuth from "@/utilities/SSR_SSG/Auth/handleSSAuth";
// import handleSSR401 from "@/utilities/SSR_SSG/Auth/handleSSR401";
// import { dehydrate, QueryClient } from "@tanstack/react-query";
import Dashboard from "components/dashboard";
import type { GetServerSideProps, GetServerSidePropsContext, NextPage, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

// Not "داشبورد میزبان": this page serves guests too now, and a guest who has
// never hosted anything should not be told they are looking at a host panel.
const page = `پیشخوان`;

const DashboardPage: NextPage = () => {
  return (
    <>
      <Dashboard />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  // const token = handleSSAuth(ctx);

  // if (!token) return handleSSR401(ctx.resolvedUrl); // The request lacks valid authentication credentials for the target resource.

  // const queryClient = new QueryClient();

  // await Promise.all([
  //   queryClient.prefetchQuery(["getDashboardData"], async () => await getDashboardData2()),
  //   queryClient.prefetchQuery(["getResidencesList"], async () => await getResidencesList2()),
  // ]);

  // console.log("all prefetch done", queryClient?.queryCache?.queries[0]?.state);

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [`${page} | ${PROJECTNAMEFA}`];

  return {
    props: {
      // dehydratedState: dehydrate(queryClient),
      metaTagsList,
    },
  };
};

export default DashboardPage;
