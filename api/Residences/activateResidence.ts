import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

const activateResidence = async ({
  product_id,
  product_type,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
}): Promise<any> => {
  if (product_type === ResidenceTypes_enum.ROOM) {
    return { status: "error", err_msg: "این قابلیت برای اتاق‌های بوم‌گردی هنوز پشتیبانی نمی‌شود" };
  }

  return apiBuilder
    .setUrl(`/api/host/residences/${product_id}/state`)
    .setCallMethod("PATCH")
    .setParams({ action: "activate" })
    .call();
};

export { activateResidence };
