//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

export interface IServerComment {
  average_rating: number;
  comment: string;
  customer: string;
  has_answer: boolean;
  id: number;
  reserve_date: string;
  residence_code: string;
}

const getComments = async () => {
  const url = `/api/get_reviews`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getComment = async (commentId: number | string) => {
  const url = `/api/get_review_details`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      review_id: commentId,
    })
    .call();
};

const replyToComment = async ({
  commentId,
  replyText,
}: {
  commentId: string; // ex: "5221"
  replyText: string;
}) => {
  const url = `/api/submit_host_response`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ response: replyText, review_id: commentId })
    .call();
};

export { getComments, getComment, replyToComment };
