import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, faDateTime } from "@/components/Admin/ui";

/**
 * وضعیت رزرو — the state, where it can go, and how it got here.
 *
 * The panel used to offer one button per forward step and nothing else: an
 * agent who advanced the wrong booking could not put it back, and nothing
 * anywhere recorded why any of it happened.
 *
 * Two deliberate absences. «لغو رزرو» is not in this list — cancelling needs a
 * canceller, a justification and a notification choice, which a note cannot
 * carry, so it keeps its own dialog. And nothing moves *out* of a cancelled
 * booking, because the refund and the host's reversed income would have to be
 * undone with it.
 */

type State = "DRAFT" | "HOST_APPROVAL" | "SECOND_PAYMENT" | "DONE" | "CANCEL" | "EXPIRED";

interface HistoryRow {
  id: number;
  from_state: State | null;
  from_label: string | null;
  to_state: State;
  to_label: string;
  note: string | null;
  changed_by: string | null;
  source: string;
  created_at: string;
}

interface StateInfo {
  current: State;
  current_label: string;
  allowed: { state: State; label: string }[];
  history: HistoryRow[];
}

const TONE: Record<State, "gray" | "yellow" | "green" | "red" | "blue"> = {
  DRAFT: "gray",
  HOST_APPROVAL: "yellow",
  SECOND_PAYMENT: "yellow",
  DONE: "green",
  CANCEL: "red",
  EXPIRED: "gray",
};

/** The booking's own path, drawn in order so the current step reads at a glance. */
const FLOW: State[] = ["DRAFT", "HOST_APPROVAL", "SECOND_PAYMENT", "DONE"];

const SHORT: Record<State, string> = {
  DRAFT: "ثبت درخواست",
  HOST_APPROVAL: "تایید میزبان",
  SECOND_PAYMENT: "پرداخت مهمان",
  DONE: "قطعی",
  CANCEL: "لغو",
  EXPIRED: "منقضی",
};

/**
 * The path on its own, so the page header can show where the booking stands
 * without the reader scrolling to the panel that changes it.
 *
 * Reading the state and moving it are two different jobs — one is glanced at
 * on every visit, the other is done occasionally and deliberately. Keeping
 * them in one card put the most-read thing on the page in the least-visible
 * column.
 */
export function StateFlow({ current, className = "" }: { current: State; className?: string }) {
  const currentIndex = FLOW.indexOf(current);
  const derailed = current === "CANCEL" || current === "EXPIRED";

  return (
    <div className={`flex items-center gap-x-4 ${derailed ? "opacity-40" : ""} ${className}`}>
      {FLOW.map((s, i) => (
        <div key={s} className="flex items-center gap-x-4 flex-1 last:flex-initial">
          <div
            className={`px-10 py-6 rounded-8 text-12 leading-18 whitespace-nowrap ${
              s === current
                ? "bg-primary-main text-white font-m"
                : i < currentIndex
                  ? "bg-primary-light text-primary-dark"
                  : "bg-gray-F5F5F7 text-gray-9B9BAA"
            }`}
          >
            {SHORT[s]}
          </div>
          {i < FLOW.length - 1 && (
            <div
              className={`h-2 flex-1 rounded-full ${
                i < currentIndex ? "bg-primary-main" : "bg-gray-F0F0F0"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReservationStatePanel({
  reservationId,
  onChanged,
  showFlow = true,
}: {
  reservationId: number;
  onChanged: () => void;
  /** Off when the page header already draws it — see `StateFlow`. */
  showFlow?: boolean;
}) {
  const { data, mutate } = useSWR<StateInfo>(
    `/api/admin/reservations/${reservationId}/state`,
    (p: string) => apiFetch<StateInfo>(p)
  );

  const [target, setTarget] = useState<State | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data) return null;

  const derailed = data.current === "CANCEL" || data.current === "EXPIRED";

  async function apply() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/state`, {
        method: "POST",
        body: JSON.stringify({ toState: target, note: note.trim() }),
      });
      setTarget(null);
      setNote("");
      mutate();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر وضعیت انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <h3 className="text-16 leading-24 font-m text-black">وضعیت رزرو</h3>
        <Badge tone={TONE[data.current]}>{data.current_label}</Badge>
      </div>

      {/* The path, with the current step marked. A cancelled or expired
          booking left this path, so it is shown greyed rather than pretending
          one of the steps is still current. */}
      {showFlow && <StateFlow current={data.current} className="mb-16" />}

      {derailed && (
        <p className="mb-14 text-12 leading-20 text-gray-6C6A7D">
          این رزرو از مسیر عادی خارج شده است ({data.current_label}).
        </p>
      )}

      {data.allowed.length > 0 ? (
        <div className="rounded-10 border border-gray-E5E5E6 p-12">
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">تغییر دستی وضعیت به:</p>
          <div className="flex flex-wrap gap-8 mb-12">
            {data.allowed.map((a) => (
              <button
                key={a.state}
                type="button"
                onClick={() => setTarget(target === a.state ? null : a.state)}
                aria-pressed={target === a.state}
                className={`px-12 py-8 rounded-10 text-13 leading-20 border transition ${
                  target === a.state
                    ? "border-primary-main bg-primary-light text-primary-dark font-m"
                    : "border-gray-E5E5E6 text-gray-6C6A7D hover:border-gray-C4CAD3"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          {target && (
            <>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="توضیح تغییر وضعیت — چرا این رزرو جابه‌جا می‌شود؟"
                className="w-full rounded-8 border border-gray-E5E5E6 p-10 text-13 leading-22 outline-none focus:border-primary-main"
              />
              <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                این توضیح در تاریخچه‌ی رزرو با نام شما ثبت می‌شود و پاک نمی‌شود.
              </p>

              {!!error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}

              <div className="flex justify-end gap-x-8 mt-10">
                <Button variant="secondary" onClick={() => setTarget(null)}>
                  انصراف
                </Button>
                <Button disabled={busy || note.trim().length < 3} onClick={apply}>
                  {busy ? "در حال ثبت..." : "ثبت تغییر"}
                </Button>
              </div>
            </>
          )}
        </div>
      ) : (
        <p className="text-12 leading-20 text-gray-9B9BAA">
          از این وضعیت تغییر دستی ممکن نیست. برای رزرو لغوشده، رزرو جدید ثبت کنید.
        </p>
      )}

      {data.history.length > 0 && (
        <div className="mt-16">
          <p className="text-13 leading-20 font-m text-black mb-8">تاریخچه</p>
          <div className="flex flex-col">
            {data.history.map((h) => {
              const [d, t] = faDateTime(h.created_at);
              return (
                <div
                  key={h.id}
                  className="flex items-start gap-x-10 py-8 border-b border-gray-F0F0F0 last:border-0"
                >
                  <span className="mt-6 w-8 h-8 rounded-full bg-gray-C4CAD3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-13 leading-20 text-black">
                      {h.from_label ? `${h.from_label} ← ` : ""}
                      <b className="font-m">{h.to_label}</b>
                    </p>
                    {h.note && (
                      <p className="text-12 leading-20 text-gray-6C6A7D break-words">{h.note}</p>
                    )}
                    <p className="text-11 leading-18 text-gray-9B9BAA">
                      {d} · {t}
                      {h.changed_by ? ` · ${h.changed_by}` : ""}
                      {/* Automatic moves say so, so a timeline entry with no
                          name does not read as a missing one. */}
                      {h.source !== "MANUAL" && ` · ${h.source === "CANCEL" ? "لغو" : "سیستم"}`}
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
