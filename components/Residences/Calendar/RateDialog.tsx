import React, { useState } from "react";
import type { CalendarPatch } from "@/api/Residences/hostCalendar";
import { faDigits } from "./model";

/**
 * «تغییر نرخ» for the selected nights.
 *
 * A dialog rather than a page. The old flow navigated away to set a price and
 * came back having lost the selection, so changing three separate weekends
 * meant three round trips through a route. This opens over the calendar and
 * closes back onto it with the selection intact — on save *and* on cancel.
 *
 * Empty means "leave alone", not zero. A host opening this to add a discount
 * should not have to retype the price to avoid clearing it.
 */

const digits = (value: string) =>
  value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^\d]/g, "");

const grouped = (value: string) =>
  value ? faDigits(value.replace(/\B(?=(\d{3})+(?!\d))/g, "٬")) : "";

export default function RateDialog({
  count,
  basePrice,
  onClose,
  onApply,
  busy,
}: {
  count: number;
  basePrice: number | null;
  onClose: () => void;
  onApply: (patch: Omit<CalendarPatch, "dates">) => void;
  busy: boolean;
}) {
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState<string | null>(null);

  function apply() {
    const patch: Omit<CalendarPatch, "dates"> = {};

    if (price) {
      const value = Number(price);
      if (value < 50_000) {
        setError("نرخ کمتر از ۵۰٬۰۰۰ تومان به نظر اشتباه می‌رسد.");
        return;
      }
      patch.specialPrice = value;
    }
    if (discount) {
      const value = Number(discount);
      if (value < 1 || value > 90) {
        setError("تخفیف باید بین ۱ تا ۹۰ درصد باشد.");
        return;
      }
      patch.discountAmount = value;
      patch.discountType = "PERCENTAGE";
    }

    if (Object.keys(patch).length === 0) {
      setError("نرخ یا تخفیف را وارد کنید.");
      return;
    }
    onApply(patch);
  }

  const field =
    "w-full h-[52px] px-16 rounded-12 bg-white border border-gray-DBDFE5 text-14 font-m text-black outline-none transition-colors focus:border-primary-main focus:ring-2 focus:ring-primary-light";

  return (
    <div
      className="fixed inset-0 z-5 flex items-end md:items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-label="تغییر نرخ روزهای انتخاب‌شده"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-[420px] bg-white rounded-t-20 md:rounded-20 p-20 pb-[max(20px,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-16 leading-26 font-b text-black">تغییر نرخ</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-32 h-32 -mt-4 -ml-4 grid place-items-center text-gray-77828F"
          >
            <i className="icon-Close text-18" />
          </button>
        </div>
        <p className="text-12 leading-20 font-l text-gray-77828F mb-16">
          روی {faDigits(count)} روز انتخاب‌شده اعمال می‌شود.
          {basePrice ? ` نرخ فعلی اقامتگاه ${grouped(String(basePrice))} تومان است.` : ""}
        </p>

        <label className="block mb-14">
          <span className="block text-14 font-m text-black mb-8">نرخ هر شب</span>
          <div className="relative">
            <input
              value={grouped(price)}
              onChange={(e) => {
                setPrice(digits(e.target.value));
                setError(null);
              }}
              inputMode="numeric"
              placeholder="بدون تغییر"
              className={`${field} pl-64`}
              autoFocus
            />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 text-12 font-l text-gray-77828F pointer-events-none">
              تومان
            </span>
          </div>
        </label>

        <label className="block mb-6">
          <span className="block text-14 font-m text-black mb-8">تخفیف</span>
          <div className="relative">
            <input
              value={discount ? faDigits(discount) : ""}
              onChange={(e) => {
                setDiscount(digits(e.target.value));
                setError(null);
              }}
              inputMode="numeric"
              placeholder="بدون تغییر"
              className={`${field} pl-48`}
            />
            <span className="absolute left-16 top-1/2 -translate-y-1/2 text-12 font-l text-gray-77828F pointer-events-none">
              درصد
            </span>
          </div>
        </label>

        <div className="min-h-[24px]">
          {error && (
            <p role="alert" className="text-12 font-m text-error-light">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-x-12 mt-10">
          <button
            type="button"
            onClick={onClose}
            className="h-[48px] px-20 shrink-0 rounded-12 border border-gray-DBDFE5 text-14 font-m text-black"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy}
            className="grow h-[48px] rounded-12 bg-primary-main text-14 font-b text-black disabled:opacity-50"
          >
            {busy ? "در حال ذخیره…" : "اعمال"}
          </button>
        </div>
      </div>
    </div>
  );
}
