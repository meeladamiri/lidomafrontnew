// import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";
import { I_Change_Residence_Status_display_type_payload } from "@/interfaces/ChangeResidencesStatus";
export type changeResidencesStatusUpdateCalendar_TEnable = "full" | "empty" | "nochange";
export type changeResidencesStatusUpdateCalendar_TFast = "fast" | "slow" | "nochange";

const changeResidencesStatusUpdateCalendar = async ({
  residences,
  rooms,
  dates,
  discount_amount,
  special_price,
  enable,
  fast,
  keyword,
  res_type,
  search_type,
}: {
  residences: number[]; // is required when an individual residence is selected; in this case 'products' will not be provided;
  rooms: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  enable: changeResidencesStatusUpdateCalendar_TEnable;
  fast: changeResidencesStatusUpdateCalendar_TFast;
  special_price: number;
  discount_amount: string;
  keyword?: string;
  res_type?: I_Change_Residence_Status_display_type_payload;
  search_type?: string;
}) => {
  // NOTE: Only one of 'product_id' or 'products' is needed to be provided.
  //       NOT both at the same thime. NOT None at the same time.
  //       'One of them' "MUST" be provided.

  const url = `/api/internal/update_calendar`;

  //   const params: { [key: string]: any } = {
  //     dates,
  //     res_type: resType,
  //   };

  //   if (!!product_id) {
  //     params["product_id"] = product_id;
  //   } else if (!!products) {
  //     params["products"] = products;
  //   }

  //   if (!!enable) {
  //     params["enable"] = enable;
  //   }

  //   if (!!price) {
  //     params["special_price"] = price;
  //   }

  //   if (!!discount) {
  //     params["discount_amount"] = discount;
  //   }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      residences,
      rooms,
      dates,
      discount_amount,
      special_price,
      enable,
      fast,
      keyword,
      res_type,
      search_type,  
    })
    .call();
};

export { changeResidencesStatusUpdateCalendar };
