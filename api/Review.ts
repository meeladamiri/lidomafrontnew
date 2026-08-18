//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { I_Residence_display_type } from "@/interfaces/Residences";
import apiBuilder from "./apiBuilder";

export interface IServer_SubmittedReview {
  order_details: {
    end_date: string; // ex: "2023-04-12"
    guest: string;
    host: string;
    id: number;
    product: {
      display_type: I_Residence_display_type;
      id: number;
      image_url: string; // ex: "https://cdn.lidomatrip.com/web/image/product.template/20980/image/لوکس-ویلا-کردان.jpg"
      name: string;
    };
    start_date: string; // ex: "2023-04-11";
  };
  review_details?: {
    average: number;
    cleaning: number;
    comment: string;
    delivery: number;
    greeting: number;
    id: number;
    integrity: number;
    location: number;
    quality: number;
  };
}

const getMyTripSubmittedReviewDetails = async ({ order_id }: { order_id: string }) => {
  const url = `/api/review/get_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ order_id })
    .call();
};

export interface ISubmitMyTripReviewDetails {
  order_id: number;
  cleaning: number;
  location: number;
  greeting: number;
  quality: number;
  delivery: number;
  integrity: number;
  comment: string;
}

const submitMyTripReviewDetails = async ({
  order_id,
  cleaning,
  location,
  greeting,
  quality,
  delivery,
  integrity,
  comment,
}: ISubmitMyTripReviewDetails) => {
  const url = `/api/review/submit`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      order_id,
      cleaning,
      location,
      greeting,
      quality,
      delivery,
      integrity,
      comment,
    })
    .call();
};

export { getMyTripSubmittedReviewDetails, submitMyTripReviewDetails };
