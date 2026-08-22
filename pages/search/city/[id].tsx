import { GetServerSideProps } from "next";

// Legacy city-page URLs in the "/search/city/<persian-name>-<odoo-id>" format
// (e.g. /search/city/تهران-164). The old production site 301s these to the
// English-slug page (/search/tehran); mirror that by resolving the Persian
// name against the backend's city index. Query params (dates, filters) are
// carried over.
export const getServerSideProps: GetServerSideProps = async ({ params, resolvedUrl }) => {
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
  const raw = decodeURIComponent(String(params?.id ?? ""));
  // Strip the trailing "-<odoo id>"; URL dashes stand in for spaces in the name.
  const name = raw.replace(/-\d+$/, "").replace(/-/g, " ").trim();
  const queryString = resolvedUrl.includes("?") ? `?${resolvedUrl.split("?")[1]}` : "";

  let target = "/search";
  if (name) {
    try {
      const resp = await fetch(`${backendUrl}/api/search/cities?q=${encodeURIComponent(name)}`);
      const data = await resp.json();
      const cities: { name: string; titleEn: string | null }[] = data?.data?.cities ?? [];
      const city = cities.find((c) => c.name === name) ?? cities[0];
      if (city) target = `/search/${city.titleEn ?? encodeURIComponent(city.name)}`;
    } catch {
      // backend unreachable — fall through to /search
    }
  }

  // statusCode 301 (not `permanent: true`'s 308) to match the old production
  // site byte-for-byte for SEO tooling.
  return { redirect: { destination: `${target}${queryString}`, statusCode: 301 } };
};

// Never rendered — getServerSideProps always redirects.
export default function LegacyCityRedirect() {
  return null;
}
