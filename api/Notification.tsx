//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { NotificationStatus_enum } from "@/constants/enums/notification_status";
import apiBuilder from "./apiBuilder";

// type ServerNotif_Types =
//   | "host_approve_reserve"
//   | "host_reject_reserve"
//   | "host_canceled_reserve"
//   | "host_new_reserve";

export interface I_SERVER_NOTIF {
  id: number;
  template: string;
  text: string;
  date: string; // ex: "2023-02-21 19:36:59";
}

const getNotificationsList = async ({
  status,
  page,
  page_size,
}: {
  status: NotificationStatus_enum;
  page: number;
  page_size: number;
}) => {
  const url = `/api/notifications`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      status,
      page,
      page_size,
    })
    .call();
};

export { getNotificationsList };
