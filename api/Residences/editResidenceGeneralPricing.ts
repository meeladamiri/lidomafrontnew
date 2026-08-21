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

const editResidenceGeneralPricing = async ({
  product_type,
  product_id,
  week_price,
  weekend_price,
  peak_price,
  extra_price,
  weekly_discount,
  monthly_discount,
}: IEditResidenceGeneralPricing): Promise<any> => {
  if (product_type === ResidenceTypes_enum.ROOM) {
    return { status: "error", err_msg: "این قابلیت برای اتاق‌های بوم‌گردی هنوز پشتیبانی نمی‌شود" };
  }

  return apiBuilder
    .setUrl(`/api/host/residences/${product_id}/pricing`)
    .setCallMethod("PATCH")
    .setParams({
      weekPrice: week_price,
      weekendPrice: weekend_price,
      peakPrice: peak_price,
      extraPrice: extra_price,
      weeklyDiscount: weekly_discount,
      monthlyDiscount: monthly_discount,
    })
    .call();
};

export { editResidenceGeneralPricing };
