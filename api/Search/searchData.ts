import apiBuilder from "../apiBuilder";

// Old backend: POST /api/search/new_page_data (Odoo JSON-RPC). New backend:
// GET /api/search/page-data?slug=<slug>&tags=<tag,...>. Response is reshaped
// into the old `{status, params:{...}}` envelope so every existing consumer
// (Search/index.tsx, useGetPersianCityname, the search pages' schema.org
// blocks) keeps working unchanged. `features` matters: tag×city pages
// (?pool=1 etc.) carry their own SEO identity (H1/title/description).
const getSearchData = async ({ cat_name, features }: { cat_name: string; features: string[] }) => {
  // "s" is the legacy root-category sentinel (no city selected).
  const slug = !cat_name || cat_name === "s" ? "s" : cat_name;
  const tagsParam = features?.length ? `&tags=${encodeURIComponent(features.join(","))}` : "";

  const resp = await apiBuilder
    .setUrl(`/api/search/page-data?slug=${encodeURIComponent(slug)}${tagsParam}`)
    .setCallMethod("GET")
    .call();
  return reshape(resp);
};

function reshape(resp: any) {
  if (resp?.status !== "success") {
    return { status: "error", err_msg: resp?.message };
  }
  return { status: "success", params: resp?.data };
}

export { getSearchData };
