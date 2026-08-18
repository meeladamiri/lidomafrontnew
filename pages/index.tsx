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

  await Promise.all([
    queryClient.prefetchQuery(["getHomePageData"], async () => {
      const resp = await fetch(`${BASE_URL}/api/home/get_items`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          // params: {},
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      return parsedData;
    }),
    queryClient.prefetchQuery(["getHomePageMetaTags"], async () => {
      const resp = await fetch(`${BASE_URL}/api/get_meta_info`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            page: "home",
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      return parsedData;
    }),
    queryClient.prefetchQuery(["getShomalSliders"], async () => {
      const resp = await fetch(`${BASE_URL}/api/home/get_custom_sliders`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            cat_id: 1079,
            limit: 15,
            res_type: "suit",
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      return parsedData;
    }),
    queryClient.prefetchQuery(["getTehranSliders"], async () => {
      const resp = await fetch(`${BASE_URL}/api/home/get_custom_sliders`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            cat_id: 164,
            limit: 15,
            res_type: "suit",
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      return parsedData;
    }),
    queryClient.prefetchQuery(["getJonubSliders"], async () => {
      const resp = await fetch(`${BASE_URL}/api/home/get_custom_sliders`, {
        method: "post",
        // mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Cookie: getUserToken() + ";",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "call",
          params: {
            cat_id: 1510,
            limit: 15,
            res_type: "suit",
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      return parsedData;
    }),
  ]);

  const metaTagsOfHomePage = (queryClient as any).queryCache.queries[1]?.state?.data;

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    `${metaTagsOfHomePage?.params?.title}`,
    {
      name: "title",
      content: `${metaTagsOfHomePage?.params?.title}`,
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
