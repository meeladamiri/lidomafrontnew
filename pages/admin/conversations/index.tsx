import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  EmptyState,
  Skeleton,
  StatTile,
  TabPills,
  ToolbarSearch,
  faDate,
  faNum,
} from "@/components/Admin/ui";

/**
 * Conversation management.
 *
 * Two panes, because triage and reading are the same task here: the queue on
 * the right, the thread on the left, and the reply box under it. A list that
 * links away to a detail page makes answering ten tickets ten navigations.
 *
 * Two things the panel can do that the participants cannot see: an internal
 * note, and the flag on a message that looks like an attempt to take the
 * booking off the platform.
 */

type Tab = "all" | "SUPPORT" | "BOOKING" | "flagged" | "unassigned";

interface AdminConversationRow {
  id: number;
  public_id: string;
  type: "BOOKING" | "SUPPORT";
  status: "OPEN" | "PENDING" | "CLOSED";
  subject: string | null;
  last_message: string | null;
  last_message_at: string;
  assigned_admin: { id: number; name: string | null } | null;
  residence: { id: number; name: string } | null;
  booking: { reference: string; state: string } | null;
  flagged_count: number;
  participants: { role: string; id: number; name: string | null; phone: string }[];
}

interface AdminMessage {
  id: number;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "INTERNAL_NOTE";
  body: string;
  meta: Record<string, any> | null;
  deleted: boolean;
  sender_id: number | null;
  sender_role: "GUEST" | "HOST" | "ADMIN" | null;
  sender_name: string | null;
  created_at: string;
}

const STATUS_TONE = { OPEN: "yellow", PENDING: "blue", CLOSED: "gray" } as const;
const STATUS_LABEL = { OPEN: "باز", PENDING: "منتظر کاربر", CLOSED: "بسته" } as const;
const ROLE_LABEL = { GUEST: "مهمان", HOST: "میزبان", ADMIN: "پشتیبانی" } as const;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "همه" },
  { key: "SUPPORT", label: "پشتیبانی" },
  { key: "BOOKING", label: "میزبان و مهمان" },
  { key: "unassigned", label: "واگذارنشده" },
  { key: "flagged", label: "علامت‌خورده" },
];

function queryFor(tab: Tab, q: string): string {
  const params = new URLSearchParams();
  if (tab === "SUPPORT" || tab === "BOOKING") params.set("type", tab);
  if (tab === "flagged") params.set("flagged", "1");
  if (tab === "unassigned") params.set("unassigned", "1");
  if (q.trim()) params.set("q", q.trim());
  params.set("pageSize", "40");
  const search = params.toString();
  return `/api/admin/conversations${search ? `?${search}` : ""}`;
}

function AdminConversationsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const { data: stats } = useSWR<{ open_support: number; unassigned: number; flagged: number }>(
    "/api/admin/conversations/stats",
    (url: string) => apiFetch<any>(url).then((r) => r.data ?? r)
  );

  const { data: list, isLoading, mutate: refreshList } = useSWR<{
    items: AdminConversationRow[];
    total: number;
  }>(queryFor(tab, q), (url: string) => apiFetch<any>(url).then((r) => r.data ?? r));

  const { data: thread, mutate: refreshThread } = useSWR<any>(
    selected ? `/api/admin/conversations/${selected}` : null,
    (url: string) => apiFetch<any>(url).then((r) => r.data ?? r)
  );

  const send = async () => {
    const body = reply.trim();
    if (!body || !selected || sending) return;
    setSending(true);
    try {
      await apiFetch(`/api/admin/conversations/${selected}/messages`, {
        method: "POST",
        body: JSON.stringify({ body, internal }),
      });
      setReply("");
      await Promise.all([refreshThread(), refreshList()]);
    } finally {
      setSending(false);
    }
  };

  const patch = async (payload: Record<string, unknown>) => {
    if (!selected) return;
    await apiFetch(`/api/admin/conversations/${selected}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    await Promise.all([refreshThread(), refreshList()]);
  };

  const removeMessage = async (id: number) => {
    await apiFetch(`/api/admin/conversations/messages/${id}`, { method: "DELETE" });
    await refreshThread();
  };

  const rows = list?.items ?? [];

  return (
    <AdminLayout title="گفتگوها" breadcrumb="مدیریت">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
        <StatTile label="پشتیبانی باز" value={faNum(stats?.open_support)} icon="icon-Information" />
        <StatTile label="واگذارنشده" value={faNum(stats?.unassigned)} icon="icon-Timer" />
        <StatTile label="علامت‌خورده" value={faNum(stats?.flagged)} icon="icon-Warning" />
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-between gap-12">
        <TabPills tabs={TABS} value={tab} onChange={setTab} />
        <ToolbarSearch value={q} onChange={setQ} placeholder="نام، شماره، کد رزرو یا موضوع" />
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-[380px_1fr]">
        {/* Queue */}
        <div className="max-h-[70vh] overflow-y-auto rounded-12 border border-gray-E5E5E6 bg-white">
          {isLoading ? (
            <div className="space-y-8 p-12">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 w-full rounded-10" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState text="گفتگویی با این فیلترها نیست" />
          ) : (
            <ul className="divide-y divide-gray-F0F0F0">
              {rows.map((row) => {
                const guest = row.participants.find((p) => p.role === "GUEST");
                const host = row.participants.find((p) => p.role === "HOST");
                return (
                  <li key={row.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(row.id)}
                      className={`w-full px-14 py-12 text-right transition ${
                        selected === row.id ? "bg-primary-main bg-opacity-[6%]" : "hover:bg-gray-F7F7F7"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-x-8">
                        <span className="truncate text-13 leading-20 font-m text-black">
                          {row.type === "SUPPORT"
                            ? row.subject || "پشتیبانی"
                            : `${guest?.name || "مهمان"} ← ${host?.name || "میزبان"}`}
                        </span>
                        <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>
                      </span>

                      <span className="mt-4 block truncate text-12 leading-18 text-gray-6C6A7D">
                        {row.last_message || "…"}
                      </span>

                      <span className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-11 leading-16 text-gray-B0AFBC">
                        <span>{faDate(row.last_message_at)}</span>
                        {row.booking && <span>{row.booking.reference}</span>}
                        {row.flagged_count > 0 && (
                          <Badge tone="red">{faNum(row.flagged_count)} علامت</Badge>
                        )}
                        {!row.assigned_admin && row.type === "SUPPORT" && (
                          <Badge tone="yellow">واگذارنشده</Badge>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Thread */}
        <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-12 border border-gray-E5E5E6 bg-white">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState text="یک گفتگو را انتخاب کنید" />
            </div>
          ) : !thread ? (
            <div className="space-y-8 p-16">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-40 w-full rounded-10" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-8 border-b border-gray-F0F0F0 p-14">
                <div className="min-w-0">
                  <p className="truncate text-14 leading-22 font-m text-black">
                    {thread.type === "SUPPORT" ? thread.subject || "پشتیبانی" : thread.residence?.name}
                  </p>
                  <p className="mt-2 truncate text-12 leading-18 text-gray-6C6A7D">
                    {thread.participants
                      ?.map(
                        (p: any) =>
                          `${ROLE_LABEL[p.role as keyof typeof ROLE_LABEL] ?? p.role}: ${p.user?.name || "—"}`
                      )
                      .join(" · ")}
                    {thread.booking ? ` · ${thread.booking.reference}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-x-6">
                  {!thread.assignedAdmin && (
                    <Button variant="secondary" onClick={() => patch({ assign_to_me: true })}>
                      واگذاری به من
                    </Button>
                  )}
                  {thread.status !== "CLOSED" ? (
                    <Button variant="secondary" onClick={() => patch({ status: "CLOSED" })}>
                      بستن
                    </Button>
                  ) : (
                    <Button variant="secondary" onClick={() => patch({ status: "OPEN" })}>
                      بازکردن
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-10 overflow-y-auto bg-gray-F7F7F7 p-14">
                {(thread.messages as AdminMessage[]).map((message) => {
                  if (message.type === "SYSTEM") {
                    return (
                      <p
                        key={message.id}
                        className="mx-auto max-w-[440px] rounded-10 bg-white px-12 py-8 text-center text-12 leading-20 text-gray-6C6A7D"
                      >
                        {message.body}
                      </p>
                    );
                  }

                  const isNote = message.type === "INTERNAL_NOTE";
                  return (
                    <div
                      key={message.id}
                      className={`rounded-10 border p-10 ${
                        isNote
                          ? "border-dashed border-[#E0B978] bg-[#FDF8EE]"
                          : "border-gray-E5E5E6 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-x-8 text-11 leading-16 text-gray-6C6A7D">
                        <span className="font-m">
                          {isNote && "🔒 یادداشت داخلی — "}
                          {message.sender_name || "—"}
                          {message.sender_role
                            ? ` (${ROLE_LABEL[message.sender_role] ?? message.sender_role})`
                            : ""}
                        </span>
                        <span className="flex items-center gap-x-8">
                          <span>{faDate(message.created_at)}</span>
                          {!message.deleted && (
                            <button
                              type="button"
                              onClick={() => removeMessage(message.id)}
                              className="text-[#E53935] hover:underline"
                            >
                              حذف
                            </button>
                          )}
                        </span>
                      </div>
                      <p className="mt-6 whitespace-pre-wrap break-words text-13 leading-22 text-black">
                        {message.deleted ? "— حذف شده —" : message.body}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-F0F0F0 p-12">
                <textarea
                  rows={3}
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={
                    internal
                      ? "یادداشتی که فقط تیم پشتیبانی می‌بیند…"
                      : "پاسخ شما — با نام «پشتیبانی لیدوماتریپ» در گفتگو دیده می‌شود."
                  }
                  className="w-full resize-y rounded-10 border border-gray-E5E5E6 px-12 py-10 text-14 leading-22 outline-none transition focus:border-primary-main"
                />
                <div className="mt-8 flex items-center justify-between gap-x-8">
                  <label className="flex cursor-pointer items-center gap-x-6 text-12 leading-18 text-gray-6C6A7D">
                    <input
                      type="checkbox"
                      checked={internal}
                      onChange={(event) => setInternal(event.target.checked)}
                    />
                    یادداشت داخلی (کاربر نمی‌بیند)
                  </label>
                  <Button onClick={send} disabled={!reply.trim() || sending}>
                    {sending ? "در حال ارسال…" : "ارسال"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminConversationsPage;
