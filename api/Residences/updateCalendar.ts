import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { jalaliToIso } from "@/utilities/jalaliGregorian";
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
  isFast,
}: {
  product_id?: number; // is required when an individual residence is selected; in this case 'products' will not be provided;
  products?: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  resType: ResidenceTypes_enum;
  enable: UpdateCalendar_TEnable;
  price?: number;
  discount?: number;
  /**
   * «رزرو آنی» for the selected days.
   *
   * Undefined means the host did not touch it, which is not the same as
   * false — sending false would turn instant booking off on every day they
   * only meant to reprice.
   */
  isFast?: boolean;
}): Promise<any> => {
  if (resType === ResidenceTypes_enum.ROOM) {
    return { status: "error", err_msg: "این قابلیت برای اتاق‌های بوم‌گردی هنوز پشتیبانی نمی‌شود" };
  }

  const ids = product_id ? [product_id] : products || [];
  const isoDates = dates.map(jalaliToIso);

  const params: Record<string, any> = { dates: isoDates };
  if (enable === "full") params.isBlocked = true;
  if (enable === "empty") params.isBlocked = false;
  if (price) params.specialPrice = price;
  if (isFast !== undefined) params.isFast = isFast;
  if (discount) {
    params.discountAmount = discount;
    params.discountType = "PERCENTAGE";
  }

  const results = await Promise.all(
    ids.map((id) =>
      apiBuilder
        .setUrl(`/api/host/residences/${id}/calendar`)
        .setCallMethod("PATCH")
        .setParams(params)
        .call()
    )
  );

  const failed = results.find((r) => r?.status !== "success");
  if (failed) return { status: "error", err_msg: failed?.message };
  return { status: "success" };
};

export { updateCalendar };
