//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

export interface ISupportPage_FAQItem {
  answer: string;
  id: number;
  question: string;
}

const getSupportFAQs = async () => {
  const url = `/api/support_chats/faqs`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { getSupportFAQs };
