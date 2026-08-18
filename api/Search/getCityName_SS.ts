import { BASE_URL } from "@/configs/info";
import apiBuilder from "../apiBuilder";

export interface IResp_getCityName_SS {
  id: number;
  name: string;
}

const getCityName_SS = async (cityId: number) => {
  const url = `${BASE_URL}/api/categories/get_matches`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ cat_id: cityId })
    .call();
};

export { getCityName_SS };
