import apiBuilder from "./apiBuilder";

const SUBBASEURL = "/auth";

const getResidencesStatistics = async (product_id?: number | "all") => {
  const url = `/api/get_stats`;

  const apiBuilderReturn = apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(product_id ? { product_id } : {})
    .call();

  // console.log("apiBuilderReturn", apiBuilderReturn);
  return apiBuilderReturn;
};

export { getResidencesStatistics };
