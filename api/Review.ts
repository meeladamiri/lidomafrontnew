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
  const [reservationResp, reviewResp] = await Promise.all([
    apiBuilder.setUrl(`/api/reservations/${order_id}`).setCallMethod("GET").call(),
    apiBuilder.setUrl(`/api/reservations/${order_id}/review`).setCallMethod("GET").call(),
  ]);

  if (reservationResp?.status !== "success") {
    return { status: "error", err_msg: reservationResp?.message };
  }

  const r = reservationResp.data;
  const review = reviewResp?.status === "success" ? reviewResp.data : null;

  const data: IServer_SubmittedReview = {
    order_details: {
      end_date: r?.endDate?.slice(0, 10) ?? "",
      guest: r?.guest?.name ?? "",
      host: r?.host?.name ?? "",
      id: r?.id,
      product: {
        display_type: r?.residence?.type === "BOOMGARDI" ? "boomgardi" : "suit",
        id: r?.residence?.id,
        image_url: r?.residence?.images?.[0]?.url ?? "",
        name: r?.residence?.name ?? "",
      },
      start_date: r?.startDate?.slice(0, 10) ?? "",
    },
    review_details: review
      ? {
          average: review.averageRating,
          cleaning: review.cleaning,
          comment: review.comment,
          delivery: review.delivery,
          greeting: review.greeting,
          id: review.id,
          integrity: review.integrity,
          location: review.location,
          quality: review.quality,
        }
      : undefined,
  };

  return { status: "success", params: data };
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

const submitMyTripReviewDetails = async ({ order_id, ...scores }: ISubmitMyTripReviewDetails) => {
  const resp = await apiBuilder
    .setUrl(`/api/reservations/${order_id}/review`)
    .setCallMethod("POST")
    .setParams(scores)
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return { status: "success", params: resp.data };
};

export { getMyTripSubmittedReviewDetails, submitMyTripReviewDetails };
