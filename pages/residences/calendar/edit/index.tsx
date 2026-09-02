import ResidenceCalendar from "components/Residences/Calendar";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, NextPage } from "next";

const page = "ویرایش تقویم اقامتگاه";

const ResidenceCalendarPage: NextPage = () => {
  return (
    <>
      <ResidenceCalendar />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
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

export default ResidenceCalendarPage;
