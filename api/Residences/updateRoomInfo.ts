import apiBuilder from "../apiBuilder";

export interface IUpdateRoomInfo {
  room_id: number;
  name: string;
  similar_res: number;
  capacity: number;
  max_capacity: number;
  week_price: number;
  weekend_price: number;
  peak_price: number;
  extra_price: number;
  extra_peak_price: number;
  weekly_discount: number;
  monthly_discount: number;
  single_bed: number;
  double_bed: number;
  traditional_bed: number;
  cooling_system: string;
  heating_system: string;
  refrigerator: "none" | "shared" | "dedicated";
  wc: "none" | "shared" | "dedicated";
  separate_bathroom: boolean;
  free_breakfast: boolean;
  description: string;
  image?: File;
}

const updateRoomInfo = async (data: IUpdateRoomInfo) => {
  const url = `/api/edit_room`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setBody(data)
    .setParams({})
    .call();
};

export { updateRoomInfo };
