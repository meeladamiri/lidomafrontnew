//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const submitStep = async ({
  step,
  productId,
  data,
}: {
  step: number;
  productId?: number; // will not exist only in first step
  data: { [key: string]: any };
}) => {
  const url = `/api/new_residence/submit_info`;

  const params: { [key: string]: any } = {
    step,
    ...data,
  };

  if (!!productId) {
    params["product_id"] = productId;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { submitStep };
