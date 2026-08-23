import Host from "@/components/Host";
import { mapHostProfileResponse } from "@/api/Residences/getMizbanAccountInfo";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

// all-null-able (not undefined) — Next.js props must be JSON-serializable
interface IHostMeta {
  id: string;
  name: string;
  city: string | null;
  image: string | null;
  description: string | null;
  residencesCount: number;
  reviewsCount: number;
}

// SEO goal: searching a host's name on Google should rank this page first —
// title pattern "میلاد امیری | میزبان لیدوما در شیراز | لیدوماتریپ", a
// descriptive meta, absolute canonical, OG/Twitter cards, and
// ProfilePage/Person structured data.
const HostPage: NextPage<{ hostMeta?: IHostMeta | null }> = ({ hostMeta }) => {
  const canonical = hostMeta ? `https://lidomatrip.com/host/${hostMeta.id}` : undefined;

  const schema = hostMeta
    ? {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "@id": canonical,
        mainEntity: {
          "@type": "Person",
          name: hostMeta.name,
          ...(hostMeta.image ? { image: hostMeta.image } : {}),
          ...(hostMeta.description ? { description: hostMeta.description } : {}),
          jobTitle: "میزبان اقامتگاه",
          ...(hostMeta.city
            ? {
                address: {
                  "@type": "PostalAddress",
                  addressLocality: hostMeta.city,
                  addressCountry: "IR",
                },
              }
            : {}),
          affiliation: {
            "@type": "Organization",
            name: "لیدوماتریپ",
            url: "https://lidomatrip.com",
          },
        },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "لیدوماتریپ",
              item: "https://lidomatrip.com",
            },
            { "@type": "ListItem", position: 2, name: hostMeta.name, item: canonical },
          ],
        },
      }
    : null;

  return (
    <>
      {!!schema && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        </Head>
      )}
      <Host />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query, res }) => {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  const queryClient = new QueryClient();
  const reference = query?.id;

  // Server-side rewrites don't apply to server-to-server fetches, so this hits
  // the backend by its real URL (same pattern as pages/rentals/[id].tsx).
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";

  const mapped = await queryClient.fetchQuery(["getMizbanAccountInfo", reference], async () => {
    const resp = await fetch(`${backendUrl}/api/residences/hosts/${reference}`);
    const body = await resp.json();
    return mapHostProfileResponse(body);
  });

  const info = (mapped as any)?.params;
  const hostMeta: IHostMeta | null = info?.host_info?.name
    ? {
        id: String(reference),
        name: info.host_info.name,
        city: info.host_info.city ?? null,
        image: info.host_info.image_url || null,
        description: info.host_info.description ?? null,
        residencesCount: info.residences?.length ?? 0,
        reviewsCount: info.reviews?.length ?? 0,
      }
    : null;

  if (!hostMeta) {
    return { notFound: true };
  }

  const inCity = hostMeta.city ? ` در ${hostMeta.city}` : "";
  const title = `${hostMeta.name} | میزبان لیدوما${inCity} | لیدوماتریپ`;
  const description = `صفحه رسمی ${hostMeta.name}، میزبان لیدوماتریپ${inCity} | ${
    hostMeta.residencesCount
  } اقامتگاه فعال${
    hostMeta.reviewsCount ? ` | ${hostMeta.reviewsCount} نظر مهمانان` : ""
  } | مشاهده اقامتگاه‌ها و رزرو آنلاین با تضمین لیدوماتریپ`;
  const canonical = `https://lidomatrip.com/host/${hostMeta.id}`;

  // MainLayout contract: index 0 = <title>, index 1 = canonical <link>,
  // the rest render as <meta> tags.
  const metaTagsList = [
    title,
    { rel: "canonical", href: canonical },
    { name: "title", content: title },
    { name: "description", content: description },
    { property: "og:type", content: "profile" },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: "لیدوما تریپ" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    ...(hostMeta.image ? [{ property: "og:image", content: hostMeta.image }] : []),
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      metaTagsList,
      hostMeta,
    },
  };
};

export default HostPage;
