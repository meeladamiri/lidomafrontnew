import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Modal, Skeleton, faDate } from "@/components/Admin/ui";

/**
 * وضعیت رزرو — where the booking is, and the way it is moved.
 *
 * The state used to be shown in one place and changed in another, three cards
 * down a sidebar. Reading a status and correcting it are the same thought two
 * seconds apart, so the steps themselves are the control: click the step you
 * want the booking to be in.
 *
 * Two guards before anything moves, because this is the button that pays
 * hosts and refunds guests:
 *
 *   1. «آیا مطمئنید؟» — cheap to dismiss, and it catches the mis-click on a
 *      row of adjacent targets.
 *   2. A note, required, plus the choice of whether the two sides hear about
 *      it. Correcting a booking that was advanced by mistake must not tell a
 *      guest their trip was just approved.
 *
 * «لغو» is a step on the bar but never moves the state from here: cancelling
 * needs a canceller, a justification and a refund band, so it hands over to
 * its own dialog.
 */

type State = "DRAFT" | "HOST_APPROVAL" | "SECOND_PAYMENT" | "DONE" | "CANCEL" | "EXPIRED";

interface StateInfo {
  current: State;
  current_label: string;
  allowed: { state: State; label: string }[];
  history: { id: number }[];
}

const FLOW: State[] = ["DRAFT", "HOST_APPROVAL", "SECOND_PAYMENT", "DONE"];

const SHORT: Record<State, string> = {
  DRAFT: "ثبت درخواست",
  HOST_APPROVAL: "تایید میزبان",
  SECOND_PAYMENT: "پرداخت مهمان",
  DONE: "قطعی",
  CANCEL: "لغو",
  EXPIRED: "منقضی",
};

const LONG: Record<State, string> = {
  DRAFT: "در انتظار ثبت درخواست",
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت مهمان",
  DONE: "قطعی",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};

