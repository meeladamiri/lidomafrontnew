/**
 * Conversations.
 *
 * Was five Odoo JSON-RPC endpoints (get_order_messages, get_messages,
 * add_message, support_chats/get, support_chats/add), all of them gone. The
 * shapes below are what the new backend returns; the components were rewritten
 * against them rather than the old ones being adapted, because the old ones
 * had no unread counts, no read receipts, and no idea a message could be
 * anything but text.
 */

import apiBuilder from "./apiBuilder";

export type ConversationType = "BOOKING" | "SUPPORT";
export type ConversationStatus = "OPEN" | "PENDING" | "CLOSED";
export type ParticipantRole = "GUEST" | "HOST" | "ADMIN";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "INTERNAL_NOTE";

export interface IChatPeer {
  id: number;
  name: string | null;
  avatar: string | null;
}

export interface IConversationRow {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  subject: string | null;
  unread_count: number;
  is_muted: boolean;
  my_role: ParticipantRole;
  peer: IChatPeer | null;
  residence: { id: number; name: string; image: string | null } | null;
  booking: { reference: string; start_date: string; end_date: string; state: string } | null;
  last_message: string | null;
  last_message_at: string;
}

export interface IConversationDetail {
  id: string;
  type: ConversationType;
  status: ConversationStatus;
  subject: string | null;
  my_role: ParticipantRole;
  is_muted: boolean;
  unread_count: number;
  peer: IChatPeer | null;
  /** How far the other side has read — drives the second tick. */
  peer_last_read_message_id: number | null;
  residence: { id: number; name: string; image: string | null } | null;
  booking: {
    reference: string;
    start_date: string;
    end_date: string;
    guests_count: number;
    state: string;
    total_amount: number;
  } | null;
}

export interface IChatMessage {
  id: number;
  type: MessageType;
  body: string;
  meta: Record<string, any> | null;
  deleted: boolean;
  sender_id: number | null;
  sender_role: ParticipantRole | null;
  sender_name: string | null;
  sender_avatar: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_size: number | null;
  client_nonce: string | null;
  created_at: string;
  /** Client-side only: an optimistic message that has not been acknowledged. */
  pending?: boolean;
  failed?: boolean;
}

export interface IMessagePage {
  items: IChatMessage[];
  has_more: boolean;
  next_before: number | null;
}

const unwrap = (res: any) => res?.data;

export async function getConversations(params: {
  type?: ConversationType;
  cursor?: number;
  take?: number;
}): Promise<{ items: IConversationRow[]; next_cursor: number | null }> {
  const res = await apiBuilder
    .setUrl("/api/conversations")
    .setCallMethod("GET")
    .setParams({
      ...(params.type ? { type: params.type } : {}),
      ...(params.cursor ? { cursor: params.cursor } : {}),
      ...(params.take ? { take: params.take } : {}),
    })
    .call();
  return unwrap(res) ?? { items: [], next_cursor: null };
}

export async function getConversation(id: string): Promise<IConversationDetail | null> {
  const res = await apiBuilder.setUrl(`/api/conversations/${id}`).setCallMethod("GET").call();
  return unwrap(res) ?? null;
}

export async function getMessages(
  id: string,
  params: { before?: number; take?: number } = {}
): Promise<IMessagePage> {
  const res = await apiBuilder
    .setUrl(`/api/conversations/${id}/messages`)
    .setCallMethod("GET")
    .setParams(params)
    .call();
  return unwrap(res) ?? { items: [], has_more: false, next_before: null };
}

export async function sendChatMessage(
  id: string,
  payload: { body: string; client_nonce: string }
): Promise<IChatMessage | null> {
  const res = await apiBuilder
    .setUrl(`/api/conversations/${id}/messages`)
    .setCallMethod("POST")
    .setBody(payload)
    .call();
  return unwrap(res) ?? null;
}

export async function markConversationRead(id: string, lastMessageId?: number) {
  return apiBuilder
    .setUrl(`/api/conversations/${id}/read`)
    .setCallMethod("POST")
    .setBody(lastMessageId ? { last_message_id: lastMessageId } : {})
    .call();
}

export async function sendTyping(id: string) {
  return apiBuilder.setUrl(`/api/conversations/${id}/typing`).setCallMethod("POST").setBody({}).call();
}

export async function setConversationMuted(id: string, isMuted: boolean) {
  return apiBuilder
    .setUrl(`/api/conversations/${id}/mute`)
    .setCallMethod("POST")
    .setBody({ is_muted: isMuted })
    .call();
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiBuilder
    .setUrl("/api/conversations/unread-count")
    .setCallMethod("GET")
    .call();
  return unwrap(res)?.count ?? 0;
}

export async function createSupportConversation(payload: {
  subject: string;
  body: string;
}): Promise<string | null> {
  const res = await apiBuilder
    .setUrl("/api/conversations/support")
    .setCallMethod("POST")
    .setBody(payload)
    .call();
  return unwrap(res)?.id ?? null;
}

/**
 * A nonce per composed message.
 *
 * The point is that a retry — a flaky connection, an impatient second tap —
 * resolves to the message already stored rather than sending it twice. The
 * backend has a unique index on it, so the guarantee is the database's, not
 * this function's.
 */
export function newNonce(): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return random.replace(/-/g, "").slice(0, 32);
}
