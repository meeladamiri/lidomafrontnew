import type { NotificationKind } from "@/api/Notification";

/**
 * How each kind is presented: one icon, one colour, one place.
 *
 * What this replaces had two maps that disagreed. `NotificationTypes` listed
 * 14 kinds and was never read by anything; `ServerNotif_Types_Map_ToLocal`
 * listed 34 Odoo template names — `host_*` and `guest_*` variants of the same
 * event, each with its own hardcoded Persian title.
 *
 * Titles no longer live here at all. The backend writes the title and body at
 * the moment the event happens, so a guest's "your booking was approved" and a
 * host's "you approved a booking" are different sentences without needing two
 * kinds. All this map decides is what it looks like.
 */
export const KIND_STYLE: Record<
  NotificationKind,
  { icon: string; tone: string }
> = {
  BOOKING_REQUESTED: { icon: "icon-Reserve", tone: "text-primary-main" },
  BOOKING_NEW_REQUEST: { icon: "icon-Reserve", tone: "text-primary-main" },
  BOOKING_APPROVED: { icon: "icon-Success", tone: "text-success" },
  BOOKING_COMPLETED: { icon: "icon-Success", tone: "text-success" },
  BOOKING_REJECTED: { icon: "icon-Error", tone: "text-error-light" },
  BOOKING_CANCELLED: { icon: "icon-Error", tone: "text-error-light" },
  BOOKING_EXPIRED: { icon: "icon-Calendar", tone: "text-gray-959FA7" },
  REVIEW_RECEIVED: { icon: "icon-Comments", tone: "text-black" },
  MESSAGE_RECEIVED: { icon: "icon-message", tone: "text-black" },
  RESIDENCE_PUBLISHED: { icon: "icon-AddHome", tone: "text-success" },
  RESIDENCE_REJECTED: { icon: "icon-AddHome", tone: "text-error-light" },
  ACCOUNT_VERIFIED: { icon: "icon-Profile", tone: "text-success" },
};

/** A kind the front does not know yet still renders as something. */
export const FALLBACK_STYLE = { icon: "icon-Bell", tone: "text-gray-959FA7" };

export function styleFor(kind: NotificationKind) {
  return KIND_STYLE[kind] ?? FALLBACK_STYLE;
}

/**
 * "۳ دقیقه پیش" rather than a date.
 *
 * A notification's value is mostly how recent it is; a Jalali date makes the
 * reader do the subtraction. Falls back to a date once that stops being the
 * interesting part.
 */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.floor((Date.now() - then) / 1000);
  const fa = (n: number) => Math.floor(n).toLocaleString("fa-IR");

  if (seconds < 60) return "همین حالا";
  if (seconds < 3600) return `${fa(seconds / 60)} دقیقه پیش`;
  if (seconds < 86400) return `${fa(seconds / 3600)} ساعت پیش`;
  if (seconds < 604800) return `${fa(seconds / 86400)} روز پیش`;

  return new Intl.DateTimeFormat("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
