//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const getAboutusPageData = async () => {
  const url = `/api/get_about_items`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { getAboutusPageData };
