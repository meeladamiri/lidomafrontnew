import apiBuilder from "../apiBuilder";

const getCityId = async (cityName: string) => {
  const url = `/api/categories/get_matches`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ cat_name: cityName })
    .call();
};

export { getCityId };
