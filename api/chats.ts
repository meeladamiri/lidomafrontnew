//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { ChatStatus_enum } from "@/constants/enums/chat_status";
import apiBuilder from "./apiBuilder";
import { ReserveStates_enum } from "constants/enums/reserve_states";

export interface IChat {
  action?: "start" | "continue"; // Note: will exist only when ChatStatus == "active"
  contact: {
    avatar_url: string; // ex: "https://test.lidomatrip.com/web/image/res.partner/90606/image_small"
    name: string;
  };
  end_date: string;
  id: number;
  reference: string;
  start_date: string;
}

const getAllChats = async ({
  page = 1,
  page_size = -1,
  status,
}: {
  page: number;
  page_size: number;
  status: ChatStatus_enum;
}) => {
  const url = `/api/get_order_messages`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ page, page_size, status })
    .call();
};

interface IChatMessage {
  date: string; // ex: "2023-01-30"
  time: string; // ex: "11:07:20"
  id: number;
  seen: boolean;
  sender: string;
  text: string;
}

export interface ISingleChatDetails {
  contact: {
    avatar_url: string; // ex: "https://test.lidomatrip.com/web/image/res.partner/87192/image_small"
    name: string;
  };
  messages: IChatMessage[];
  order_details: {
    end_date: string; // ex: "2023-02-17"
    extra_guests_count: number;
    guests_count: number;
    id: number;
    price: number;
    product_id: number;
    reference: string;
    start_date: string; // ex: "2023-02-16"
    state: "cancel" | string;
    x_state?: "finished" | string; // TODO: not sure about other values
  };
}

const getSingleChatMessages = async ({ order_id }: { order_id: number }) => {
  const url = `/api/get_messages`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ order_id })
    .call();
};

const submitChatMessage = async ({ text, order_id }: { text: string; order_id: number }) => {
  const url = `/api/add_message`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      text,
      order_id,
    })
    .call();
};

export interface ISupportChatMessage {
  attachments: any[]; // TODO: change any with api schema later.
  date: string; // ex: "2023-02-13 15:12:17";
  id: number;
  sender: string;
  text: string;
}

const getSupportPageMessages = async () => {
  const url = `/api/support_chats/get`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({})
    .setBody(undefined)
    .call();
};

const submitNewMessageInSupportPage = async ({
  text,
}: // attaches,
{
  text: string;
  // attaches: any[];
}) => {
  const url = `/api/support_chats/add`;

  // NOTE: attch property should be like attach_1, attach_2, attach_3, ...

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({})
    .setBody({ text })
    .call();
};

export {
  getAllChats,
  getSingleChatMessages,
  submitChatMessage,
  getSupportPageMessages,
  submitNewMessageInSupportPage,
};
