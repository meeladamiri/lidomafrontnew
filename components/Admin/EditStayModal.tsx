import { useEffect, useState } from "react";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, faMoney, faNum } from "@/components/Admin/ui";
import JalaliDateField, { jalaliLong } from "@/components/Admin/JalaliDate";

/**
 * ویرایش تاریخ، شب و نفرات.
 *
 * Moving a booking's dates is not a field edit: it changes what the stay
 * costs, releases the old nights and takes the new ones, and can collide with
 * another booking. So it is a two-step — describe the change, see what it
 * does, then confirm — and every figure in the middle comes from the server's
 * own dry run rather than arithmetic done here.
 *
 * Check-out is not an input. Nobody books "until the 24th"; they book a
 * check-in and a number of nights, and the date follows. Typing both is two
 * chances to disagree with each other.
 *
 * Extra guests are not an input either — see `extraFor`.
 */

interface Stay {
  startDate: string;
  endDate: string;
  daysCount: number;
  guestsCount: number;
  extraGuestsCount: number;
  capacity: number | null;
  maxCapacity: number | null;
}

interface Preview {
  before: {
    start_date: string;
    end_date: string;
    nights: number;
    guests_count: number;
    extra_guests_count: number;
    total_amount: number;
    host_share: number;
    guest_commission: number;
  };
  after: Preview["before"];
  clashes: { id: number; reference: string; start_date: string; end_date: string }[];
  warnings: string[];
}

/**
 * How many of the party count as "extra".
 *
 * The listing has a standard capacity included in the nightly rate and a
 * maximum it will take; everyone above the standard is charged per head. That
 * arithmetic was being typed by hand into a second field, which is how a
 * booking ends up with six guests and no extras — the rate says one thing and
 * the invoice another.
 */
function extraFor(guests: number, capacity: number | null, maxCapacity: number | null) {
  if (!capacity) return 0;
  const ceiling = maxCapacity ?? guests;
  return Math.max(Math.min(guests, ceiling) - capacity, 0);
}

const addDays = (iso: string, n: number) =>
  moment(iso, "YYYY-MM-DD").add(n, "day").format("YYYY-MM-DD");

const nightsBetween = (from: string, to: string) =>
  Math.round(moment(to, "YYYY-MM-DD").diff(moment(from, "YYYY-MM-DD"), "day"));

