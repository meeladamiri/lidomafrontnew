import ForgetPassword from "components/Auth/ForgetPassword";
import { PROJECTNAMEFA } from "configs/info";
import type { GetStaticProps, NextPage } from "next";

const page = "فراموشی رمز عبور";

const ForgetPasswordPage: NextPage = () => {
  return (
    <>
      <ForgetPassword />
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
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

export default ForgetPasswordPage;
