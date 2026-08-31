import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, EmptyState, Skeleton, faDateTime } from "@/components/Admin/ui";

/**
 * تماس و یادداشت.
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
 * The quick phrases exist because the same six sentences are typed all day.
 * They append rather than replace — an agent almost always adds a detail
 * after the stock phrase.
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
  /** Outgoing is the site reaching out; incoming is them reaching us. */
  tone: string;
  icon: string;
}

const CALL_MODES: CallMode[] = [
  { key: "out-host", label: "با میزبان", direction: "OUTBOUND", party: "HOST", tone: "text-[#2E7D32]", icon: "icon-Call" },
  { key: "in-host", label: "از میزبان", direction: "INBOUND", party: "HOST", tone: "text-[#C62828]", icon: "icon-Call" },
  { key: "out-guest", label: "با مهمان", direction: "OUTBOUND", party: "GUEST", tone: "text-[#2E7D32]", icon: "icon-Call" },
  { key: "in-guest", label: "از مهمان", direction: "INBOUND", party: "GUEST", tone: "text-[#C62828]", icon: "icon-Call" },
];

const QUICK_PHRASES = [
  "اقامتگاه پره",
  "میزبان اوکی",
  "مسافر پرداخت میکنه",
  "میزبان جواب نداد",
  "مهمان جواب نداد",
  "لینک پرداخت",
];

interface Entry {
  id: number;
  kind: string;
  summary: string;
  call: { direction: string; party: string; outcome: string | null; label: string } | null;
  actor_name: string | null;
  actor_id: number | null;
  source: string;
  created_at: string;
}

export default function CallAndNotePanel({ reservationId }: { reservationId: number }) {
  const [mode, setMode] = useState<CallMode | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notes = useSWR<{ items: Entry[] }>(
    `/api/admin/activity?reservationId=${reservationId}&kind=NOTE&take=20`,
    (p: string) => apiFetch<{ items: Entry[] }>(p)
  );
  const calls = useSWR<{ items: Entry[] }>(
    `/api/admin/activity?reservationId=${reservationId}&kind=CALL&take=20`,
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
        calls.mutate();
      } else {
        await apiFetch("/api/admin/activity/notes", {
          method: "POST",
          body: JSON.stringify({ summary, reservationId }),
        });
        notes.mutate();
      }
      setText("");
      setMode(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-y-16">
      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-16 flex-wrap gap-y-10 mb-14">
          <h3 className="text-16 leading-24 font-m text-black">تماس و یادداشت</h3>
          <div className="flex items-center gap-x-8 flex-wrap gap-y-8">
            {CALL_MODES.map((m) => {
              const active = mode?.key === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(active ? null : m)}
                  className={`inline-flex items-center gap-x-6 px-12 py-8 rounded-10 text-13 leading-20 border transition ${
                    active
                      ? "border-primary-main bg-primary-light text-primary-dark font-m"
                      : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                  }`}
                >
                  <i className={`${m.icon} text-14 ${active ? "" : m.tone}`} />
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

      <div className="grid lg:grid-cols-2 gap-16">
        <EntryList title="لیست یادداشت‌ها" data={notes.data} loading={notes.isLoading} empty="یادداشتی ثبت نشده" />
        <EntryList title="لیست تماس‌ها" data={calls.data} loading={calls.isLoading} empty="تماسی ثبت نشده" showLabel />
      </div>
    </div>
  );
}

/**
 * Entries grouped under a date heading.
 *
 * Days are the unit people ask in — "what happened today", "did anyone call
 * on Sunday" — so the date is a heading rather than a repeated field on every
 * row, and each row keeps only the clock time.
 */
function EntryList({
  title,
  data,
  loading,
  empty,
  showLabel,
}: {
  title: string;
  data: { items: Entry[] } | undefined;
  loading: boolean;
  empty: string;
  showLabel?: boolean;
}) {
  const items = data?.items ?? [];

  const groups: { day: string; rows: Entry[] }[] = [];
  for (const item of items) {
    const day = faDateTime(item.created_at)[0];
    const last = groups[groups.length - 1];
    if (last && last.day === day) last.rows.push(item);
    else groups.push({ day, rows: [item] });
  }

  const today = faDateTime(new Date())[0];

  return (
    <Card className="p-20">
      <h3 className="text-16 leading-24 font-m text-black mb-14">{title}</h3>

      {loading ? (
        <Skeleton className="h-[160px]" />
      ) : items.length === 0 ? (
        <EmptyState text={empty} />
      ) : (
        <div className="flex flex-col gap-y-14">
          {groups.map((g) => (
            <div key={g.day}>
              <div className="flex justify-center mb-10">
                <span className="px-10 py-4 rounded-8 bg-primary-light text-primary-dark text-11 leading-18">
                  {g.day === today ? `امروز ${g.day}` : g.day}
                </span>
              </div>

              <div className="flex flex-col gap-y-10">
                {g.rows.map((e) => (
                  <div key={e.id} className="flex items-start gap-x-10">
                    <span className="w-32 h-32 rounded-full bg-gray-F0F0F0 shrink-0 flex items-center justify-center text-12 text-gray-6C6A7D">
                      {e.actor_name?.[0] ?? "س"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-x-10">
                        <span className="text-13 leading-20 font-m text-black truncate">
                          {/* No actor means nothing pressed a button — the
                              scheduler or a state change wrote it. */}
                          {e.actor_name ?? "سیستم"}
                        </span>
                        <span className="text-11 leading-18 text-gray-9B9BAA shrink-0">
                          {faDateTime(e.created_at)[1]}
                        </span>
                      </div>
                      {showLabel && e.call?.label && (
                        <span className="inline-flex items-center gap-x-4 text-11 leading-18 text-gray-6C6A7D">
                          <i className="icon-Call text-12" /> {e.call.label}
                        </span>
                      )}
                      <p className="text-13 leading-22 text-gray-6C6A7D break-words whitespace-pre-wrap">
                        {e.summary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
