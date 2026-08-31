import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, EmptyState, Field, Input, Select, Skeleton, faDateTime } from "@/components/Admin/ui";

/**
 * The activity and communication log, as one list.
 *
 * A call, a status change, a price edit and a voucher that went out are the
 * same question asked once — what has happened to this booking — so they share
 * a timeline rather than sitting in three panels the reader has to interleave.
 *
 * Each kind gets a colour and an icon and nothing else. The entries are
 * already written as sentences by the server, so the component's job is to
 * order them and stay out of the way; formatting them here would mean the same
 * event reads differently depending on which screen found it.
 */

type Kind = "CALL" | "NOTE" | "STATE_CHANGE" | "FIELD_CHANGE" | "MESSAGE_SENT";

interface Entry {
  id: number;
  kind: Kind;
  summary: string;
  call: { direction: string; party: string; outcome: string | null; label: string } | null;
  actor_name: string | null;
  actor_id: number | null;
  source: string;
  reservation: { id: number; reference: string } | null;
  user: { id: number; name: string | null; phone: string } | null;
  created_at: string;
}

const KIND: Record<Kind, { label: string; icon: string; tone: "blue" | "gray" | "green" | "yellow" | "purple" }> = {
  CALL: { label: "تماس", icon: "icon-PhoneFill", tone: "blue" },
  NOTE: { label: "یادداشت", icon: "icon-Edit", tone: "gray" },
  STATE_CHANGE: { label: "تغییر وضعیت", icon: "icon-Refresh", tone: "green" },
  FIELD_CHANGE: { label: "تغییر اطلاعات", icon: "icon-Filters", tone: "yellow" },
  MESSAGE_SENT: { label: "پیام ارسالی", icon: "icon-message", tone: "purple" },
};

