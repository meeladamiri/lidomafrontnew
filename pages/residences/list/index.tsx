// import handleSSAuth from "@/utilities/SSR_SSG/Auth/handleSSAuth";
// import handleSSR401 from "@/utilities/SSR_SSG/Auth/handleSSR401";
import ResidencesList from "components/Residences/List";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, GetServerSidePropsContext, NextPage, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

const page = "لیست اقامتگاه ها";

const ResidencesListPage: NextPage = () => {
  return (
    <>
      <ResidencesList />
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
  //   queryClient.prefetchQuery(["getResidencesList"], async () => await getResidencesList()),
  // ]);

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [`${page} | ${PROJECTNAMEFA}`];

  return {
    props: {
      // dehydratedState: dehydrate(queryClient),
      metaTagsList,
    },
  };
};

export default ResidencesListPage;
