import apiBuilder from "./apiBuilder";

// Rating fields have no backend equivalent yet — reviews aren't modeled
// (Phase 2). Reservation/income fields are real, computed server-side.
const getResidencesStatistics = async (product_id?: number | "all"): Promise<any> => {
  const resp = await apiBuilder
    .setUrl(`/api/host/residences/stats`)
    .setCallMethod("GET")
    .setParams(product_id && product_id !== "all" ? { residenceId: product_id } : {})
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  return {
    status: "success",
    params: {
      ...resp.data,
      location_rate: 0,
      cleaning_rate: 0,
      quality_rate: 0,
      integrity_rate: 0,
      greeting_rate: 0,
      delivery_rate: 0,
      reviews_count: 0,
    },
  };
};

export { getResidencesStatistics };
