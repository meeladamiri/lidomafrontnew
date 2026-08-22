import { GetServerSideProps } from "next";

// Legacy Odoo SEO tag pages (e.g. /tags/villa/اجاره-ویلا-در-آبادان). ~10k of
// these are indexed; the old production site 301s each to its new-format
// equivalent (/search/abadan?villa=1) via the legacy `tag_url` table, which
// was migrated into the backend's `legacy_redirects`. Unknown slugs fall back
// to /search — same as production.
export const getServerSideProps: GetServerSideProps = async ({ resolvedUrl }) => {
  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:4000";
  const path = resolvedUrl.split("?")[0];

  let target = "/search";
  try {
    const resp = await fetch(
      `${backendUrl}/api/search/legacy-redirect?path=${encodeURIComponent(path)}`
    );
    const data = await resp.json();
    if (data?.data?.target) target = data.data.target;
  } catch {
    // backend unreachable — still send the visitor somewhere useful
  }

  // statusCode 301 (not `permanent: true`'s 308) to match the old production
  // site byte-for-byte for SEO tooling.
  return { redirect: { destination: target, statusCode: 301 } };
};

// Never rendered — getServerSideProps always redirects.
export default function LegacyTagRedirect() {
  return null;
}
