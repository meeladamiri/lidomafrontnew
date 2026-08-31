import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Field, Input, Modal, Select, Toggle, faNum, parseNum } from "@/components/Admin/ui";

/**
 * لغو رزرو — the whole decision on one screen.
 *
 * What this replaces was two `prompt()` boxes: one for a reason, one for an
 * internal note. Everything else a cancellation actually involves — whether it
 * was justified, who hears about it, what the guest gets back — either did not
 * exist or was decided somewhere else and typed in later.
 *
 * The money is quoted live from the same function that will apply it, so what
 * support reads before pressing the button is what happens when they do. That
 * is also the site's published promise: «مبلغ صورتحساب لغو … در هنگام لغو رزرو
 * برای کاربر به نمایش درمی‌آید».
 */

type CancelledBy = "GUEST_CANCELLED" | "HOST_CANCELLED" | "LIDOMA_CANCELLED";
type NotifyMode = "BOTH" | "ONLY_GUEST" | "ONLY_HOST" | "NONE";

interface Quote {
  band: string;
  bandLabel: string;
  totalAmount: number;
  paidAmount: number;
  penalty: number;
  refund: number;
  hostShare: number;
  siteShare: number;
  elapsedNights: number;
  chargedNights: number;
  hoursToCheckIn: number;
  explanation: string[];
}

const WHO: { value: CancelledBy; label: string }[] = [
  { value: "GUEST_CANCELLED", label: "مهمان" },
  { value: "HOST_CANCELLED", label: "میزبان" },
  { value: "LIDOMA_CANCELLED", label: "لیدوما (سایت)" },
];

const NOTIFY: { value: NotifyMode; label: string; hint: string }[] = [
  { value: "BOTH", label: "هر دو", hint: "مهمان و میزبان هر دو خبر می‌شوند" },
  { value: "ONLY_GUEST", label: "فقط مهمان", hint: "میزبان پیامی دریافت نمی‌کند" },
  { value: "ONLY_HOST", label: "فقط میزبان", hint: "مهمان پیامی دریافت نمی‌کند" },
  { value: "NONE", label: "هیچ‌کدام", hint: "قبلاً تلفنی هماهنگ شده" },
];

/**
 * The reasons each side actually gives, taken from what guests picked in the
 * old system rather than invented. A free-text box collects the rest.
 */
const REASONS: Record<CancelledBy, string[]> = {
  GUEST_CANCELLED: [
    "از انجام سفر منصرف شدم",
    "تأیید میزبان خیلی طول کشید",
    "در ثبت اطلاعات دچار اشتباه شده‌ام",
    "اقامتگاه دیگری در لیدوما پیدا کردم",
    "با قیمت تمام‌شده رزرو مشکل داشتم",
    "در پرداخت مشکل داشتم",
  ],
  HOST_CANCELLED: [
    "اقامتگاه آماده نیست",
    "قبلاً رزرو شده بود",
    "مسافر دیر پرداخت کرد",
    "مشکل فنی در اقامتگاه",
  ],
  LIDOMA_CANCELLED: [
    "هماهنگی با میزبان",
    "هماهنگی با مهمان",
    "تخلف میزبان",
    "تخلف مهمان",
    "عدم پاسخگویی میزبان",
  ],
};

