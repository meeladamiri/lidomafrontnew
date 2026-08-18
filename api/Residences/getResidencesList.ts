import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import apiBuilder from "../apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { BASE_URL } from "@/configs/info";

export interface IServerRoom {
  id: number;
  is_fast: boolean;
  image_url: string;
  name: string;
  parent_id: number;
  state?: ResidenceStates_enum;
  // TODO: "ina" ro felan ezafe kardam (backend ham bayad ezafe kone)
  is_complete: boolean;
  last_update_time: string;
  reference: string;
  res_type: I_Residence_display_type;
  sales_count: number;
  completion_percent?: number;
  step?: number;
}

export interface IServerResidence {
  id: number;
  image_url: string;
  is_complete: boolean;
  is_fast_enabled: boolean;
  last_update_time: string;
  name: string;
  published: boolean;
  reference: string;
  res_type: I_Residence_display_type;
  sales_count: number;
  state: ResidenceStates_enum;
  completion_percent?: number; // property will have proper value 'only' when state == "completing"
  step?: number; // property will have proper value 'only' when state == "completing"
}

const getResidencesList = async () => {
  const url = `/api/users/panel/residences_list`;

  return apiBuilder.setUrl(url).setCallMethod("post").setJsonRpcMethod("call").setParams({}).call();
};

// For server-side pre-fetch
const getResidencesList2 = async () => {
  const url = `${BASE_URL}/api/users/panel/residences_list`;

  return apiBuilder.setUrl(url).setCallMethod("post").setJsonRpcMethod("call").setParams({}).call();
};

export { getResidencesList, getResidencesList2 };
