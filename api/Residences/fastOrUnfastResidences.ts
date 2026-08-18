import { FastUnfastOptions_enum } from "@/constants/enums/fast_unfast_options";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

const fastOrUnfastResidences = async ({
  product_id,
  products,
  dates,
  fast,
  res_type,
}: {
  product_id?: number; // is required when an individual residence is selected; in this case 'products' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  fast: FastUnfastOptions_enum;
  products?: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  res_type: ResidenceTypes_enum;
}) => {
  // NOTE: Only one of 'product_id' or 'products' is needed to be provided.
  //       NOT both at the same thime. NOT None at the same time.
  //       'One of them' "MUST" be provided.

  const url = `/api/update_calendar`;

  const params: { [key: string]: any } = {
    dates,
    fast,
    res_type,
  };

  if (!!product_id) {
    params["product_id"] = product_id;
  } else if (!!products) {
    params["products"] = products;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { fastOrUnfastResidences };
