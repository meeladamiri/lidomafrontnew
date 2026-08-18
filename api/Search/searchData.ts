import apiBuilder from "../apiBuilder";
// import { getRefinedParams } from "@/utilities/SearchPage/getRefinedParams";
// import { I_SearchResidenceApi_params } from "@/interfaces/Search/SearchResp";

const getSearchData = async ({ cat_name, features }: { cat_name: string; features: string[] }) => {
  const url = `/api/search/new_page_data`;

  const params: { [key: string]: any } = {
    cat_name,
  };

  if (features.length !== 0) {
    params["features"] = features;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { getSearchData };
