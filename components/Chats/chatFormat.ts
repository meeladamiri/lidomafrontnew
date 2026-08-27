import type { IChatMessage } from "@/api/chats";

/**
 * Jalali formatting through `Intl`, not moment-jalaali.
 *
 * The chat needs a clock time and a day label, and `Intl.DateTimeFormat` with
 * the `fa-IR` locale gives both — in Persian digits, correctly — for nothing.
 * moment-jalaali is already a weight the search bundle carries and PROGRESS.md
 * lists as worth removing; there is no case for adding it to a second page.
 */

const timeFormat = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" });
const dayWithYear = new Intl.DateTimeFormat("fa-IR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function timeOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : timeFormat.format(date);
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** "امروز" / "دیروز" / "۵ شهریور" — and the year once the message is older than one. */
export function dayLabelOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days === 0) return "امروز";
  if (days === 1) return "دیروز";
  return days > 330 ? dayWithYear.format(date) : dayFormat.format(date);
}

/** The short stamp on a conversation row: a time today, a day label before that. */
export function listStampOf(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return startOfDay(date) === startOfDay(new Date()) ? timeFormat.format(date) : dayLabelOf(iso);
}

export interface DayGroup {
  label: string;
  messages: IChatMessage[];
}

/**
 * Splits a thread into day groups so the reader gets a divider rather than an
 * unbroken column of bubbles with no sense of when anything was said.
 */
export function groupByDay(messages: IChatMessage[]): DayGroup[] {
  const groups: DayGroup[] = [];

  for (const message of messages) {
    const label = dayLabelOf(message.created_at);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  }

  return groups;
}