export default function CancelReservationModal({
  reservationId,
  reference,
  open,
  onClose,
  onCancelled,
}: {
  reservationId: number;
  reference: string;
  open: boolean;
  onClose: () => void;
  onCancelled: () => void;
}) {
  const [cancelledBy, setCancelledBy] = useState<CancelledBy>("LIDOMA_CANCELLED");
  const [reason, setReason] = useState("");
  const [desc, setDesc] = useState("");
  const [justified, setJustified] = useState(false);
  const [withoutPayback, setWithoutPayback] = useState(false);
  const [coordinatedWith, setCoordinatedWith] = useState<"" | "guest" | "host">("");
  const [notifyMode, setNotifyMode] = useState<NotifyMode>("BOTH");
  const [override, setOverride] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The reason list changes with who cancelled, so a reason picked for one
  // side must not survive into another where it makes no sense.
  useEffect(() => {
    setReason("");
  }, [cancelledBy]);

  const overrideValue = override.trim() ? parseNum(override) : null;

  const params = new URLSearchParams({
    cancelledBy,
    ...(justified ? { justified: "true" } : {}),
    ...(withoutPayback ? { withoutPayback: "true" } : {}),
    ...(overrideValue != null ? { penaltyOverride: String(overrideValue) } : {}),
  });

  const { data: quote } = useSWR<Quote>(
    open ? `/api/admin/reservations/${reservationId}/cancel-quote?${params.toString()}` : null,
    (p: string) => apiFetch<Quote>(p)
  );

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/cancel`, {
        method: "POST",
        body: JSON.stringify({
          cancelledBy,
          reason: reason.trim(),
          desc: desc.trim() || null,
          justified,
          withoutPayback,
          coordinatedWith: coordinatedWith || null,
          notifyMode,
          penaltyOverride: overrideValue,
        }),
      });
      onCancelled();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "لغو انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`لغو رزرو ${reference}`} width="max-w-[860px]">
      <div className="grid gap-16 md:grid-cols-[1fr_300px] items-start">
        <div className="flex flex-col gap-y-14">
          <Field label="لغو توسط">
            <Select value={cancelledBy} onChange={(e) => setCancelledBy(e.target.value as CancelledBy)}>
              {WHO.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="علت لغو">
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">انتخاب کنید…</option>
              {REASONS[cancelledBy].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="سایر موارد">سایر موارد</option>
            </Select>
          </Field>

          <Field label="توضیح داخلی (فقط برای تیم پشتیبانی)">
            <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
          </Field>

          {cancelledBy === "LIDOMA_CANCELLED" && (
            <Field label="با هماهنگی">
              <Select
                value={coordinatedWith}
                onChange={(e) => setCoordinatedWith(e.target.value as "" | "guest" | "host")}
              >
                <option value="">—</option>
                <option value="guest">مهمان</option>
                <option value="host">میزبان</option>
              </Select>
            </Field>
          )}

          <div className="rounded-10 bg-gray-F5F5F7 p-12 flex flex-col gap-y-10">
            <label className="flex items-start gap-x-10 cursor-pointer">
              <Toggle checked={justified} onChange={setJustified} />
              <span>
                <span className="block text-14 leading-20 text-black">کنسلی موجه</span>
                <span className="block text-11 leading-18 text-gray-9B9BAA">
                  کسری اعمال نمی‌شود و کل مبلغ پرداختی به مهمان برمی‌گردد.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-x-10 cursor-pointer">
              <Toggle checked={withoutPayback} onChange={setWithoutPayback} />
              <span>
                <span className="block text-14 leading-20 text-black">عدم بازگشت وجه به مشتری</span>
                <span className="block text-11 leading-18 text-gray-9B9BAA">
                  هیچ مبلغی به مهمان برنمی‌گردد. تصمیم است، نه محاسبه.
                </span>
              </span>
            </label>
          </div>

          <Field label="مبلغ کسر دستی (اختیاری — تومان)">
            <Input
              inputMode="numeric"
              value={overrideValue ? overrideValue.toLocaleString("fa-IR") : ""}
              onChange={(e) => setOverride(e.target.value)}
              placeholder="طبق مقررات محاسبه می‌شود"
            />
            <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
              برای رزروهای بلندمدت و ایام پیک که طبق مقررات «با توافق میزبان» تعیین می‌شوند.
            </p>
          </Field>

          <Field label="نحوه ارسال پیام لغو">
            <div className="grid grid-cols-2 gap-8">
              {NOTIFY.map((n) => (
                <button
                  key={n.value}
                  type="button"
                  onClick={() => setNotifyMode(n.value)}
                  aria-pressed={notifyMode === n.value}
                  className={`text-right px-12 py-10 rounded-10 border transition ${
                    notifyMode === n.value
                      ? "border-primary-main bg-primary-light"
                      : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
                  }`}
                >
                  <span className="block text-13 leading-20 text-black">{n.label}</span>
                  <span className="block text-11 leading-16 text-gray-9B9BAA">{n.hint}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* The consequences, live, next to the choices that cause them. */}
        <div className="rounded-12 border border-gray-E5E5E6 p-14 sticky top-0">
          <h4 className="text-14 leading-22 font-m text-black mb-2">صورتحساب لغو</h4>
          {quote ? (
            <>
              <Badge tone={quote.penalty > 0 ? "yellow" : "green"}>{quote.bandLabel}</Badge>

              <div className="mt-12 flex flex-col gap-y-6 text-12 leading-20">
                <Row label="مبلغ کل اجاره" value={quote.totalAmount} />
                <Row label="پرداختی مهمان" value={quote.paidAmount} />
                <div className="border-t border-dashed border-gray-E5E5E6 my-4" />
                <Row label="کسر" value={quote.penalty} tone="red" />
                <Row label="بازگشت به مهمان" value={quote.refund} tone="green" strong />
                <div className="border-t border-dashed border-gray-E5E5E6 my-4" />
                <Row label="سهم میزبان از کسر" value={quote.hostShare} />
                <Row label="سهم سایت از کسر" value={quote.siteShare} />
              </div>

              <ul className="mt-12 flex flex-col gap-y-4">
                {quote.explanation.map((line, i) => (
                  <li key={i} className="text-11 leading-18 text-gray-6C6A7D">
                    · {line}
                  </li>
                ))}
              </ul>

              <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
                {quote.hoursToCheckIn > 0
                  ? `${faNum(quote.hoursToCheckIn)} ساعت تا شروع اقامت`
                  : "اقامت شروع شده است"}
              </p>
            </>
          ) : (
            <p className="text-12 text-gray-9B9BAA">در حال محاسبه…</p>
          )}
        </div>
      </div>

      {!!error && <p className="mt-12 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-10 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button variant="danger" disabled={busy || !reason.trim()} onClick={submit}>
          {busy ? "در حال لغو..." : "لغو رزرو"}
        </Button>
      </div>
    </Modal>
  );
}

function Row({
  label,
  value,
  tone,
  strong,
}: {
  label: string;
  value: number;
  tone?: "red" | "green";
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-x-10">
      <span className="text-gray-6C6A7D">{label}</span>
      <span
        className={`whitespace-nowrap ${strong ? "font-m" : ""} ${
          tone === "red" ? "text-[#C62828]" : tone === "green" ? "text-[#2E7D32]" : "text-black"
        }`}
      >
        {faNum(value)}
      </span>
    </div>
  );
}
