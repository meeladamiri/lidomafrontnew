import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";
export type UpdateCalendar_TEnable = "full" | "empty" | undefined; // is 'undefined' in case of NoChange

const updateCalendar = async ({
  product_id,
  products,
  dates,
  enable,
  resType,
  price,
  discount,
}: {
  product_id?: number; // is required when an individual residence is selected; in this case 'products' will not be provided;
  products?: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  resType: ResidenceTypes_enum;
  enable: UpdateCalendar_TEnable;
  price?: number;
  discount?: number;
}) => {
  // NOTE: Only one of 'product_id' or 'products' is needed to be provided.
  //       NOT both at the same thime. NOT None at the same time.
  //       'One of them' "MUST" be provided.

  const url = `/api/update_calendar`;

  const params: { [key: string]: any } = {
    dates,
    res_type: resType,
  };

  if (!!product_id) {
    params["product_id"] = product_id;
  } else if (!!products) {
    params["products"] = products;
  }

  if (!!enable) {
    params["enable"] = enable;
  }

  if (!!price) {
    params["special_price"] = price;
  }

  if (!!discount) {
    params["discount_amount"] = discount;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { updateCalendar };