export default function ActivityTimeline({
  reservationId,
  userId,
  showFilters = true,
  compact = false,
  callOpen,
  onCallOpenChange,
}: {
  reservationId?: number;
  userId?: number;
  showFilters?: boolean;
  compact?: boolean;
  /**
   * Optional control of the call form, so «ثبت تماس» can also live in the page
   * header. Logging a call is the most frequent thing an agent does here and
   * it should not require finding the panel first.
   */
  callOpen?: boolean;
  onCallOpenChange?: (open: boolean) => void;
}) {
  const [kind, setKind] = useState<"" | Kind>("");
  const [actorId, setActorId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [ownCall, setOwnCall] = useState(false);

  const controlled = callOpen !== undefined;
  const showCall = controlled ? callOpen : ownCall;
  const setShowCall = (next: boolean) => {
    if (controlled) onCallOpenChange?.(next);
    else setOwnCall(next);
  };

  const query = new URLSearchParams({
    ...(reservationId ? { reservationId: String(reservationId) } : {}),
    ...(userId ? { userId: String(userId) } : {}),
    ...(kind ? { kind } : {}),
    ...(actorId ? { actorId } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    take: compact ? "10" : "40",
  });

  const { data, isLoading, mutate } = useSWR<{ items: Entry[]; next_cursor: number | null }>(
    `/api/admin/activity?${query.toString()}`,
    (p: string) => apiFetch<{ items: Entry[]; next_cursor: number | null }>(p)
  );

  const { data: actors } = useSWR<{ id: number; name: string; count: number }[]>(
    showFilters ? "/api/admin/activity/actors" : null,
    (p: string) => apiFetch<{ id: number; name: string; count: number }[]>(p)
  );

  const items = data?.items ?? [];

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <h3 className="text-16 leading-24 font-m text-black">فعالیت‌ها و ارتباطات</h3>
        <div className="flex items-center gap-x-8">
          <Button variant="secondary" onClick={() => setShowCall(!showCall)}>
            <i className="icon-PhoneFill text-16" /> ثبت تماس
          </Button>
        </div>
      </div>

      {showCall && (
        <CallForm
          reservationId={reservationId}
          userId={userId}
          onDone={() => {
            setShowCall(false);
            mutate();
          }}
          onCancel={() => setShowCall(false)}
        />
      )}

      {showFilters && (
        <div className="grid md:grid-cols-4 gap-10 mb-14">
          <Field label="نوع">
            <Select value={kind} onChange={(e) => setKind(e.target.value as "" | Kind)}>
              <option value="">همه</option>
              {(Object.keys(KIND) as Kind[]).map((k) => (
                <option key={k} value={k}>
                  {KIND[k].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ثبت‌کننده">
            <Select value={actorId} onChange={(e) => setActorId(e.target.value)}>
              <option value="">همه</option>
              {actors?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="از تاریخ">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="تا تاریخ">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-[180px]" />
      ) : items.length === 0 ? (
        <EmptyState text="فعالیتی ثبت نشده" />
      ) : (
        <div className="relative">
          {/* One rail down the side, so the entries read as a sequence rather
              than a stack of unrelated cards. */}
          <div className="absolute right-[11px] top-6 bottom-6 w-1 bg-gray-F0F0F0" />
          <div className="flex flex-col">
            {items.map((e) => {
              const meta = KIND[e.kind] ?? KIND.NOTE;
              const [d, t] = faDateTime(e.created_at);
              return (
                <div key={e.id} className="relative flex items-start gap-x-12 py-10">
                  <span className="relative z-1 w-24 h-24 rounded-full bg-white border-2 border-gray-F0F0F0 flex items-center justify-center shrink-0">
                    <i className={`${meta.icon} text-12 text-gray-6C6A7D`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-x-8 flex-wrap gap-y-4 mb-2">
                      <Badge tone={meta.tone}>{e.call?.label ?? meta.label}</Badge>
                      {e.call?.outcome && (
                        <span className="text-11 text-gray-9B9BAA">{e.call.outcome}</span>
                      )}
                      {/* "System" means nobody pressed anything. An entry
                          with an actor is theirs regardless of which flow
                          wrote it — a sent voucher is not a system event just
                          because the endpoint tagged itself ACTION. */}
                      {!e.actor_name && (
                        <span className="text-11 text-gray-9B9BAA">سیستم</span>
                      )}
                    </div>
                    <p className="text-13 leading-22 text-black break-words whitespace-pre-wrap">
                      {e.summary}
                    </p>
                    <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
                      {d} · {t}
                      {e.actor_name ? ` · ${e.actor_name}` : ""}
                      {!reservationId && e.reservation ? ` · ${e.reservation.reference}` : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Logging a call.
 *
 * Odoo had four buttons — to/from host, to/from guest. They are one form with
 * two questions here, because four buttons that differ in two booleans is a
 * menu the reader has to decode every time.
 */
function CallForm({
  reservationId,
  userId,
  onDone,
  onCancel,
}: {
  reservationId?: number;
  userId?: number;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [direction, setDirection] = useState<"INBOUND" | "OUTBOUND">("OUTBOUND");
  const [party, setParty] = useState<"GUEST" | "HOST" | "OTHER">("GUEST");
  const [outcome, setOutcome] = useState("");
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/admin/activity/calls", {
        method: "POST",
        body: JSON.stringify({
          direction,
          party,
          summary: summary.trim(),
          outcome: outcome.trim() || null,
          reservationId: reservationId ?? null,
          userId: userId ?? null,
        }),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت تماس انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-12 border border-gray-E5E5E6 p-14 mb-14">
      <div className="grid md:grid-cols-3 gap-10 mb-10">
        <Field label="جهت تماس">
          <Select value={direction} onChange={(e) => setDirection(e.target.value as "INBOUND" | "OUTBOUND")}>
            <option value="OUTBOUND">خروجی (ما تماس گرفتیم)</option>
            <option value="INBOUND">ورودی (با ما تماس گرفتند)</option>
          </Select>
        </Field>
        <Field label="طرف تماس">
          <Select value={party} onChange={(e) => setParty(e.target.value as "GUEST" | "HOST" | "OTHER")}>
            <option value="GUEST">مهمان</option>
            <option value="HOST">میزبان</option>
            <option value="OTHER">سایر</option>
          </Select>
        </Field>
        <Field label="نتیجه (اختیاری)">
          <Input
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="پاسخ داد / پاسخ نداد / خاموش"
          />
        </Field>
      </div>

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        rows={3}
        placeholder="خلاصه‌ی گفتگو — چه چیزی توافق شد؟"
        className="w-full rounded-8 border border-gray-E5E5E6 p-10 text-13 leading-22 outline-none focus:border-primary-main"
      />

      {!!error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-8 mt-10">
        <Button variant="secondary" onClick={onCancel}>
          انصراف
        </Button>
        <Button disabled={busy || summary.trim().length < 3} onClick={save}>
          {busy ? "در حال ثبت..." : "ثبت تماس"}
        </Button>
      </div>
    </div>
  );
}
