import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

export interface IEditResidenceGeneralPricing {
  product_type: ResidenceTypes_enum;
  product_id: number;
  week_price: number;
  weekend_price: number;
  peak_price: number;
  extra_price: number;
  weekly_discount: number;
  monthly_discount: number;
}

const changeResidencesStatusGeneralPricing = async ({
  product_type,
  product_id,
  week_price,
  weekend_price,
  peak_price,
  extra_price,
  weekly_discount,
  monthly_discount,
}: IEditResidenceGeneralPricing) => {
  const url = `/api/update_prices`;

  const params = {
    product_type,
    product_id,
    week_price,
    weekend_price,
    peak_price,
    extra_price,
    weekly_discount,
    monthly_discount,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { changeResidencesStatusGeneralPricing };
