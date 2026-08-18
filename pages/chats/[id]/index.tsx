import ChatDetails from "@/components/Chat";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, NextPage } from "next";

const page = "جزئیات گفتگو";

const ChatDetailsPage: NextPage = () => {
  return (
    <>
      <ChatDetails />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  // const queryClient = new QueryClient();

  // const requests = [queryClient.prefetchQuery("getSettingSlogan", getSettingSlogan)];

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [`${page} | ${PROJECTNAMEFA}`];

  return {
    props: {
      // dehydratedState: dehydrate(queryClient),
      metaTagsList,
    },
  };
};

export default ChatDetailsPage;
