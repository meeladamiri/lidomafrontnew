import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";
import apiBuilder from "../apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";

export interface I_MizbanAccountInfo_Data_review {
  average_rating: number;
  comment: string;
  customer: string;
  host_answer?: string;
  reserve_date: string; // ex: "2022-03-19"
  residence: {
    display_type: I_Residence_display_type;
    id: number;
    image_url: string; // "https://cdn.lidomatrip.com/web/image/product.template/21034/image/آپارتمان-مبله-آذرشهر.jpg";
    name: string;
  };
}

export interface I_MizbanAccountInfo_Data {
  host_info: {
    answer_time: number;
    confirm_percent: number; // ex: 43.333333333333336
    description?: string;
    image_url: string; // ex: "https://cdn.lidomatrip.com/web/image/res.partner/18186/image_small";
    name: string;
  };
  residences: IProduct_SearchResidences[];
  reviews: I_MizbanAccountInfo_Data_review[];
}

const getMizbanAccountInfo = async ({ reference }: { reference: string }) => {
  const url = `/api/about_host`;

  const params = {
    reference,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { getMizbanAccountInfo };
