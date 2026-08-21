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

function mapVerificationStatus(status: string | undefined): "confirmed" | "not_confirmed" | "checking" | "" {
  if (status === "CONFIRMED") return "confirmed";
  if (status === "CHECKING") return "checking";
  if (status === "NOT_CONFIRMED") return "not_confirmed";
  return "";
}

function reshapeUserInfo(u: any) {
  return {
    address: u?.address ?? "",
    avatar_url: u?.avatarUrl ?? "",
    birth_day: u?.birthDay ?? 0,
    birth_month: u?.birthMonth ?? 0,
    birth_year: u?.birthYear ?? 0,
    city: u?.city?.name ?? "",
    description: u?.description ?? "",
    education: u?.education ?? "",
    email: u?.email ?? "",
    emergency_phone: u?.emergencyPhone ?? "",
    fax: u?.fax ?? "",
    id: u?.id,
    job: u?.job ?? "",
    name: u?.name ?? "",
    national_card_url: u?.nationalCardUrl ?? "",
    national_code: u?.nationalCode ?? "",
    phone: u?.phone ?? "",
    province: u?.city?.province?.name ?? "",
    status: mapVerificationStatus(u?.verificationStatus),
    zip: u?.zip ?? "",
    contact_phone: u?.contactPhone ?? "",
    has_avatar: !!u?.avatarUrl,
    is_host: !!u?.isHost,
  };
}

const getAccountInfo = async (): Promise<any> => {
  const url = `/api/users/me`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  return {
    status: "success",
    params: { user_info: reshapeUserInfo(resp.data) },
  };
};

async function resolveCityId(cityName: string | undefined): Promise<number | undefined> {
  if (!cityName) return undefined;
  const resp = await apiBuilder
    .setUrl(`/api/search/cities`)
    .setCallMethod("GET")
    .setParams({ q: cityName })
    .call();
  if (resp?.status !== "success") return undefined;
  const match = (resp.data?.cities || []).find((c: any) => c.name === cityName) || resp.data?.cities?.[0];
  return match?.id;
}

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
  const cityId = await resolveCityId(data.city);

  const resp = await apiBuilder
    .setUrl(`/api/users/me`)
    .setCallMethod("PATCH")
    .setParams({
      name: data.name || undefined,
      email: data.email || undefined,
      nationalCode: data.national_code || undefined,
      address: data.address || undefined,
      cityId,
      zip: data.zip || undefined,
      fax: data.fax || undefined,
      job: data.job || undefined,
      education: data.education || undefined,
      birthDay: data.birth_day || undefined,
      birthMonth: data.birth_month || undefined,
      birthYear: data.birth_year || undefined,
      emergencyPhone: data.emergency_phone || undefined,
      description: data.description || undefined,
    })
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  return {
    status: "success",
    params: { user_info: reshapeUserInfo(resp.data) },
  };
};

export {
  getDashboardData,
  getDashboardData2,
  getTrips,
  getClearingRequests,
  getAccountInfo,
  updateAccountInfo,
};
