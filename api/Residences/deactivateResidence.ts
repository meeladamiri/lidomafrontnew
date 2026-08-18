import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

const deactivateResidence = async ({
  product_id,
  product_type,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
}) => {
  const url = `/api/residence/change_state`;

  const params = {
    product_id,
    product_type,
    action: "deactivate",
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { deactivateResidence };
