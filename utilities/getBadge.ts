/**
 * The unread count to show on a navigation item.
 *
 * Keyed by route, not by label. It used to compare the item's Persian text
 * (`name === "چت"`), which meant the badge was attached to a piece of copy:
 * renaming «گفتگو» to «چت» — which this project did — silently detached the
 * unread count from the item, with nothing failing to say so. A route is what
 * the item actually is, and it cannot be reworded.
 */
const BADGE_BY_ROUTE: Record<string, "messages" | "notifs" | "reviews"> = {
  "/chats": "messages",
  "/notifications": "notifs",
  "/comments": "reviews",
};

export const getBadge = (
  /** The item's `linkTo` — e.g. «/chats». */
  route: string,
  pending_messages: number,
  pending_notifs: number,
  pending_reviews: number
): number => {
  switch (BADGE_BY_ROUTE[route]) {
    case "messages":
      return pending_messages;
    case "notifs":
      return pending_notifs;
    case "reviews":
      return pending_reviews;
    default:
      return 0;
  }
};
