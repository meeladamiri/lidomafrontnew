import EditResidenceGeneralPricing from "components/Residences/Edit/GeneralPricing";
import { PROJECTNAMEFA } from "configs/info";
import type { GetServerSideProps, NextPage } from "next";

const page = "نرخ گذاری کلی اقامتگاه";

const EditResidenceGeneralPricingPage: NextPage = () => {
  return (
    <>
      <EditResidenceGeneralPricing />
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

export default EditResidenceGeneralPricingPage;
