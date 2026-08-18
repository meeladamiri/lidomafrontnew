import BoomgardiRoomEdit from "@/components/BoomgardiRoomEdit";
// import handleSSAuth from "@/utilities/SSR_SSG/Auth/handleSSAuth";
// import handleSSR401 from "@/utilities/SSR_SSG/Auth/handleSSR401";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, GetServerSidePropsContext, NextPage, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";

const page = "ویرایش اتاق بومگردی";

const BoomgardiRoomEditPage: NextPage = () => {
  return (
    <>
      <BoomgardiRoomEdit />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  ctx: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>
) => {
  // const token = handleSSAuth(ctx);

  // if (!token) return handleSSR401(ctx.resolvedUrl); // The request lacks valid authentication credentials for the target resource.

  // const queryClient = new QueryClient();

  // const requests = [queryClient.prefetchQuery("getSettingSlogan", getSettingSlogan)];

  // await Promise.all(requests);

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [`${page} | ${PROJECTNAMEFA}`];

  return {
    props: {
      // dehydratedState: dehydrate(queryClient),
      metaTagsList,
    },
  };
};

export default BoomgardiRoomEditPage;
