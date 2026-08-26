import Search from "@/components/Search";
import { countAndPricePhrase, withCountInTitle } from "@/utilities/SearchPage/buildSearchTitle";
import { BASE_URL } from "@/configs/info";
import { SOCIAL_FALLBACK_IMAGE } from "@/constants/socialImage";
import { search_pages_pageSize } from "@/constants/search_pages_pageSize";
import { buildSearchBody, mapSearchResponse } from "@/api/Search/search";
import { getSearchResidences_API_params } from "@/utilities/SearchPage/getSearchResidences_API_params";
import { getSearchResidences_Query_dep_array } from "@/utilities/SearchPage/getSearchResidences_Query_dep_array";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
// import cities_data from "utilities/SearchPage/cities_data";
// const fs = require("fs");
// import { performance } from "perf_hooks";
// import { getSearchMetas_Query_dep_array } from "@/utilities/SearchPage/getSearchMetas_Query_dep_array";
import { getSearchData_Query_dep_array } from "@/utilities/SearchPage/getSearchData_Query_dep_array";
import { useSearchData } from "Hooks/SearchPages/useSearchData";
import Head from "next/head";
// import { useRouter } from "next/router";
// import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
import { useSearchResidences } from "Hooks/SearchPages/useSearchResidences";
import { useRouter } from "next/router";
import { tags } from "@/constants/search/tags";
// import { ISearchResidences_ServerResp } from "@/interfaces/Search/SearchResp";
// import { determineResidenceTypeFromUrl } from "@/utilities/SearchPage/determineResidenceTypeFromUrl";

