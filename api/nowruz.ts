import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { jalaliToIso } from "@/utilities/jalaliGregorian";
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
}: IUpdateNowruzCalendar): Promise<any> => {
  if (resType === ResidenceTypes_enum.ROOM) {
    return { status: "error", err_msg: "این قابلیت برای اتاق‌های بوم‌گردی هنوز پشتیبانی نمی‌شود" };
  }
  if (!product_id) return { status: "error", err_msg: "اقامتگاه انتخاب نشده است" };

  const params: Record<string, any> = { dates: dates.map(jalaliToIso) };
  if (price) params.specialPrice = price;

  return apiBuilder
    .setUrl(`/api/host/residences/${product_id}/calendar`)
    .setCallMethod("PATCH")
    .setParams(params)
    .call();
};

export { updateNowruzCalendar };
