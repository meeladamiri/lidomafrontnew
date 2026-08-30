import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card } from "@/components/Admin/ui";

/**
 * The action bar — Odoo's buttons, grouped by what they do to the world.
 *
 * Odoo put these in one undifferentiated row, so «چاپ فاکتور» sat beside «لغو
 * رزرو» and both looked equally safe to press. They are separated here by
 * consequence: things that only look at the booking, things that send a
 * message to someone, and the one that ends it.
 *
 * ⚠️ Sending is in-app notification only for now — `lib/sms.ts` is a stub. The
 * recipient, the text and the log entry are real; the transport is the part
 * that is pending.
 */

const SEND_ACTIONS = [
  { kind: "HOST_INFO_TO_GUEST", label: "اطلاعات میزبان به مهمان" },
  { kind: "GUEST_INFO_TO_HOST", label: "اطلاعات مهمان به میزبان" },
  { kind: "RESIDENCE_LINK_TO_GUEST", label: "لینک اقامتگاه" },
  { kind: "VOUCHER_TO_HOST", label: "وچر به میزبان" },
  { kind: "CARD_NUMBER_TO_GUEST", label: "شماره کارت" },
  { kind: "REVIEW_LINK_TO_GUEST", label: "لینک نظرسنجی" },
] as const;

export default function ReservationActions({
  reservationId,
  residenceId,
  canCancel,
  onCancel,
  onActed,
}: {
  reservationId: number;
  residenceId: number;
  canCancel: boolean;
  onCancel: () => void;
  onActed: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(kind: string, label: string) {
    setBusy(kind);
    setError(null);
    setDone(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/actions`, {
        method: "POST",
        body: JSON.stringify({ kind }),
      });
      setDone(`${label} ارسال شد`);
      onActed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارسال نشد");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="p-20 mb-20">
      <h3 className="text-16 leading-24 font-m text-black mb-12">عملیات</h3>

      <div className="mb-14">
        <p className="text-11 leading-18 text-gray-9B9BAA mb-6">مشاهده</p>
        <div className="flex flex-wrap gap-8">
          <a href={`/admin/reservations/${reservationId}/invoice`} target="_blank" rel="noreferrer">
            <Button variant="secondary">
              <i className="icon-Printer text-16" /> چاپ فاکتور
            </Button>
          </a>
          <a href={`/admin/residences/${residenceId}/calendar`}>
            <Button variant="secondary">
              <i className="icon-CalendarFlash text-16" /> تقویم و نرخ
            </Button>
          </a>
        </div>
      </div>

      <div className="mb-14">
        <p className="text-11 leading-18 text-gray-9B9BAA mb-6">
          ارسال پیام — هر ارسال در تاریخچه ثبت می‌شود
        </p>
        <div className="flex flex-wrap gap-8">
          {SEND_ACTIONS.map((a) => (
            <Button
              key={a.kind}
              variant="secondary"
              disabled={busy === a.kind}
              onClick={() => send(a.kind, a.label)}
            >
              {busy === a.kind ? "در حال ارسال..." : a.label}
            </Button>
          ))}
        </div>
      </div>

      {done && <p className="text-13 text-[#2E7D32] mb-8">{done}</p>}
      {error && <p className="text-13 text-[#C62828] mb-8">{error}</p>}

      {canCancel && (
        <div className="pt-12 border-t border-gray-F0F0F0">
          <p className="text-11 leading-18 text-gray-9B9BAA mb-6">
            پایان‌دادن به رزرو — پول و تقویم را جابه‌جا می‌کند
          </p>
          <Button variant="danger" onClick={onCancel}>
            لغو رزرو
          </Button>
        </div>
      )}
    </Card>
  );
}
