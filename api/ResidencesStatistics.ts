import apiBuilder from "./apiBuilder";

/**
 * آمار اقامتگاه‌های میزبان.
 *
 * This used to overwrite six rating fields and `reviews_count` with zeros on
 * the way through, with a comment saying reviews were not modelled yet. They
 * are — 9,427 of them, with all six sub-scores — so the page was rendering a
 * whole "میانگین امتیاز" panel of zeros over real data. The backend now
 * returns them and this passes them through.
 */
const getResidencesStatistics = async (product_id?: number | "all"): Promise<any> => {
  const resp = await apiBuilder
    .setUrl(`/api/host/residences/stats`)
    .setCallMethod("GET")
    .setParams(product_id && product_id !== "all" ? { residenceId: product_id } : {})
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  return { status: "success", params: resp.data };
};

export { getResidencesStatistics };
