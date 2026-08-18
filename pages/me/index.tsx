import MiladAmiri from "@/components/MiladAmiri";
import type { GetStaticProps, NextPage } from "next";

const page = "Milad Amiri | میلاد امیری";

const MiladAmiriPage: NextPage = () => {
  return (
    <>
      <MiladAmiri />
    </>
  );
};

const meta_description =
  "میلاد امیری دانش آموخته ی MBA گرایش تجارت الکترونیک دانشگاه تبریز، فعال در حوزه ی گردشگری ایران ، بنیان گذار استارتاپ لیدوماتریپ";

export const getStaticProps: GetStaticProps = async () => {
  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    page,
    {
      name: "title",
      content: `${page}`,
    },
    // {
    //   name: "keywords",
    //   content: `${metaTagsOfHomePage?.params?.meta_keywords}`,
    // },
    {
      name: "description",
      content: meta_description,
    },
    // {
    //   name: "generator",
    //   content: `${metaTagsOfHomePage?.params?.generator}`,
    // },
    // {
    //   property: "og:title",
    //   content: `${metaTagsOfHomePage?.params?.["og:title"]}`,
    // },
    // {
    //   property: "og:site_name",
    //   content: `${metaTagsOfHomePage?.params?.["og:site_name"]}`,
    // },
  ];

  return {
    props: {
      metaTagsList,
    },
  };
};

export default MiladAmiriPage;
