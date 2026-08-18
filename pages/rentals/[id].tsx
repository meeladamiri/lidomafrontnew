import BoomgardiDetailsIndex from "@/components/ObserveResidenceDetails/BoomgardiDetailsIndex";
import SuitDetailsIndex from "@/components/ObserveResidenceDetails/SuitDetailsIndex";
import { BASE_URL } from "@/configs/info";
import { IRule } from "@/interfaces/observe_residence";
import { truncateText } from "@/utilities/truncateText";
// import { IObserveResidenceData } from "@/interfaces/observe_residence";
// import { getResIdFromURL } from "@/utilities/PropertyPage/getResIdFromURL";
// import { getCityidFromName } from "@/utilities/getCityidFromName";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

const RentalsPage: NextPage = () => {
  const { data } = useGetObserveResidence();
  const resType = data?.params?.residence_info?.display_type;

  let reviews = data?.params?.reviews.map((review: any) => {
    return {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review?.customer,
      },
      datePublished: review?.reserve_date,
      reviewBody: review?.comment,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review?.average_rating || "1",
        bestRating: "5",
        worstRating: "1",
      },
    };
  });

  let features = data?.params?.schema_data.map((feature: any) => {
    // Get the key (e.g., "تلویزیون") and value (e.g., true) from the feature object
    let key = Object.keys(feature)[0]; // Extract the key
    let value = feature[key]; // Extract the value associated with the key

    return {
      "@type": "LocationFeatureSpecification",
      name: key, // Use the extracted key as the name
      value: value, // Use the extracted value as the value
    };
  });

  let schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "سایت اجاره ویلا و اقامتگاه لیدوماتریپ",
        item: {
          "@type": "Thing",
          "@id": "https://lidomatrip.com",
        },
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `اجاره ویلا و اقامتگاه در استان ${data?.params?.residence_info?.province}`,
        item: {
          "@type": "Thing",
          "@id": `https://lidomatrip.com/search/${data?.params?.residence_info?.province_title}`,
        },
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `اجاره ویلا و سوئیت در ${data?.params?.residence_info?.city}`,
        item: {
          "@type": "Thing",
          "@id": `https://lidomatrip.com/search/${data?.params?.residence_info?.city_title}`,
        },
      },
      {
        "@type": "ListItem",
        position: 4,
        name: data?.params?.residence_info?.name,
        item: {
          "@type": "Thing",
          "@id": `https://lidomatrip.com/rentals/${data?.params?.residence_info?.id}`,
        },
      },
    ],
  };

  let schema2 = {
    "@context": "https://schema.org",
    "@type": ["Product", "Accommodation"],
    accommodationCategory: data?.params?.residence_info?.residence_type,
    name: data?.params?.residence_info?.name,
    image: data?.params?.residence_info?.main_image,
    description: truncateText(data?.params?.residence_info?.description, 160),
    numberOfBathroomsTotal: 1,
    numberOfRooms: data?.params?.rooms?.length,
    petsAllowed:
      data?.params?.rules.find(
        (el: IRule) =>
          el.category === "مقررات اقامتگاه" && el.name === "ورود حیوان خانگی مجاز می باشد."
      )?.value === "بله"
        ? true
        : false,
    smokingAllowed:
      data?.params?.rules.find(
        (el: IRule) =>
          el.category === "مقررات اقامتگاه" && el.name === "استعمال دخانیات مجاز می باشد"
      )?.value === "بله"
        ? true
        : false,
    address: {
      "@type": "PostalAddress",
      addressLocality: data?.params?.residence_info?.city,
      addressRegion: data?.params?.residence_info?.province,
      addressCountry: {
        "@type": "Country",
        name: "IR",
      },
    },
    offers: {
      "@type": "Offer",
      url: `https://lidomatrip.com/rentals/${data?.params?.residence_info?.id}`,
      priceCurrency: "IRR",
      price: data?.params?.residence_info?.price_details?.original_price + "0",
      // itemOffered: {
      //   "@type": ["Product", "Accommodation"],
      //   name: data?.params?.residence_info?.name,
      // },
      availability: "https://schema.org/InStock",
      validFrom: "2024-08-07",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: data?.params?.residence_info?.average_rating || "1",
      bestRating: "5",
      worstRating: "1",
      reviewCount: data?.params?.residence_info?.reviews_count || "1",
    },
  } as any;

  // Conditionally add the 'review' key to schema2 if reviews exist
  if (reviews?.length > 0) {
    schema2.review = reviews;
  }

  if (features?.length > 0) {
    schema2.amenityFeature = features;
  }

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
      {resType === "suit" ? (
        <SuitDetailsIndex />
      ) : (
        resType === "boomgardi" && <BoomgardiDetailsIndex />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader("Cache-Control", "public, s-maxage=35, stale-while-revalidate=59");

  const queryClient = new QueryClient();
  const resId = query?.id;

  await Promise.all([
    queryClient.prefetchQuery(["getObserveResidence", resId], async () => {
      const resp = await fetch(`${BASE_URL}/api/view_residence`, {
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
            product_id: Number(resId),
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      // console.log("Inside Promise.all, getObserveResidence is: ", parsedData);
      return parsedData;
    }),
  ]);

  await Promise.all([
    queryClient.prefetchQuery(["getPropertyPageMetaTags"], async () => {
      // const resp = await getPropertyPageMetaTags({
      //   product_id: Number(resId),
      // });
      // return resp;
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
            page: "product",
            product_id: Number(resId),
          },
          id: new Date().getUTCMilliseconds(),
        }),
      });
      const data = await resp.json();
      const parsedData = JSON.parse((data as any)?.result || "{}");
      console.log("Inside Promise.all, get_meta_tags is: ", parsedData);
      return parsedData;
    }),
    // queryClient.prefetchQuery(["getCalendarData", resId], async () => {
    //   // const resp = await getCalendarData2({
    //   //   residenceId: Number(resId),
    //   //   residenceType: ResidenceTypes_enum.PRODUCT,
    //   // });
    //   // return resp;
    //   const resp = await fetch(`${BASE_URL}/api/get_calendar_data`, {
    //     method: "post",
    //     // mode: "cors",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Accept: "application/json",
    //       // Cookie: getUserToken() + ";",
    //     },
    //     body: JSON.stringify({
    //       jsonrpc: "2.0",
    //       method: "call",
    //       params: {
    //         residence_id: Number(resId),
    //         residence_type: ResidenceTypes_enum.PRODUCT,
    //       },
    //       id: new Date().getUTCMilliseconds(),
    //     }),
    //   });
    //   const data = await resp.json();
    //   const parsedData = JSON.parse((data as any)?.result || "{}");
    //   // console.log("Inside Promise.all, getCalendarData is: ", parsedData);
    //   return parsedData;
    // }),
  ]);

  const metaTagsOfRentalsPage = (queryClient as any).queryCache.queries[1]?.state?.data;

  console.log("renatalsmeta", metaTagsOfRentalsPage);

  // NOTE: Keep index zero item for the title tage of page always.
  // NOTE: Keep index one item for the canonical tage of page always.

  const metaTagsList = [
    `${metaTagsOfRentalsPage?.params?.title}`,
    {
      name: "title",
      content: `${metaTagsOfRentalsPage?.params?.title}`,
    },
    {
      rel: "canonical",
      href: `${BASE_URL}/rentals/${resId}`,
    },
    {
      name: "description",
      content: `${metaTagsOfRentalsPage?.params?.description}`,
    },
    {
      property: "og:url",
      content: `${BASE_URL}/rentals/${resId}`,
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
      content: `${metaTagsOfRentalsPage?.params?.title}`,
    },
    {
      property: "og:description",
      content: `${metaTagsOfRentalsPage?.params?.description}`,
    },
    {
      property: "og:image",
      content: `${metaTagsOfRentalsPage?.params?.image}`,
    },
    {
      name: "twitter:site",
      content: "@lidomatrip",
    },
    {
      name: "twitter:card",
      content: `${metaTagsOfRentalsPage?.params?.image}`,
    },
    {
      name: "twitter:title",
      content: `${metaTagsOfRentalsPage?.params?.title}`,
    },
    {
      name: "twitter:description",
      content: `${metaTagsOfRentalsPage?.params?.description}`,
    },
    {
      name: "twitter:image:src",
      content: `${metaTagsOfRentalsPage?.params?.image}`,
    },
  ];

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      metaTagsList,
    },
  };
};

export default RentalsPage;
