import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import apiBuilder from "../apiBuilder";

export interface IServer_Observe_Room {
  amenities: {
    cooling_system?: string;
    free_breakfast?: boolean;
    heating_system?: string;
    refrigerator?: "none" | "shared" | "dedicated";
    separate_bathroom?: boolean;
    wc?: "none" | "shared" | "dedicated";
  };
  capacity: number;
  description?: string;
  double_bed: number;
  extra_peak_price: number;
  extra_price: number;
  id: number;
  image: string; // ex: "https://test.lidomatrip.com/web/image/x_room/45440/x_image";
  max_capacity: number;
  monthly_discount: number;
  name: string;
  peak_price: number;
  single_bed: number;
  traditional_bed: number;
  week_price: number;
  weekend_price: number;
  weekly_discount: number;
}

const getResidenceFulldataToEdit = async ({
  product_id,
  product_type,
}: {
  product_id: number;
  product_type: ResidenceTypes_enum;
}) => {
  const url = `/api/edit_residence/get_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id,
      product_type,
    })
    .call();
};

export { getResidenceFulldataToEdit };