export default function ReservationStatusBar({
  reservationId,
  createdAt,
  updatedAt,
  onCancel,
  onChanged,
}: {
  reservationId: number;
  createdAt: string;
  updatedAt: string;
  onCancel: () => void;
  onChanged: () => void;
}) {
  const { data, mutate } = useSWR<StateInfo>(
    `/api/admin/reservations/${reservationId}/state`,
    (p: string) => apiFetch<StateInfo>(p)
  );

  const [target, setTarget] = useState<{ state: State; label: string } | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data) return <Skeleton className="h-[92px]" />;

  const currentIndex = FLOW.indexOf(data.current);
  const derailed = data.current === "CANCEL" || data.current === "EXPIRED";
  const allowedSet = new Map(data.allowed.map((a) => [a.state, a.label]));

  function pick(state: State, label: string) {
    if (state === "CANCEL") {
      onCancel();
      return;
    }
    setTarget({ state, label });
    setConfirmed(false);
    setNote("");
    setNotify(true);
    setError(null);
  }

  async function apply() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/state`, {
        method: "POST",
        body: JSON.stringify({ toState: target.state, note: note.trim(), notify }),
      });
      setTarget(null);
      mutate();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تغییر وضعیت انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-16">
      <div className="flex items-center gap-x-16 flex-wrap gap-y-12">
        <div className="flex items-center gap-x-8 shrink-0">
          <Badge tone={derailed ? "red" : data.current === "DONE" ? "green" : "yellow"}>
            {data.current_label}
          </Badge>
        </div>

        <div className={`flex items-center gap-x-4 flex-1 min-w-[320px] ${derailed ? "opacity-50" : ""}`}>
          {FLOW.map((s, i) => {
            const isCurrent = s === data.current;
            const canGo = allowedSet.has(s);
            const done = !derailed && i < currentIndex;

            return (
              <div key={s} className="flex items-center gap-x-4 flex-1 last:flex-initial">
                <button
                  type="button"
                  disabled={!canGo}
                  onClick={() => pick(s, allowedSet.get(s) ?? LONG[s])}
                  title={
                    isCurrent
                      ? "وضعیت فعلی"
                      : canGo
                        ? `انتقال به «${LONG[s]}»`
                        : "از وضعیت فعلی این انتقال مجاز نیست"
                  }
                  className={`px-10 py-6 rounded-8 text-12 leading-18 whitespace-nowrap border transition ${
                    isCurrent
                      ? "bg-primary-main text-white border-primary-main font-m"
                      : done
                        ? "bg-primary-light text-primary-dark border-primary-light"
                        : "bg-gray-F5F5F7 text-gray-9B9BAA border-gray-F5F5F7"
                  } ${
                    canGo
                      ? "cursor-pointer hover:border-primary-main hover:text-primary-dark"
                      : "cursor-default"
                  }`}
                >
                  {SHORT[s]}
                </button>
                {i < FLOW.length - 1 && (
                  <div
                    className={`h-2 flex-1 rounded-full ${
                      done ? "bg-primary-main" : "bg-gray-F0F0F0"
                    }`}
                  />
                )}
              </div>
            );
          })}

          {/* Off the path, so it sits after a gap rather than pretending to be
              the fifth step of a booking that is going well. */}
          {allowedSet.has("EXPIRED") || derailed ? (
            <span
              className={`mr-10 px-10 py-6 rounded-8 text-12 leading-18 whitespace-nowrap border ${
                derailed
                  ? "bg-[#FFEBEB] text-[#C62828] border-[#FFEBEB] font-m"
                  : "bg-gray-F5F5F7 text-gray-9B9BAA border-gray-F5F5F7"
              }`}
            >
              {SHORT[data.current === "EXPIRED" ? "EXPIRED" : "CANCEL"]}
            </span>
          ) : null}
        </div>

        <span className="text-11 leading-18 text-gray-9B9BAA whitespace-nowrap">
          ثبت {faDate(createdAt)} · آخرین تغییر {faDate(updatedAt)}
        </span>
      </div>

      {!derailed && (
        <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
          برای تغییر وضعیت، روی مرحله‌ی مقصد کلیک کنید. مراحل غیرفعال از وضعیت فعلی مجاز نیستند.
        </p>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={confirmed ? "توضیح تغییر وضعیت" : "آیا مطمئن هستید؟"}
        width="max-w-[520px]"
      >
        {!confirmed ? (
          <>
            <p className="text-14 leading-24 text-black">
              وضعیت این رزرو از «{data.current_label}» به «{target && LONG[target.state]}» تغییر
              می‌کند.
            </p>
            <p className="mt-8 text-12 leading-20 text-gray-6C6A7D">
              {target?.state === "DONE"
                ? "با این کار سهم میزبان در کیف پولش ثبت می‌شود."
                : target?.state === "DRAFT" || target?.state === "EXPIRED"
                  ? "با این کار شب‌های این رزرو در تقویم آزاد می‌شوند."
                  : "مهلت این مرحله از تنظیمات رزرواسیون دوباره تنظیم می‌شود."}
            </p>
            <div className="flex justify-end gap-x-8 mt-16">
              <Button variant="secondary" onClick={() => setTarget(null)}>
                انصراف
              </Button>
              <Button onClick={() => setConfirmed(true)}>بله، ادامه</Button>
            </div>
          </>
        ) : (
          <>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="چرا این رزرو جابه‌جا می‌شود؟"
              className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
            />
            <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
              این توضیح در تاریخچه‌ی رزرو با نام شما ثبت می‌شود و پاک نمی‌شود.
            </p>

            <label className="flex items-start gap-x-10 mt-14 cursor-pointer">
              <input
                type="checkbox"
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
                className="w-16 h-16 mt-2 accent-[#03D6BB]"
              />
              <span>
                <span className="block text-13 leading-22 text-black">
                  اطلاع‌رسانی به مهمان و میزبان
                </span>
                <span className="block text-11 leading-18 text-gray-9B9BAA">
                  {/* Stated because it is the difference between "we told them"
                      and "we think we told them". */}
                  اعلان درون‌سایتی ارسال می‌شود. سرویس پیامک هنوز وصل نیست، پس فعلاً پیامکی
                  فرستاده نمی‌شود.
                </span>
              </span>
            </label>

            {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

            <div className="flex justify-end gap-x-8 mt-16">
              <Button variant="secondary" onClick={() => setConfirmed(false)}>
                بازگشت
              </Button>
              <Button disabled={busy || note.trim().length < 3} onClick={apply}>
                {busy ? "در حال ثبت..." : "ثبت تغییر وضعیت"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </Card>
  );
}
