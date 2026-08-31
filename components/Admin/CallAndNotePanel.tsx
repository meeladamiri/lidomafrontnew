import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, EmptyState, Skeleton, faDateTime } from "@/components/Admin/ui";

/**
 * تماس و یادداشت، و هرچه دیگری بر سر این رزرو آمده.
 *
 * One box for the two things an agent does between phone calls: write down
 * what was said, and record that the call happened at all. They were separate
 * forms before, which meant logging a call you had just made took two
 * decisions — which form, then what to type — when the second is the only one
 * carrying information.
 *
 * So the four call buttons are a *mode*, not a separate form. Nothing
 * selected writes a note; picking «با میزبان» writes the same text as a call
 * to the host. The text field never moves.
 *
 * Underneath, one list rather than several. A call, a note, a status change
 * and a price edit are the same question asked once — what has happened to
 * this booking — and splitting them into panels made the reader interleave
 * three timelines by hand to find out what happened on Tuesday.
 *
 * ⚠️ Not built: attachments, emoji and voice notes. The API takes text and an
 * optional outcome and nothing else, and a paperclip that silently drops the
 * file is worse than no paperclip.
 */

type Party = "HOST" | "GUEST";
type Direction = "OUTBOUND" | "INBOUND";

interface CallMode {
  key: string;
  label: string;
  direction: Direction;
  party: Party;
}

const CALL_MODES: CallMode[] = [
  { key: "out-host", label: "با میزبان", direction: "OUTBOUND", party: "HOST" },
  { key: "in-host", label: "از میزبان", direction: "INBOUND", party: "HOST" },
  { key: "out-guest", label: "با مهمان", direction: "OUTBOUND", party: "GUEST" },
  { key: "in-guest", label: "از مهمان", direction: "INBOUND", party: "GUEST" },
];

const QUICK_PHRASES = [
  "اقامتگاه پره",
  "میزبان اوکی",
  "مسافر پرداخت میکنه",
  "میزبان جواب نداد",
  "مهمان جواب نداد",
  "لینک پرداخت",
];

type Kind = "CALL" | "NOTE" | "STATE_CHANGE" | "FIELD_CHANGE" | "MESSAGE_SENT";

interface Entry {
  id: number;
  kind: Kind;
  summary: string;
  call: { direction: string; party: string; outcome: string | null; label: string } | null;
  actor_name: string | null;
  actor_id: number | null;
  source: string;
  created_at: string;
}

/**
 * How each kind of entry is marked.
 *
 * Direction is a colour, not a word: an agent scanning a day of calls is
 * looking for "did they ever call us back", and green-out / blue-in answers
 * that from across the room while «تماس خروجی با میزبان» has to be read.
 */
const OUTBOUND_STYLE = "bg-[#03D6BB14] text-[#015046] border-[#03D6BB]";
const INBOUND_STYLE = "bg-[#E8F1FF] text-[#1B4F9C] border-[#1B4F9C]";

const KIND_STYLE: Record<Kind, { label: string; icon: string; chip: string }> = {
  CALL: { label: "تماس", icon: "icon-PhoneFill", chip: "bg-gray-F0F0F0 text-gray-6C6A7D border-gray-E5E5E6" },
  NOTE: { label: "یادداشت", icon: "icon-Edit", chip: "bg-gray-F0F0F0 text-gray-6C6A7D border-gray-E5E5E6" },
  STATE_CHANGE: { label: "تغییر وضعیت", icon: "icon-Refresh", chip: "bg-[#FFF4E0] text-[#B26A00] border-[#FFB74D]" },
  FIELD_CHANGE: { label: "تغییر اطلاعات", icon: "icon-Filters", chip: "bg-[#FFF4E0] text-[#B26A00] border-[#FFB74D]" },
  MESSAGE_SENT: { label: "پیام ارسالی", icon: "icon-message", chip: "bg-[#F1EAFE] text-[#5B32B0] border-[#5B32B0]" },
};

