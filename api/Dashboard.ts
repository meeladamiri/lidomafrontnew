//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { BASE_URL } from "@/configs/info";
import apiBuilder from "./apiBuilder";

interface I_Guest_Current_Requests {
  days_count: number;
  end_date: string;
  expiry_date: string;
  guests_count: number;
  host: {
    name: string;
    phone: string;
  };
  id: number;
  product: {
    address: string;
    id: number;
    name: string;
  };
  reference: string;
  start_date: string;
  state: string;
  total_amount: number;
}

interface IPartner {
  has_avatar: boolean;
  has_national_card_image: boolean;
  has_shaba: boolean;
  id: number;
  image_url: string;
  is_host: boolean;
  name: string;
}

interface I_Host_Current_Requests {}
interface I_New_Residence {}
interface IAnnouncement {
  title: string;
  text: string;
}

export interface IDashboardData {
  announcement: IAnnouncement;
  guest_current_requests: I_Guest_Current_Requests[];
  host_current_requests: I_Host_Current_Requests[];
  new_residences: I_New_Residence[];
  partner: IPartner;
  pending_messages: number;
  pending_reviews: number;
}

const getDashboardData = async () => {
  const url = `/api/users/dashboard`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getDashboardData2 = async () => {
  const url = `${BASE_URL}/api/users/dashboard`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export interface IDashboardSlider {
  image_url: string;
  link?: string;
}

const getTrips = async () => {
  const url = `/api/users/panel/trips_list`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getClearingRequests = async () => {
  const url = `/api/get_clearing_reqs`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getAccountInfo = async () => {
  const url = `/api/user/account_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      test_param: "09361323233",
    })
    .call();
};

export interface IUpdateAccountInfo {
  name: string;
  national_code: string;
  phone: string;
  emergency_phone: string;
  province_id: string;
  city: string;
  email: string;
  zip: string;
  address: string;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  education: string;
  job: string;
  fax: string;
  description: string;
}

const updateAccountInfo = async (data: IUpdateAccountInfo) => {
  const url = `/api/update_account`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(data)
    .call();
};

export {
  getDashboardData,
  getDashboardData2,
  getTrips,
  getClearingRequests,
  getAccountInfo,
  updateAccountInfo,
};
