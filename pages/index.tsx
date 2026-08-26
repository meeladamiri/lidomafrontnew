import Home from "@/components/Home";
import { mapHomeBundle } from "@/api/Home";
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

  // The home page is a curated CMS bundle now served by the new backend
  // (GET /api/home/page-data). It used to be five separate calls against the
  // old Odoo endpoints; this is one, prefetched here so the whole page is in
  // the server HTML rather than appearing after hydration.
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

  let home: any = null;
  try {
    const res = await fetch(`${backendUrl}/api/home/page-data`);
    if (res.ok) {
      const json = await res.json();
      if (json?.status === "success") home = json.data;
    }
  } catch {
    // A build must not fail because the backend blinked — the page degrades to
    // its empty state and the next revalidate picks the content back up.
  }

  // Narrowed to the keys the tree renders and reshaped to the card shape the
  // components read — see `mapHomeBundle`.
  const homePageData = { status: "success", params: mapHomeBundle(home) };

  await queryClient.prefetchQuery(["getHomePageData"], async () => homePageData);

  const seo = home?.seo ?? {};
  const homeTitle = seo.title || "لیدوما تریپ | اجاره ویلا، سوئیت و اقامتگاه بوم‌گردی";
  const homeDescription =
    seo.description ||
    "رزرو و اجاره آنلاین ویلا، سوئیت، هتل و اقامتگاه بوم‌گردی در سراسر ایران با تضمین قیمت و پشتیبانی ۲۴ ساعته.";

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    homeTitle,
    // MainLayout renders index 1 as the canonical <link> — it must sit here.
    // It used to be at index 2, so the layout emitted the "title" meta as a
    // <link> and the home page shipped with no canonical at all.
    {
      rel: "canonical",
      href: `${BASE_URL}`,
    },
    {
      name: "title",
      content: homeTitle,
    },
    {
      name: "description",
      content: `${homeDescription}`,
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
      content: `${homeTitle}`,
    },
    {
      property: "og:description",
      content: `${homeDescription}`,
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
      content: "summary_large_image",
    },
    {
      name: "twitter:title",
      content: `${homeTitle}`,
    },
    {
      name: "twitter:description",
      content: `${homeDescription}`,
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
      // NOTE: no raw `home` prop here. It used to ride along unread next to the
      // dehydrated copy of the same data, which doubled `__NEXT_DATA__`.
    },
    // Curated content, so a long window is fine; an admin edit shows up on the
    // next request after it expires rather than rebuilding the whole site.
    revalidate: 10 * 60,
  };
};

export default HomePage;
