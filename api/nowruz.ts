import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "./apiBuilder";

export interface IUpdateNowruzCalendar {
  product_id?: number;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  resType: ResidenceTypes_enum;
  price?: number;
}

const updateNowruzCalendar = async ({
  product_id,
  dates,
  resType,
  price,
}: IUpdateNowruzCalendar) => {
  const url = `/api/update_calendar`;

  const params: { [key: string]: any } = {
    dates,
    res_type: resType,
  };

  if (!!product_id) {
    params["product_id"] = product_id;
  }

  if (!!price) {
    params["special_price"] = price;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { updateNowruzCalendar };
