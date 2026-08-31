import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, parseNum } from "@/components/Admin/ui";

// "نرخ اقامتگاه" tab. Prices are stored in تومان; discounts are percentages
// (the unit dropdown mirrors the design — a fixed-amount discount would need
// a schema change, so it's disabled for now).

export interface PricingValues {
  weekPrice: number | null;
  weekendPrice: number | null;
  peakPrice: number | null;
  extraGuestsPrice: number | null;
  extraGuestsPeakPrice: number | null;
  weeklyDiscount: number | null;
  monthlyDiscount: number | null;
}

function MoneyField({
  label,
  value,
  onChange,
  highlight,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  highlight?: boolean;
}) {
  // The field shows its value in Persian digits, so the next keystroke comes
  // back in Persian — and `\D` matches everything that is not an ASCII digit,
  // which threw the whole number away and left one character behind.
  const digits = String(parseNum(value) || "");
  return (
    <label className="block">
      <span
        className={`block mb-6 text-12 leading-18 ${
          highlight ? "text-[#C62828]" : "text-gray-6C6A7D"
        }`}
      >
        {label}
      </span>
      <div className="relative">
        <input
          value={digits ? Number(digits).toLocaleString("fa-IR") : ""}
          onChange={(e) => onChange(String(parseNum(e.target.value) || ""))}
          inputMode="numeric"
          placeholder="۰"
          className="w-full px-14 py-10 pl-56 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
        />
        <span className="absolute left-14 top-1/2 -translate-y-1/2 text-12 text-gray-9B9BAA pointer-events-none">
          تومان
        </span>
      </div>
    </label>
  );
}

export default function PricingTab({
  residenceId,
  pricing,
  onSaved,
}: {
  residenceId: number;
  pricing: PricingValues;
  onSaved: () => void;
}) {
  const asText = (n: number | null) => (n == null ? "" : String(Math.trunc(n)));

  const [form, setForm] = useState({
    weekPrice: asText(pricing.weekPrice),
    weekendPrice: asText(pricing.weekendPrice),
    peakPrice: asText(pricing.peakPrice),
    extraGuestsPrice: asText(pricing.extraGuestsPrice),
    extraGuestsPeakPrice: asText(pricing.extraGuestsPeakPrice),
    weeklyDiscount: asText(pricing.weeklyDiscount),
    monthlyDiscount: asText(pricing.monthlyDiscount),
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === "" ? undefined : Number(v));

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/pricing`, {
        method: "PATCH",
        body: JSON.stringify({
          weekPrice: num(form.weekPrice),
          weekendPrice: num(form.weekendPrice),
          peakPrice: num(form.peakPrice),
          extraGuestsPrice: num(form.extraGuestsPrice),
          extraGuestsPeakPrice: num(form.extraGuestsPeakPrice),
          weeklyDiscount: num(form.weeklyDiscount),
          monthlyDiscount: num(form.monthlyDiscount),
        }),
      });
      setSavedAt(Date.now());
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-x-16 items-start">
      <Card className="flex-1 min-w-0 p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-16">نرخ اقامتگاه</h3>

        <div className="flex flex-col gap-y-14 max-w-[640px]">
          <MoneyField
            label="قیمت پایه ( جمعه تا چهارشنبه )"
            value={form.weekPrice}
            onChange={set("weekPrice")}
          />
          <MoneyField
            label="قیمت آخر هفته ( چهارشنبه و پنجشنبه )"
            value={form.weekendPrice}
            onChange={set("weekendPrice")}
          />
          <MoneyField
            label="قیمت ایام پیک ( تعطیلات خاص )"
            value={form.peakPrice}
            onChange={set("peakPrice")}
            highlight
          />
          <MoneyField
            label="نرخ نفر اضافه"
            value={form.extraGuestsPrice}
            onChange={set("extraGuestsPrice")}
          />
          <MoneyField
            label="نرخ نفر اضافه ( ایام پیک )"
            value={form.extraGuestsPeakPrice}
            onChange={set("extraGuestsPeakPrice")}
            highlight
          />

          <label className="block">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">
              تخفیف رزرو هفتگی
            </span>
            <div className="flex items-center gap-x-8">
              <input
                value={form.weeklyDiscount}
                onChange={(e) => set("weeklyDiscount")(String(parseNum(e.target.value) || ""))}
                inputMode="numeric"
                placeholder="۰"
                className="flex-1 px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
              />
              <span className="px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 text-gray-6C6A7D bg-gray-F5F5F7">
                درصد
              </span>
            </div>
          </label>

          <label className="block">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">
              تخفیف رزرو ماهانه
            </span>
            <div className="flex items-center gap-x-8">
              <input
                value={form.monthlyDiscount}
                onChange={(e) => set("monthlyDiscount")(String(parseNum(e.target.value) || ""))}
                inputMode="numeric"
                placeholder="۰"
                className="flex-1 px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
              />
              <span className="px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 text-gray-6C6A7D bg-gray-F5F5F7">
                درصد
              </span>
            </div>
          </label>

          <p className="text-12 leading-20 text-gray-9B9BAA">
            بازه‌های «ایام پیک» در تنظیمات ← روزهای پیک تعریف می‌شوند و برای همه اقامتگاه‌ها
            اعمال می‌شوند.
          </p>
        </div>
      </Card>

      <Card className="p-12 w-[200px] shrink-0 flex flex-col gap-y-8 sticky top-[76px]">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ذخیره"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setForm({
              weekPrice: asText(pricing.weekPrice),
              weekendPrice: asText(pricing.weekendPrice),
              peakPrice: asText(pricing.peakPrice),
              extraGuestsPrice: asText(pricing.extraGuestsPrice),
              extraGuestsPeakPrice: asText(pricing.extraGuestsPeakPrice),
              weeklyDiscount: asText(pricing.weeklyDiscount),
              monthlyDiscount: asText(pricing.monthlyDiscount),
            });
            setError(null);
          }}
        >
          انصراف
        </Button>
        {!!error && <p className="text-12 text-[#C62828] mt-4">{error}</p>}
        {!!savedAt && !error && <p className="text-12 text-[#015046] mt-4">ذخیره شد ✓</p>}
      </Card>
    </div>
  );
}
