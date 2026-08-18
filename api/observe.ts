//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { BASE_URL } from "@/configs/info";
import apiBuilder from "./apiBuilder";

const getObserveResidence = async ({ product_id }: { product_id: number }) => {
  const url = `/api/view_residence`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id,
    })
    .call();
};

const getObserveResidence2 = async ({ product_id }: { product_id: number }) => {
  const url = `${BASE_URL}/api/view_residence`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id,
    })
    .call();
};

const getPropertyPageMetaTags = async ({ product_id }: { product_id: number }) => {
  const url = `${BASE_URL}/api/get_meta_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      page: "product",
      product_id,
    })
    .call();
};

export { getObserveResidence, getObserveResidence2, getPropertyPageMetaTags };
