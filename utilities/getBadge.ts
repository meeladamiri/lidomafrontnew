export const getBadge = (
  name: string,
  pending_messages: number,
  pending_notifs: number,
  pending_reviews: number
): number => {
  if (name === "نظرات") {
    return pending_reviews;
  } else if (name === "چت") {
    return pending_messages;
  } else if (name === "اعلانات") {
    return pending_notifs;
  } else {
    return 0;
  }
};
