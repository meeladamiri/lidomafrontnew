//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const getProvincesAndCities = async (): Promise<any> => {
  const resp = await apiBuilder.setUrl(`/api/search/provinces`).setCallMethod("GET").call();
  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return {
    status: "success",
    params: {
      states: (resp.data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        latitude: p.latitude != null ? String(p.latitude) : "",
        longitude: p.longitude != null ? String(p.longitude) : "",
        cities: p.cities || [],
      })),
    },
  };
};

export { getProvincesAndCities };
