import { useEffect, useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, faDate, faMoney, faNum } from "@/components/Admin/ui";

/**
 * ویرایش تاریخ، شب و نفرات.
 *
 * Moving a booking's dates is not a field edit: it changes what the stay
 * costs, releases the old nights and takes the new ones, and can collide with
 * another booking. So it is a two-step — describe the change, see what it
 * does, then confirm — and every figure in the middle step comes from the
 * server's own dry run rather than arithmetic done here.
 *
 * The night count is not an input. It is the distance between two dates, and
 * a field that lets someone type a fourth night into a three-night range is a
 * field that produces an invoice nobody can explain.
 */

interface Stay {
  startDate: string;
  endDate: string;
  daysCount: number;
  guestsCount: number;
  extraGuestsCount: number;
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
  const [endDate, setEndDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [extra, setExtra] = useState(0);
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setStartDate(stay.startDate.slice(0, 10));
    setEndDate(stay.endDate.slice(0, 10));
    setGuests(stay.guestsCount);
    setExtra(stay.extraGuestsCount);
    setNote("");
    setPreview(null);
    setError(null);
  }, [open, stay.startDate, stay.endDate, stay.guestsCount, stay.extraGuestsCount]);

  const nights =
    startDate && endDate
      ? Math.round(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000
        )
      : 0;

  const changed =
    startDate !== stay.startDate.slice(0, 10) ||
    endDate !== stay.endDate.slice(0, 10) ||
    guests !== stay.guestsCount ||
    extra !== stay.extraGuestsCount;

  const body = {
    startDate,
    endDate,
    guestsCount: guests,
    extraGuestsCount: extra,
  };

  async function send(dryRun: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<Preview>(`/api/admin/reservations/${reservationId}/stay`, {
        method: "PATCH",
        body: JSON.stringify({ ...body, dryRun, ...(dryRun ? {} : { note: note.trim() }) }),
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
        <DateField
          label="تاریخ ورود"
          value={startDate}
          onChange={(v) => {
            setStartDate(v);
            setPreview(null);
          }}
        />
        <DateField
          label="تاریخ خروج"
          value={endDate}
          onChange={(v) => {
            setEndDate(v);
            setPreview(null);
          }}
        />
      </div>

      <div className="rounded-10 bg-gray-F5F5F7 px-12 py-10 mb-12 flex items-center justify-between">
        <span className="text-12 leading-20 text-gray-6C6A7D">مدت اقامت</span>
        <b className={`text-14 leading-22 font-m ${nights < 1 ? "text-[#C62828]" : "text-black"}`}>
          {nights < 1 ? "بازه نامعتبر" : `${faNum(nights)} شب`}
        </b>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <Counter
          label="تعداد مهمانان"
          value={guests}
          min={1}
          onChange={(v) => {
            setGuests(v);
            setPreview(null);
          }}
        />
        <Counter
          label="نفرات اضافه"
          value={extra}
          min={0}
          onChange={(v) => {
            setExtra(v);
            setPreview(null);
          }}
        />
      </div>

      {stay.maxCapacity && guests + extra > stay.maxCapacity && (
        <p className="mb-12 text-12 leading-20 text-[#C62828]">
          ظرفیت این اقامتگاه حداکثر {faNum(stay.maxCapacity)} نفر است.
        </p>
      )}

      {preview && (
        <div className="rounded-10 border border-gray-E5E5E6 p-12 mb-14">
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
            مبلغ اجاره از نرخ شب‌های بازه‌ی جدید در تقویم دوباره حساب می‌شود.
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
          <Button disabled={busy || !changed || nights < 1} onClick={() => send(true)}>
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

/**
 * A Gregorian picker with the Jalali date printed under it.
 *
 * The browser's own date input is what the rest of this panel uses, and it is
 * Gregorian; showing the Jalali equivalent underneath is what lets someone
 * check they picked the day they meant without a second calendar widget.
 */
function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
      />
      <span className="block mt-4 text-11 leading-18 text-primary-dark">
        {value ? faDate(value) : "—"}
      </span>
    </label>
  );
}

function Counter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>
      <div className="flex items-center gap-x-8">
        <button
          type="button"
          onClick={() => onChange(Math.max(value - 1, min))}
          className="w-36 h-36 rounded-10 border border-gray-E5E5E6 text-16 text-gray-6C6A7D hover:border-gray-C4CAD3 transition"
        >
          −
        </button>
        <span className="flex-1 text-center text-14 leading-22 font-m text-black">
          {faNum(value)}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-36 h-36 rounded-10 border border-gray-E5E5E6 text-16 text-gray-6C6A7D hover:border-gray-C4CAD3 transition"
        >
          +
        </button>
      </div>
    </label>
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
