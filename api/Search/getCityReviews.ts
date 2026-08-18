import apiBuilder from "../apiBuilder";
import { I_GetCityReviewsApi_params } from "@/interfaces/Search/SearchResp";

interface IResidense {
  id: number;
  name: string;
  min_price: number;
  main_image: string;
}

export interface IResp_getCityReviews {
  id: number;
  customer: string;
  comment: string;
  average_rating: number;
  reserve_date: string;
  residence: IResidense;
}[]

const getCityReviews = async ({ res_type, cat_id }: I_GetCityReviewsApi_params) => {
  const url = `/api/search/get_city_reviews`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      res_type,
      cat_id,
    })
    .call();
};

export { getCityReviews };
