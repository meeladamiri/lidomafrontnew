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

function reshapeComment(r: any): IServerComment {
  return {
    average_rating: r.averageRating,
    comment: r.comment,
    customer: r.guest?.name ?? "",
    has_answer: !!r.hostAnswer,
    id: r.id,
    reserve_date: r.createdAt?.slice(0, 10) ?? "",
    residence_code: r.residence?.reference ?? "",
  };
}

const getComments = async () => {
  const resp = await apiBuilder.setUrl(`/api/host/reservations/reviews`).setCallMethod("GET").call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return { status: "success", params: { reviews: (resp.data || []).map(reshapeComment) } };
};

const getComment = async (commentId: number | string) => {
  const resp = await apiBuilder
    .setUrl(`/api/host/reservations/reviews/${commentId}`)
    .setCallMethod("GET")
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  const r = resp.data;
  return {
    status: "success",
    params: {
      review: {
        comment: r.comment,
        customer: r.guest?.name ?? "",
        host_answer: r.hostAnswer ?? undefined,
        display_type: r.residence?.type === "BOOMGARDI" ? "boomgardi" : "suit",
        id: r.id,
        rates: {
          average: r.averageRating,
          cleaning: r.cleaning,
          delivery: r.delivery,
          greeting: r.greeting,
          integrity: r.integrity,
          location: r.location,
          quality: r.quality,
        },
        reserve_date: r.createdAt?.slice(0, 10) ?? "",
        residence_code: r.residence?.reference ?? "",
        residence_image: r.residence?.images?.[0]?.url ?? "",
        residence_name: r.residence?.name ?? "",
      },
    },
  };
};

const replyToComment = async ({
  commentId,
  replyText,
}: {
  commentId: string; // ex: "5221"
  replyText: string;
}) => {
  const resp = await apiBuilder
    .setUrl(`/api/host/reservations/reviews/${commentId}/reply`)
    .setCallMethod("POST")
    .setParams({ hostAnswer: replyText })
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return { status: "success", params: resp.data };
};

export { getComments, getComment, replyToComment };
