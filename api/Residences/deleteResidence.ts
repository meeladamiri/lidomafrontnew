import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

const deleteResidence = async ({
  product_id,
  product_type,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
}) => {
  const url = `/api/residence/change_state`;

  const params = {
    product_id,
    action: "delete",
    product_type,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { deleteResidence };