const TABS: { key: "" | Kind; label: string }[] = [
  { key: "", label: "همه" },
  { key: "CALL", label: "تماس‌ها" },
  { key: "NOTE", label: "یادداشت‌ها" },
  { key: "STATE_CHANGE", label: "تغییر وضعیت" },
  { key: "MESSAGE_SENT", label: "پیام‌ها" },
];

export default function CallAndNotePanel({
  reservationId,
  refreshKey,
}: {
  reservationId: number;
  /** Bumped by the page after a state change, so the log picks it up. */
  refreshKey?: number;
}) {
  const [mode, setMode] = useState<CallMode | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"" | Kind>("");

  const { data, isLoading, mutate } = useSWR<{ items: Entry[] }>(
    `/api/admin/activity?reservationId=${reservationId}${tab ? `&kind=${tab}` : ""}&take=60&v=${refreshKey ?? 0}`,
    (p: string) => apiFetch<{ items: Entry[] }>(p)
  );

  function addPhrase(phrase: string) {
    setText((t) => (t.trim() ? `${t.trim()} ${phrase}` : phrase));
  }

  async function submit() {
    const summary = text.trim();
    if (summary.length < 3) return;

    setBusy(true);
    setError(null);
    try {
      if (mode) {
        await apiFetch("/api/admin/activity/calls", {
          method: "POST",
          body: JSON.stringify({
            direction: mode.direction,
            party: mode.party,
            summary,
            reservationId,
          }),
        });
      } else {
        await apiFetch("/api/admin/activity/notes", {
          method: "POST",
          body: JSON.stringify({ summary, reservationId }),
        });
      }
      setText("");
      setMode(null);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusy(false);
    }
  }

  const items = data?.items ?? [];

  // Days are the unit people ask in — "what happened today", "did anyone call
  // on Sunday" — so the date is a heading and each row keeps only the clock.
  const groups: { day: string; rows: Entry[] }[] = [];
  for (const item of items) {
    const day = faDateTime(item.created_at)[0];
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.rows.push(item);
    else groups.push({ day, rows: [item] });
  }
  const today = faDateTime(new Date())[0];

  return (
    <div className="flex flex-col gap-y-16">
      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-16 flex-wrap gap-y-10 mb-14">
          <h3 className="text-16 leading-24 font-m text-black">تماس و یادداشت</h3>
          <div className="flex items-center gap-x-8 flex-wrap gap-y-8">
            {CALL_MODES.map((m) => {
              const active = mode?.key === m.key;
              const out = m.direction === "OUTBOUND";
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(active ? null : m)}
                  className={`inline-flex items-center gap-x-6 px-12 py-8 rounded-10 text-13 leading-20 border transition ${
                    active
                      ? out
                        ? OUTBOUND_STYLE
                        : INBOUND_STYLE
                      : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                  }`}
                >
                  <CallIcon outbound={out} small />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={mode ? `شرح ${mode.label}` : "متن یادداشت"}
          className="w-full rounded-12 border border-gray-E5E5E6 p-14 text-14 leading-24 outline-none focus:border-primary-main resize-y"
        />

        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-10 mt-12">
          <div className="flex flex-wrap gap-8">
            {QUICK_PHRASES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => addPhrase(p)}
                className="px-12 py-6 rounded-10 border border-gray-E5E5E6 text-12 leading-20 text-gray-6C6A7D hover:border-gray-C4CAD3 hover:text-black transition"
              >
                {p}
              </button>
            ))}
          </div>

          <Button disabled={busy || text.trim().length < 3} onClick={submit}>
            {busy ? "در حال ثبت..." : mode ? "ثبت تماس" : "ثبت یادداشت"}
          </Button>
        </div>

        {/* Said once, here, rather than left for the agent to discover after
            pressing the button and looking for an edit control. */}
        <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
          {mode
            ? `به‌عنوان «${mode.label}» با نام شما ثبت می‌شود و پاک نمی‌شود.`
            : "با نام شما در تاریخچه‌ی رزرو ثبت می‌شود و پاک نمی‌شود."}
        </p>

        {error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}
      </Card>

      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-16 flex-wrap gap-y-10 mb-14">
          <h3 className="text-16 leading-24 font-m text-black">تماس‌ها و رویدادها</h3>
          <div className="flex items-center gap-x-6 flex-wrap gap-y-6">
            {TABS.map((t) => (
              <button
                key={t.key || "all"}
                type="button"
                aria-pressed={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`px-12 py-6 rounded-10 text-12 leading-20 border transition ${
                  tab === t.key
                    ? "border-primary-main bg-primary-light text-primary-dark font-m"
                    : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-[200px]" />
        ) : items.length === 0 ? (
          <EmptyState text="رویدادی ثبت نشده" />
        ) : (
          <div className="flex flex-col gap-y-16">
            {groups.map((g) => (
              <div key={g.day}>
                <div className="flex items-center gap-x-12 mb-10">
                  <span className="h-1 flex-1 bg-gray-F0F0F0" />
                  <span className="px-10 py-4 rounded-8 bg-primary-light text-primary-dark text-11 leading-18 whitespace-nowrap">
                    {g.day === today ? `امروز ${g.day}` : g.day}
                  </span>
                  <span className="h-1 flex-1 bg-gray-F0F0F0" />
                </div>

                <div className="flex flex-col gap-y-10">
                  {g.rows.map((e) => (
                    <LogRow key={e.id} entry={e} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LogRow({ entry }: { entry: Entry }) {
  const meta = KIND_STYLE[entry.kind] ?? KIND_STYLE.NOTE;
  const outbound = entry.call?.direction === "OUTBOUND";
  const isCall = entry.kind === "CALL";
  const chip = isCall ? (outbound ? OUTBOUND_STYLE : INBOUND_STYLE) : meta.chip;

  return (
    <div className="flex items-start gap-x-12">
      <span
        className={`w-36 h-36 rounded-12 border shrink-0 flex items-center justify-center ${chip}`}
      >
        {isCall ? <CallIcon outbound={outbound} /> : <i className={`${meta.icon} text-15`} />}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-x-8 flex-wrap gap-y-4">
          <span
            className={`inline-flex items-center gap-x-4 px-8 py-2 rounded-8 border text-11 leading-18 ${chip}`}
          >
            {isCall ? entry.call?.label ?? "تماس" : meta.label}
          </span>
          {entry.call?.outcome && (
            <span className="text-11 leading-18 text-gray-9B9BAA">{entry.call.outcome}</span>
          )}
          <span className="text-11 leading-18 text-gray-9B9BAA">
            {/* No actor means nothing pressed a button — the scheduler or an
                automatic transition wrote it. */}
            {entry.actor_name ?? "سیستم"}
          </span>
          <span className="text-11 leading-18 text-gray-9B9BAA mr-auto">
            {faDateTime(entry.created_at)[1]}
          </span>
        </div>

        <p className="text-13 leading-22 text-black break-words whitespace-pre-wrap mt-2">
          {entry.summary}
        </p>
      </div>
    </div>
  );
}

/**
 * A phone with the direction on it.
 *
 * The arrow is drawn rather than taken from the icon font: the font has one
 * phone glyph and no in/out pair, and «تماس» twice in two colours leaves the
 * reader deciding which colour meant which.
 */
function CallIcon({ outbound, small }: { outbound: boolean; small?: boolean }) {
  return (
    <span className={`relative inline-flex ${small ? "text-13" : "text-15"}`}>
      <i className="icon-PhoneFill" />
      <span
        aria-hidden
        className={`absolute -top-3 ${outbound ? "-left-4" : "-right-4"} text-9 leading-9 font-m`}
      >
        {outbound ? "↗" : "↙"}
      </span>
    </span>
  );
}
