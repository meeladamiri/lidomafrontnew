
export type TCommentStatus = "good" | "bad" | "neutral";

export interface IComment {
  commentor: string;
  residenceCode?: number | string;
  travelDate: string | null;
  satisfaction: TCommentStatus;
  comment: string;
  meanScore: number;
  commentId: number;
  isPending?: boolean;
}

export function getSatisfaction(average_rating: number): TCommentStatus {
  return average_rating <= 2 ? "neutral" : average_rating < 4 ? "bad" : "good";
}

export function getCommentStatusIcon(status: TCommentStatus): string {
  if (status === "bad") {
    return "/assets/comments/Sad.svg";
  } else if (status === "good") {
    return "/assets/comments/Happy.svg";
  } else if (status === "neutral") {
    return "/assets/comments/Middle.svg";
  } else {
    return "";
  }
}
