import apiBuilder from "../apiBuilder";

export interface IResp_getCityName {
  id: number;
  name: string;
}
const getCityName = async (cityId: number) => {
  const url = `/api/categories/get_matches`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ cat_id: cityId })
    .call();
};

export { getCityName };
