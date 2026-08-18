import EditResidenceFastReserveSettings from "components/Residences/Edit/FastReserve";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, NextPage } from "next";

const page = "تنظیمات رزرو آنی اقامتگاه";

const EditResidenceFastReserveSettingsPage: NextPage = () => {
  return (
    <>
      <EditResidenceFastReserveSettings />
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

export default EditResidenceFastReserveSettingsPage;