export default function EditStayModal({
  open,
  onClose,
  reservationId,
  stay,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: number;
  stay: Stay;
  onSaved: () => void;
}) {
  const [startDate, setStartDate] = useState("");
  const [nights, setNights] = useState(1);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStartDate(stay.startDate.slice(0, 10));
    setNights(Math.max(stay.daysCount, 1));
    setGuests(stay.guestsCount);
    setNote("");
    setPreview(null);
    setError(null);
  }, [open, stay.startDate, stay.daysCount, stay.guestsCount]);

  const endDate = startDate ? addDays(startDate, nights) : "";
  const extra = extraFor(guests, stay.capacity, stay.maxCapacity);

  const changed =
    startDate !== stay.startDate.slice(0, 10) ||
    nights !== stay.daysCount ||
    guests !== stay.guestsCount ||
    extra !== stay.extraGuestsCount;

  const overCapacity = !!stay.maxCapacity && guests > stay.maxCapacity;

  async function send(dryRun: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<Preview>(`/api/admin/reservations/${reservationId}/stay`, {
        method: "PATCH",
        body: JSON.stringify({
          startDate,
          endDate,
          guestsCount: guests,
          extraGuestsCount: extra,
          dryRun,
          ...(dryRun ? {} : { note: note.trim() }),
        }),
      });
      if (dryRun) setPreview(res);
      else {
        onSaved();
        onClose();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : dryRun ? "محاسبه نشد" : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  const blocked = !!preview && preview.clashes.length > 0;

  return (
    <Modal open={open} onClose={onClose} title="ویرایش اقامت" width="max-w-[560px]">
      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <JalaliDateField
          label="تاریخ ورود"
          value={startDate}
          onChange={(v) => {
            setStartDate(v);
            setPreview(null);
          }}
        />

        <Counter
          label="تعداد شب"
          value={nights}
          min={1}
          onChange={(v) => {
            setNights(v);
            setPreview(null);
          }}
        />
      </div>

      <div className="rounded-10 bg-gray-F5F5F7 px-12 py-10 mb-12 flex items-center justify-between gap-x-12 flex-wrap gap-y-6">
        <span className="text-12 leading-20 text-gray-6C6A7D">تاریخ خروج</span>
        <b className="text-14 leading-22 font-m text-black">{jalaliLong(endDate)}</b>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-4">
        <Counter
          label="تعداد مهمانان"
          value={guests}
          min={1}
          max={stay.maxCapacity ?? undefined}
          onChange={(v) => {
            setGuests(v);
            setPreview(null);
          }}
        />

        {/* Read-only on purpose: it is arithmetic, not a decision. */}
        <div>
          <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">نفرات اضافه</span>
          <div className="px-14 py-10 rounded-10 border border-gray-E5E5E6 bg-gray-F5F5F7 text-14 leading-22 text-center text-black">
            {faNum(extra)} نفر
          </div>
          <span className="block mt-4 text-11 leading-18 text-gray-9B9BAA">
            {stay.capacity
              ? `ظرفیت پایه ${faNum(stay.capacity)} نفر${stay.maxCapacity ? ` · حداکثر ${faNum(stay.maxCapacity)}` : ""}`
              : "ظرفیت پایه‌ی اقامتگاه ثبت نشده"}
          </span>
        </div>
      </div>

      {overCapacity && (
        <p className="mb-12 text-12 leading-20 text-[#C62828]">
          ظرفیت این اقامتگاه حداکثر {faNum(stay.maxCapacity)} نفر است.
        </p>
      )}

      {preview && (
        <div className="rounded-10 border border-gray-E5E5E6 p-12 mt-8 mb-14">
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">پس از ذخیره</p>
          <Delta label="مبلغ کل اجاره" a={preview.before.total_amount} b={preview.after.total_amount} />
          <Delta label="سهم میزبان" a={preview.before.host_share} b={preview.after.host_share} />
          <Delta
            label="کارمزد مهمان"
            a={preview.before.guest_commission}
            b={preview.after.guest_commission}
          />

          {preview.clashes.length > 0 && (
            <div className="mt-10 rounded-8 bg-[#FFEBEB] p-10">
              <p className="text-12 leading-20 text-[#C62828]">
                این بازه با رزرو {preview.clashes.map((c) => c.reference).join("، ")} تداخل دارد و
                ذخیره نمی‌شود.
              </p>
            </div>
          )}

          {preview.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-x-8 mt-8">
              <Badge tone="yellow">توجه</Badge>
              <span className="text-11 leading-18 text-gray-6C6A7D">{w}</span>
            </div>
          ))}

          {/* Said plainly because it is the part that surprises people: the
              rent follows the nights, it is not carried over. */}
          <p className="mt-10 text-11 leading-18 text-gray-9B9BAA">
            مبلغ اجاره از نرخ شب‌های بازه‌ی جدید در تقویم دوباره حساب می‌شود و شب‌های قبلی در
            تقویم آزاد می‌شوند.
          </p>
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="توضیح — چرا این اقامت جابه‌جا می‌شود؟"
        className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
      />
      <p className="mt-4 text-11 leading-18 text-gray-9B9BAA">
        با نام شما در تاریخچه‌ی رزرو ثبت می‌شود.
      </p>

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-8 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        {!preview ? (
          <Button disabled={busy || !changed || !startDate || overCapacity} onClick={() => send(true)}>
            {busy ? "..." : "محاسبه‌ی تغییر"}
          </Button>
        ) : (
          <Button disabled={busy || blocked || note.trim().length < 3} onClick={() => send(false)}>
            {busy ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function Counter({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>
      <div className="flex items-center gap-x-8">
        <button
          type="button"
          onClick={() => onChange(Math.max(value - 1, min))}
          className="w-36 h-36 shrink-0 rounded-10 border border-gray-E5E5E6 text-16 text-gray-6C6A7D hover:border-gray-C4CAD3 transition"
        >
          −
        </button>
        <span className="flex-1 text-center text-14 leading-22 font-m text-black">
          {faNum(value)}
        </span>
        <button
          type="button"
          disabled={max !== undefined && value >= max}
          onClick={() => onChange(value + 1)}
          className="w-36 h-36 shrink-0 rounded-10 border border-gray-E5E5E6 text-16 text-gray-6C6A7D hover:border-gray-C4CAD3 transition disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Delta({ label, a, b }: { label: string; a: number; b: number }) {
  const moved = Math.abs(a - b) >= 1;
  return (
    <div className="flex items-baseline justify-between gap-x-10 py-2 text-12 leading-20">
      <span className="text-gray-6C6A7D">{label}</span>
      <span className="whitespace-nowrap">
        <span className="text-gray-9B9BAA">{faMoney(Math.round(a))}</span>
        {" → "}
        <b className={`font-m ${moved ? (b > a ? "text-[#2E7D32]" : "text-[#C62828]") : "text-gray-9B9BAA"}`}>
          {faMoney(Math.round(b))}
        </b>
      </span>
    </div>
  );
}
