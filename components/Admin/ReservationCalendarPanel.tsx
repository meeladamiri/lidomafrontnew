import { useState } from "react";
import CalendarRates, { type AffectedReservation } from "@/components/Admin/CalendarRates";
import RepriceModal from "@/components/Admin/RepriceModal";
import { Button, Card, faNum } from "@/components/Admin/ui";

/**
 * The listing's calendar, opened from inside a booking.
 *
 * Same component as the standalone page, with two differences that matter
 * here: this booking's nights are ringed so the person editing can see what
 * they are about to touch, and after a save the question is asked about *this*
 * booking first rather than about a list of them.
 *
 * Collapsed by default. A reservation page is opened to answer a question
 * about a booking, and a twelve-week calendar unfurled above the money would
 * push the answer below the fold.
 */
export default function ReservationCalendarPanel({
  reservationId,
  reference,
  residenceId,
  startDate,
  endDate,
  onRepriced,
}: {
  reservationId: number;
  reference: string;
  residenceId: number;
  startDate: string;
  endDate: string;
  onRepriced: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [ask, setAsk] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [others, setOthers] = useState<AffectedReservation[]>([]);

  const range = { start: startDate.slice(0, 10), end: endDate.slice(0, 10) };

  function handleAffected(rows: AffectedReservation[]) {
    // Did the edit land on this booking's own nights, or only on other
    // bookings' — those are different questions and get different prompts.
    const touchedThis = rows.some((r) => r.id === reservationId);
    setOthers(rows.filter((r) => r.id !== reservationId));
    if (touchedThis) setAsk(true);
  }

  if (!open) {
    return (
      <Card className="p-20 mb-20">
        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8">
          <div>
            <h3 className="text-16 leading-24 font-m text-black">تقویم و نرخ اقامتگاه</h3>
            <p className="text-12 leading-20 text-gray-9B9BAA mt-2">
              نرخ شب‌های این اقامتگاه را همین‌جا ویرایش کنید. شب‌های این رزرو مشخص شده‌اند.
            </p>
          </div>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            باز کردن تقویم
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mb-20">
      <CalendarRates
        residenceId={residenceId}
        highlightRange={range}
        onAffected={handleAffected}
      />

      {ask && (
        <Card className="p-20 mt-16">
          <h4 className="text-15 leading-24 font-m text-black mb-4">
            نرخ این رزرو هم به‌روز شود؟
          </h4>
          <p className="text-12 leading-20 text-gray-6C6A7D mb-12">
            تغییری که ذخیره کردید روی شب‌های رزرو <b>{reference}</b> بود. نرخ این رزرو هنوز عوض
            نشده — اگر لازم است، اول پیش‌نمایش تغییر را ببینید.
          </p>
          <div className="flex gap-x-8 flex-wrap gap-y-8">
            <Button
              onClick={() => {
                setShowPreview(true);
                setAsk(false);
              }}
            >
              بله، پیش‌نمایش را ببینم
            </Button>
            <Button variant="secondary" onClick={() => setAsk(false)}>
              نه، فقط تقویم
            </Button>
          </div>
        </Card>
      )}

      {others.length > 0 && (
        <Card className="p-20 mt-16">
          <p className="text-12 leading-20 text-gray-6C6A7D">
            این تغییر روی شب‌های {faNum(others.length)} رزرو دیگر هم بود
            {" — "}
            {others.map((o) => o.reference).join("، ")}. برای به‌روزرسانی نرخ آن‌ها از صفحه‌ی تقویم
            اقامتگاه اقدام کنید.
          </p>
          <div className="mt-10">
            <Button variant="secondary" onClick={() => setOthers([])}>
              متوجه شدم
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-12">
        <Button variant="secondary" onClick={() => setOpen(false)}>
          بستن تقویم
        </Button>
      </div>

      <RepriceModal
        reservationId={showPreview ? reservationId : null}
        reference={reference}
        open={showPreview}
        onClose={() => setShowPreview(false)}
        onDone={onRepriced}
      />
    </div>
  );
}
