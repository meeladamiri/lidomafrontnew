import Home from "@/components/Home";
import { BASE_URL } from "@/configs/info";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";

const HomePage: NextPage = () => {
  let schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: " لیدوماتریپ: اجاره ویلا، سوئیت و اقامتگاه بوم گردی | شمال و سراسر ایران ",
    alternateName: ["Lidoma", "lidomatrip", " لیدوما", "لیدوما تریپ "],
    logo: "https://lidomatrip.com/assets/logos/Lidoma-logo2.svg",
    url: "https://lidomatrip.com/",
    sameAs: [
      "https://www.linkedin.com/company/lidomatrip",
      "https://twitter.com/lidoma_trip",
      "https://www.instagram.com/lidoma_trip/",
      "https://www.aparat.com/lidmatrip.com",
    ],
    location: {
      "@type": "Place",
      hasMap: "https://maps.app.goo.gl/VxiR1FyyHwNc6Mae7",
      address: {
        "@type": "PostalAddress",
        streetAddress: "شهرک آرین پارک علم و فناوری فارس، ساختمان مرکز رشد جامع، واحد 6101",
        addressLocality: " شیراز ",
        addressRegion: "فارس",
        postalCode: "7194766518",
        addressCountry: "IR",
      },
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+98-21-91070021",
      contactType: "customer service",
      areaServed: "IR",
      availableLanguage: ["fa", "en"],
    },
  };

  let schema2 = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "لیدوماتریپ",
    alternateName: "lidomatrip",
    url: "https://lidomatrip.com/",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://lidomatrip.com/search/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema2) }}
        />
      </Head>

      <Home />
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();

  // The old backend's home page was a hand-curated CMS bundle (hero slides, promo
  // banners, "picked for you"/"popular"/"last-minute" residence rails, seasonal
  // sliders, SEO meta) — none of that curation/CMS layer exists on the new backend.
  // Degrade every section to empty rather than querying the old production site
  // directly (which is what this getStaticProps did before, on every dev request).
  const emptyHomePageData = {
    status: "success",
    params: {
      slides: [],
      banners: [],
      suggests: [],
      last_time_offers: [],
      populars: [],
      your_taste: [],
      boomgardi_reses: [],
      discounted_reses: [],
      desc_boxes: [],
      faqs: [],
      articles: [],
      service_boxes: [],
    },
  };

  await Promise.all([
    queryClient.prefetchQuery(["getHomePageData"], async () => emptyHomePageData),
    queryClient.prefetchQuery(["getHomePageMetaTags"], async () => ({ status: "success", params: {} })),
    queryClient.prefetchQuery(["getShomalSliders"], async () => ({ status: "success", params: {} })),
    queryClient.prefetchQuery(["getTehranSliders"], async () => ({ status: "success", params: {} })),
    queryClient.prefetchQuery(["getJonubSliders"], async () => ({ status: "success", params: {} })),
  ]);

  const metaTagsOfHomePage = (queryClient as any).queryCache.queries[1]?.state?.data;
  const homeTitle = metaTagsOfHomePage?.params?.title || "لیدوما تریپ | اجاره ویلا، سوئیت و اقامتگاه بوم‌گردی";

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    homeTitle,
    {
      name: "title",
      content: homeTitle,
    },
    {
      rel: "canonical",
      href: `${BASE_URL}`,
    },
    {
      name: "description",
      content: `${metaTagsOfHomePage?.params?.meta_description}`,
    },
    {
      property: "og:url",
      content: `${BASE_URL}`,
    },
    {
      property: "og:site_name",
      content: "لیدوما تریپ",
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:title",
      content: `${metaTagsOfHomePage?.params?.title}`,
    },
    {
      property: "og:description",
      content: `${metaTagsOfHomePage?.params?.meta_description}`,
    },
    {
      property: "og:image",
      content: "https://lidomatrip.com/assets/logos/Lidoma-logo2.svg",
    },
    {
      name: "twitter:site",
      content: "@lidomatrip",
    },
    {
      name: "twitter:card",
      content: `${metaTagsOfHomePage?.params?.image}`,
    },
    {
      name: "twitter:title",
      content: `${metaTagsOfHomePage?.params?.title}`,
    },
    {
      name: "twitter:description",
      content: `${metaTagsOfHomePage?.params?.meta_description}`,
    },
    {
      name: "twitter:image:src",
      content: "https://lidomatrip.com/assets/logos/Lidoma-logo2.svg",
    },
  ];

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      metaTagsList,
    },
    revalidate: 30 * 60,
  };
};

export default HomePage;
