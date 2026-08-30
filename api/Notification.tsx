import apiBuilder from "./apiBuilder";

/**
 * Notifications.
 *
 * What this replaces called a dead Odoo endpoint (`/api/notifications` via
 * jsonrpc, with a `status` enum and page/page_size) that the new backend never
 * implemented — the page had been showing an error toast on every load.
 */

export type NotificationKind =
  | "BOOKING_REQUESTED"
  | "BOOKING_APPROVED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "BOOKING_EXPIRED"
  | "BOOKING_COMPLETED"
  | "BOOKING_NEW_REQUEST"
  | "REVIEW_RECEIVED"
  | "RESIDENCE_PUBLISHED"
  | "RESIDENCE_REJECTED"
  | "MESSAGE_RECEIVED"
  | "ACCOUNT_VERIFIED";

export interface INotification {
  id: number;
  kind: NotificationKind;
  title: string;
  body: string;
  link_url: string | null;
  entity_type: string | null;
  entity_id: number | null;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

export interface INotificationPage {
  items: INotification[];
  next_cursor: number | null;
}

const unwrap = (res: any) => res?.data;

export async function getNotifications(params: {
  archived?: boolean;
  cursor?: number;
  take?: number;
}): Promise<INotificationPage> {
  const res = await apiBuilder
    .setUrl("/api/notifications")
    .setCallMethod("GET")
    .setParams({
      ...(params.archived ? { archived: "true" } : {}),
      ...(params.cursor ? { cursor: params.cursor } : {}),
      ...(params.take ? { take: params.take } : {}),
    })
    .call();

  return unwrap(res) ?? { items: [], next_cursor: null };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const res = await apiBuilder
    .setUrl("/api/notifications/unread-count")
    .setCallMethod("GET")
    .call();
  return unwrap(res)?.count ?? 0;
}

/** No ids means "everything unread". */
export async function markNotificationsRead(ids?: number[]): Promise<number> {
  const res = await apiBuilder
    .setUrl("/api/notifications/read")
    .setCallMethod("POST")
    .setBody(ids?.length ? { ids } : {})
    .call();
  return unwrap(res)?.updated ?? 0;
}

export async function archiveNotification(id: number, archived = true) {
  return apiBuilder
    .setUrl(`/api/notifications/${id}/archive`)
    .setCallMethod("POST")
    .setBody({ archived })
    .call();
}

export async function archiveAllNotifications(): Promise<number> {
  const res = await apiBuilder
    .setUrl("/api/notifications/archive-all")
    .setCallMethod("POST")
    .setBody({})
    .call();
  return unwrap(res)?.updated ?? 0;
}
