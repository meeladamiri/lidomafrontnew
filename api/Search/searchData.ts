import apiBuilder from "../apiBuilder";

// Old backend: POST /api/search/new_page_data (Odoo JSON-RPC). New backend:
// GET /api/search/page-data?slug=<city-or-province slug or Persian name>.
// Response is reshaped into the old `{status, params:{...}}` envelope so
// every existing consumer (Search/index.tsx, useGetPersianCityname, the
// search pages' schema.org blocks) keeps working unchanged. `features` is
// accepted for signature-compatibility; page data is city-scoped, tags don't
// change it.
const getSearchData = async ({ cat_name }: { cat_name: string; features: string[] }) => {
  // "s" is the legacy root-category sentinel (no city selected).
  if (!cat_name || cat_name === "s") {
    const resp = await apiBuilder
      .setUrl(`/api/search/page-data?slug=${encodeURIComponent("s")}`)
      .setCallMethod("GET")
      .call();
    return reshape(resp);
  }

  const resp = await apiBuilder
    .setUrl(`/api/search/page-data?slug=${encodeURIComponent(cat_name)}`)
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