const SearchPage: NextPage = () => {
  // const router = useRouter();
  const { data } = useSearchResidences();
  const { data: searchPageData } = useSearchData();
  const router = useRouter();

  const queryParams = new URLSearchParams(router.asPath.split("?")[1]);

  const filterParams = (obj: Record<string, string>) => {
    return Object.keys(obj)
      .filter((key) => queryParams.get(key) === "1")
      .map((key) => ({ [key]: obj[key] })); // Return an array of objects
  };

  let tagList = filterParams(tags);
  // Generate the query string from tagList
  const queryString = tagList
    .map((tag) => Object.keys(tag)[0]) // Extract the keys (e.g., 'villa', 'luxury')
    .map((key) => `${key}=1`) // Convert to query param strings
    .join("&"); // Join into a single string

  // Every entry used to be `position: 1`, which tells a crawler the list has no
  // order. Each item is now a LodgingBusiness carrying its own photo, price and
  // rating, which is what a listing result needs to be eligible for a rich
  // result rather than a bare link.
  let residences = data?.params?.products.map((product: any, index: number) => {
    const lodging: any = {
      "@type": "LodgingBusiness",
      "@id": `https://lidomatrip.com/rentals/${product?.id}`,
      name: product?.name,
      url: `https://lidomatrip.com/rentals/${product?.id}`,
      image: product?.main_image,
      address: {
        "@type": "PostalAddress",
        addressCountry: "IR",
        addressLocality: product?.city,
        addressRegion: product?.province,
      },
    };

    if (product?.latitude && product?.longitude) {
      lodging.geo = {
        "@type": "GeoCoordinates",
        latitude: product.latitude,
        longitude: product.longitude,
      };
    }

    if (product?.min_price) {
      lodging.priceRange = `${product.min_price} IRR`;
      lodging.offers = {
        "@type": "Offer",
        price: product.min_price,
        priceCurrency: "IRR",
        availability: product?.is_full
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
        url: `https://lidomatrip.com/rentals/${product?.id}`,
      };
    }

    // Only claim a rating when there is a review behind it. An aggregateRating
    // with reviewCount 0 is a structured-data error, not an empty field.
    if (product?.average_rating > 0 && product?.reviews_count > 0) {
      lodging.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Math.round(product.average_rating * 100) / 100,
        reviewCount: product.reviews_count,
        bestRating: 5,
        worstRating: 1,
      };
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      item: lodging,
    };
  });

  let schemaOrg = {
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
      availableLanguage: "FA",
    },
  };

  let schemaWeb = {
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

  let schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "لیدوماتریپ",
        item: {
          "@type": "Thing",
          "@id": "https://lidomatrip.com",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `اجاره ویلا و سوئیت در استان ${searchPageData?.params?.province?.name}`,
        item: {
          "@type": "Thing",
          "@id": `https://lidomatrip.com/search/${searchPageData?.params?.province?.title_en}`,
        },
      },
    ],
  };

  let schema2 = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: searchPageData?.params?.page_title,
    description: searchPageData?.params?.description,
    mainEntity: {
      "@type": "ItemList",
    },
  } as any;

  // Conditionally add the third item if `city` exists
  if (!!searchPageData?.params?.city?.name && !!searchPageData?.params?.city?.title_en) {
    schema.itemListElement.push({
      "@type": "ListItem",
      position: 3,
      name: `اجاره ویلا و سوئیت در ${searchPageData?.params?.city?.name}`,
      item: {
        "@type": "Thing",
        "@id": `https://lidomatrip.com/search/${searchPageData?.params?.city?.title_en}`,
      },
    });
    schema2.mainEntity.address = {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: searchPageData?.params?.city?.name,
      addressRegion: searchPageData?.params?.province?.name,
    };
  }

  if (tagList?.length > 0) {
    schema.itemListElement.push({
      "@type": "ListItem",
      position: 4, // You can set this to any position you need
      name: `اجاره ${tagList.length === 1 ? Object.values(tagList[0])[0] : ""} در ${
        searchPageData?.params?.city?.name
      }`,
      item: {
        "@type": "Thing",
        "@id": `https://lidomatrip.com/search/${searchPageData?.params?.city?.title_en}?${queryString}`,
      },
    });
  }

  if (residences?.length > 0) {
    schema2.mainEntity.itemListElement = residences;
  }

  // The page already renders these questions; FAQPage is what makes them
  // eligible to show under the result. Only emitted when there are real
  // questions — an empty FAQPage is a structured-data error.
  const faqList = searchPageData?.params?.faqs ?? [];
  const schemaFaq =
    faqList.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqList.map((faq: any) => ({
            "@type": "Question",
            name: faq?.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: String(faq?.answer ?? "")
                .replace(/<[^>]*>/g, " ")
                .replace(/s+/g, " ")
                .trim(),
            },
          })),
        }
      : null;

  return (
    <>
      <Head>
        {/* {!!router?.query?.page && Number(router?.query?.page) - 1 !== 0 && (
          <link
            rel="prev"
            href={`https://lidomatrip.com/search/${router?.query?.id}${`?page=${
              Number(router?.query?.page) - 1
            }`}`}
          />
        )}

        <link
          rel="canonical"
          href={`https://lidomatrip.com/search/${router?.query?.id}${
            !!router?.query?.page ? `?page=${router?.query?.page}` : ""
          }`}
        />
        {(data?.params as ISearchResidences_ServerResp)?.count > 20 &&
        Number(router?.query?.page) === Math.ceil(data?.params?.count / 20) ? (
          ""
        ) : (
          <link
            rel="next"
            href={`https://lidomatrip.com/search/${router?.query?.id}${
              !!router?.query?.page ? `?page=${Number(router?.query?.page) + 1}` : "?page=2"
            }`}
          />
        )} */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWeb) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema2) }}
        />

        {!!schemaFaq && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
          />
        )}
      </Head>

      <Search />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, query, res }) => {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const queryClient = new QueryClient();
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

  // const start = performance.now();

  // START OF CACHING "get_items" RESPONSE.
  // const res_data_params_as_key = getSearchResidences_Query_dep_array({
  //   query,
  //   routerAsPath,
  // });
  // const res_data_params_stringified = JSON.stringify(res_data_params_as_key);
  // console.log("res_data_params_stringified", res_data_params_stringified);
  // const res_get_items_filepath = `./Search-cache/suit/get_items/${res_data_params_stringified}.json`;
  // console.log("res_get_items_filepath", res_get_items_filepath);
  // try {
  //   const res_get_items_data = await fs.promises.readFile(res_get_items_filepath, "utf8");
  //   // So the files exists
  //   // console.log("res_get_items_data", res_get_items_data, typeof res_get_items_data);
  //   const res_data_in_cache = JSON.parse(res_get_items_data);
  //   // console.log("res_get_items_data", res_data_in_cache, typeof res_data_in_cache);
  //   queryClient.setQueryData(res_data_params_as_key, res_data_in_cache);
  // }
  // catch (err) {
  // The file does not exist
  // console.log("get_items FILE READ FAILED", err);

  await Promise.all([
    queryClient.prefetchQuery(
      getSearchResidences_Query_dep_array({
        query,
      }),
      async () => {
        const params = getSearchResidences_API_params({
          query,
        });

        const body = buildSearchBody({
          page: params.page,
          page_size: params.page_size,
          order: params.order,
          filters: params.filters,
          features: params.features,
          replace_lead: params.replace_lead,
          lead_id: params.lead_id,
          alt_order: params.alt_order,
          page_type: params.page_type,
        });

        const resp = await fetch(`${backendUrl}/api/search/residences`, {
          method: "post",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(body),
        });

        const data = await resp.json();
        return mapSearchResponse(data);
      }
    ),
  ]);
  // }
  // END OF CACHING "get_items" RESPONSE.

  // START OF CACHING "get_metas" RESPONSE.
  // const city_meta_data_params_as_key = getSearchMetas_Query_dep_array({
  //   query,
  //   routerAsPath,
  // });
  // const city_meta_data_params_stringified = JSON.stringify(city_meta_data_params_as_key);
  // const city_get_metas_filepath = `./Search-cache/suit/get_metas/${city_meta_data_params_stringified}.json`;
  // try {
  //   const city_get_metas_data = await fs.promises.readFile(city_get_metas_filepath, "utf8");
  //   // So the files exists
  //   // console.log("city_get_metas_data", city_get_metas_data, typeof city_get_metas_data);
  //   const city_metas_in_cache = JSON.parse(city_get_metas_data);
  //   // console.log("city_metas_in_cache", city_metas_in_cache, typeof city_metas_in_cache);
  //   queryClient.setQueryData(city_meta_data_params_as_key, city_metas_in_cache);
  // }
  // catch (err) {
  // The file does not exist
  // console.log("get_metas FILE READ FAILED", err);
  // await Promise.all([
  //   queryClient.prefetchQuery(
  //     getSearchMetas_Query_dep_array({
  //       query,
  //       routerAsPath,
  //     }),
  //     async () => {
  //       const params = getSearchResidences_API_params({
  //         query,
  //         routerAsPath,
  //       });
  //       const refined_params = getRefinedParams({
  //         page: params.page,
  //         page_size: params.page_size,
  //         res_type: params.res_type,
  //         order: params.order,
  //         filters: params.filters,
  //         replace_lead: params.replace_lead,
  //         lead_id: params.lead_id,
  //         alt_order: params.alt_order,
  //         tag_title: params.tag_title,
  //       });
  //       const resp = await fetch(`${BASE_URL}/api/search/get_metas`, {
  //         method: "post",
  //         // mode: "cors",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //           // Cookie: getUserToken() + ";",
  //         },
  //         body: JSON.stringify({
  //           jsonrpc: "2.0",
  //           method: "call",
  //           params: refined_params,
  //           id: new Date().getUTCMilliseconds(),
  //         }),
  //       });

  //       const data = await resp.json();
  //       const parsedData = JSON.parse((data as any)?.result || "{}");

  //       // await fs.promises.writeFile(city_get_metas_filepath, JSON.stringify(parsedData));
  //       // console.log("GET_METAS DATA ADDED TO CACHE");

  //       return parsedData;
  //     }
  //   ),
  // ]);
  // }
  // END OF CACHING "get_metas" RESPONSE.

  // START OF CACHING "get_page_data" RESPONSE.
  // const get_page_data_params_as_key = getSearchData_Query_dep_array({
  //   query,
  //   routerAsPath,
  // });
  // const get_page_data_params_stringified = JSON.stringify(get_page_data_params_as_key);
  // // console.log("get_page_data_params_stringified", get_page_data_params_stringified);
  // const page_data_filepath = `./Search-cache/suit/get_page_data/${get_page_data_params_stringified}.json`;
  // console.log("page_data_filepath", page_data_filepath);
  // try {
  //   const page_data = await fs.promises.readFile(page_data_filepath, "utf8");
  //   // So the files exists
  //   // console.log("page_data", page_data, typeof page_data);
  //   const page_data_in_cache = JSON.parse(page_data);
  //   // console.log("page_data_in_cache", page_data_in_cache, typeof page_data_in_cache);
  //   queryClient.setQueryData(get_page_data_params_as_key, page_data_in_cache);
  // }
  //  catch (err) {
  // The file does not exist
  // console.log("get_page_data FILE READ FAILED", err);
  await Promise.all([
    queryClient.prefetchQuery(
      getSearchData_Query_dep_array({
        query,
      }),
      async () => {
        // Same reshape as api/Search/searchData.ts — must stay in sync (this
        // runs server-side, so it hits the backend by absolute URL). A stub
        // here previously returned empty params, which got dehydrated as
        // "fresh" data and blanked related searches / guide text / FAQ on
        // every initial page load.
        const params = getSearchResidences_API_params({ query });
        const cat = params?.filters?.cat_name;
        const tagsParam = params?.features?.length
          ? `&tags=${encodeURIComponent(params.features.join(","))}`
          : "";
        try {
          const resp = await fetch(
            `${backendUrl}/api/search/page-data?slug=${encodeURIComponent(cat || "s")}${tagsParam}`
          );
          const data = await resp.json();
          if (data?.status === "success") return { status: "success", params: data.data };
        } catch {
          /* backend unreachable — degrade to empty */
        }
        return { status: "success", params: {} };
      }
    ),
  ]);
  // }
  // END OF CACHING "get_page_data" RESPONSE.

  // const end = performance.now();

  // console.log(`Call took ${end - start} milliseconds`);

  const metaTagsOfSearchPage = (queryClient as any)?.queryCache?.queries.find((query: any) => {
    return query?.queryKey?.[0] === "getSearchData";
  })?.state?.data?.params;

  // A query that resolved to nothing is a soft 404: 200, no canonical, no
  // results. Google's sitelinks searchbox points visitors' free text at this
  // page, so without this those URLs are indexable empty pages. "follow" keeps
  // the links on the page worth crawling.
  const resultCount = (queryClient as any)?.queryCache?.queries.find(
    (query: any) => query?.queryKey?.[0] === "searchResidences"
  )?.state?.data?.params?.count;
  const isEmptyResult = resultCount === 0;

  // rel="prev"/rel="next" describe the sequence to a crawler, and the first
  // listing photo replaces the SVG logo as the social preview — SVG is not
  // rendered by Google or by any of the social networks.
  const searchProducts =
    (queryClient as any)?.queryCache?.queries.find(
      (query: any) => query?.queryKey?.[0] === "searchResidences"
    )?.state?.data?.params?.products ?? [];

  const currentPage = Number(query?.page) > 1 ? Number(query.page) : 1;
  const lastPage = resultCount ? Math.ceil(resultCount / search_pages_pageSize) : 1;

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (key === "page" || key === "id" || value === undefined) return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    if (page > 1) params.set("page", String(page));
    const base = `${BASE_URL}/search${query?.id ? `/${query.id}` : ""}`;
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const socialImage = searchProducts[0]?.main_image || SOCIAL_FALLBACK_IMAGE;

  // The count and the starting price go where "تضمین امنیت و نظافت" used to sit:
  // the same claim on every page, replaced by a live figure a searcher is
  // actually choosing on. Both come from the page's own canonical, unfiltered,
  // so the title does not move with a date or guest filter.
  const listingsPhrase = countAndPricePhrase(
    metaTagsOfSearchPage?.count,
    metaTagsOfSearchPage?.min_price
  );
  const composedTitle = withCountInTitle(
    metaTagsOfSearchPage?.title || "جستجوی اقامتگاه | لیدوما تریپ",
    listingsPhrase
  );

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    composedTitle,
    // MainLayout renders index 1 as the canonical <link> — it must sit here,
    // not further down the list (it silently rendered a broken tag before).
    metaTagsOfSearchPage?.canonical
      ? { rel: "canonical", href: `${metaTagsOfSearchPage?.canonical}` }
      : {},
    ...(isEmptyResult ? [{ name: "robots", content: "noindex,follow" }] : []),
    { name: "title", content: composedTitle },
    {
      name: "description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    {
      property: "og:url",
      content: `${metaTagsOfSearchPage?.canonical}`,
    },
    {
      property: "og:site_name",
      content: "لیدوما تریپ",
    },
    {
      property: "og:type",
      content: "website",
    },
    { property: "og:title", content: composedTitle },
    {
      property: "og:description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    { property: "og:image", content: socialImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    ...(currentPage > 1 ? [{ rel: "prev", href: pageHref(currentPage - 1) }] : []),
    ...(currentPage < lastPage ? [{ rel: "next", href: pageHref(currentPage + 1) }] : []),
    {
      name: "twitter:site",
      content: "@lidomatrip",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    {
      name: "twitter:description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    { name: "twitter:image:src", content: socialImage },
  ];

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      metaTagsList,
    },
  };
};

export default SearchPage;
