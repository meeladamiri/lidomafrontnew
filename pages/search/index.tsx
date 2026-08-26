import Search from "@/components/Search";
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
// import Head from "next/head";
// import { useRouter } from "next/router";
// import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
// import { useSearchResidences } from "Hooks/SearchPages/useSearchResidences";
// import { ISearchResidences_ServerResp } from "@/interfaces/Search/SearchResp";
// import { determineResidenceTypeFromUrl } from "@/utilities/SearchPage/determineResidenceTypeFromUrl";

const SearchPage: NextPage = () => {
  // const router = useRouter();
  // const { data } = useSearchResidences();

  //   let schema = {
  //     "@context": "https://schema.org",
  //     "@type": "BreadcrumbList",
  //     itemListElement: [
  //       {
  //         "@type": "ListItem",
  //         position: 1,
  //         name: "لیدوماتریپ",
  //         item: "https://lidomatrip.com",
  //       },
  //       {
  //         "@type": "ListItem",
  //         position: 2,
  //         name: `اجاره ویلا و سوئیت در ${(router?.query?.id as string)
  //           ?.split("-")
  //           ?.slice(0, -1)
  //           ?.join("-")}`,
  //         item: `https://lidomatrip.com/search/${router?.query?.id}`,
  //       },
  //     ],
  //   };

  return (
    <>
      {/* <Head>
        {!!router?.query?.page && Number(router?.query?.page) - 1 !== 0 && (
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
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head> */}

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
        // runs server-side, so it hits the backend by absolute URL).
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

  const metaTagsOfSearchPage: {
    title: string | null;
    description: string | null;
    page_title: string | null;
    canonical: string | null; // ex: "https://lidomatrip.com/search/tehran"
  } = (queryClient as any)?.queryCache?.queries.find((query: any) => {
    return query?.queryKey?.[0] === "getSearchData";
  })?.state?.data?.params;

  // NOTE: Keep index zero item for the title tage of page always.
  const metaTagsList = [
    `${
      metaTagsOfSearchPage?.title ||
      metaTagsOfSearchPage?.page_title ||
      metaTagsOfSearchPage?.description ||
      "جستجوی اقامتگاه | لیدوما تریپ"
    }`,
    // MainLayout renders index 1 as the canonical <link> — it must sit here.
    metaTagsOfSearchPage?.canonical
      ? { rel: "canonical", href: `${metaTagsOfSearchPage?.canonical}` }
      : {},
    {
      name: "title",
      content: `${metaTagsOfSearchPage?.title}`,
    },
    {
      name: "description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    {
      name: "twitter:site",
      content: "@lidoma_trip",
    },
    {
      name: "twitter:title",
      content: `${metaTagsOfSearchPage?.title}`,
    },
    {
      name: "twitter:description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    {
      name: "twitter:image",
      content: "https://lidomatrip.com/assets/logos/Lidoma-logo2.svg",
    },
    {
      property: "og:title",
      content: `${metaTagsOfSearchPage?.title}`,
    },
    {
      property: "og:description",
      content: `${metaTagsOfSearchPage?.description}`,
    },
    {
      property: "og:image",
      content: "https://lidomatrip.com/assets/logos/Lidoma-logo2.svg",
    },
    {
      property: "og:url",
      content: `https://lidomatrip.com${req.url}`,
    },
    {
      property: "og:type",
      content: "website",
    },
    {
      property: "og:site_name",
      content: "لیدوماتریپ",
    },
  ];

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      metaTagsList,
    },
  };
};

export default SearchPage;
