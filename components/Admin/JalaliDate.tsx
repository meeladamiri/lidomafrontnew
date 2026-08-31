import { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment-jalaali";

/**
 * A Jalali date field for the panel.
 *
 * The browser's own `<input type="date">` is Gregorian, and an agent reading a
 * booking off a Persian invoice should not have to convert ۱۴۰۵/۰۶/۲۱ in their
 * head to check they picked the right day. This shows and picks in Jalali and
 * hands back an ISO date, so nothing downstream changes.
 *
 * Deliberately small: a month grid and two arrows. The site's own `Calendar`
 * component does ranges, prices, availability and peak days, none of which
 * belong in a field that answers "which day".
 */

export const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Persian digits, ungrouped — days and years are labels, not quantities. */
export const faDigits = (v: string | number) =>
  String(v).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/** `2026-09-12` → `۲۱ شهریور ۱۴۰۵` */
export function jalaliLong(iso: string | null | undefined) {
  if (!iso) return "—";
  const m = moment(iso.slice(0, 10), "YYYY-MM-DD");
  if (!m.isValid()) return "—";
  return `${faDigits(m.format("jD"))} ${JALALI_MONTHS[m.jMonth()]} ${faDigits(m.jYear())}`;
}

/** `2026-09-12` → `۱۴۰۵/۰۶/۲۱` */
export function jalaliShort(iso: string | null | undefined) {
  if (!iso) return "—";
  const m = moment(iso.slice(0, 10), "YYYY-MM-DD");
  return m.isValid() ? faDigits(m.format("jYYYY/jMM/jDD")) : "—";
}

export default function JalaliDateField({
  label,
  value,
  onChange,
  min,
  hint,
}: {
  label: string;
  /** ISO `YYYY-MM-DD`. */
  value: string;
  onChange: (iso: string) => void;
  /** ISO date before which days are not selectable. */
  min?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => moment(value || undefined, "YYYY-MM-DD"));
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && value) setCursor(moment(value, "YYYY-MM-DD"));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const days = useMemo(() => {
    const start = cursor.clone().startOf("jMonth");
    const count = cursor.clone().endOf("jMonth").jDate();
    return Array.from({ length: count }, (_, i) => start.clone().add(i, "day"));
  }, [cursor]);

  // Jalali weeks start on Saturday; `day()` is Gregorian (0 = Sunday), so
  // shifting by one puts Saturday in the first column.
  const leading = (cursor.clone().startOf("jMonth").day() + 1) % 7;

  return (
    <div ref={wrapper} className="relative">
      <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">{label}</span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-x-8 px-14 py-10 rounded-10 border text-14 leading-22 text-right transition ${
          open ? "border-primary-main" : "border-gray-E5E5E6 hover:border-gray-C4CAD3"
        }`}
      >
        <span className={value ? "text-black" : "text-gray-9B9BAA"}>
          {value ? jalaliLong(value) : "انتخاب تاریخ"}
        </span>
        <i className="icon-Calendar text-16 text-gray-9B9BAA" />
      </button>

      {hint && <span className="block mt-4 text-11 leading-18 text-gray-9B9BAA">{hint}</span>}

      {open && (
        <div className="absolute z-5 mt-6 right-0 w-[268px] bg-white rounded-12 border border-gray-E5E5E6 shadow-[0_6px_16px_0px_rgba(8,19,56,0.12)] p-12">
          <div className="flex items-center justify-between mb-10">
            <button
              type="button"
              onClick={() => setCursor((c) => c.clone().subtract(1, "jMonth"))}
              className="w-28 h-28 rounded-8 text-gray-6C6A7D hover:bg-gray-F0F0F0"
            >
              ‹
            </button>
            <span className="text-13 leading-20 font-m text-black">
              {JALALI_MONTHS[cursor.jMonth()]} {faDigits(cursor.jYear())}
            </span>
            <button
              type="button"
              onClick={() => setCursor((c) => c.clone().add(1, "jMonth"))}
              className="w-28 h-28 rounded-8 text-gray-6C6A7D hover:bg-gray-F0F0F0"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-10 text-gray-9B9BAA py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: leading }).map((_, i) => (
              <div key={`b-${i}`} />
            ))}
            {days.map((d) => {
              const iso = d.format("YYYY-MM-DD");
              const selected = iso === value;
              const disabled = !!min && iso < min;
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                  className={`h-30 rounded-8 text-12 leading-18 transition ${
                    selected
                      ? "bg-primary-main text-white font-m"
                      : disabled
                        ? "text-gray-C4CAD3 cursor-not-allowed"
                        : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
                  }`}
                >
                  {faDigits(d.format("jD"))}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
