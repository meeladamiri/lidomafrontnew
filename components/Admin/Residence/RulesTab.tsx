import { useMemo, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, Select, Toggle, faNum } from "@/components/Admin/ui";

// "قوانین و مقررات" tab: the rule catalog as toggles (+ per-rule free text),
// stay limits, check-in/out times, and the cancellation policy.

export interface CatalogRule {
  id: number;
  key: string | null;
  name: string;
  category: string | null;
}

export interface ResidenceRuleRow {
  rule: { id: number };
  value: unknown;
}

export interface RulesValues {
  checkinFrom: string | null;
  checkinTo: string | null;
  checkout: string | null;
  minReservableDays: number | null;
  capacity: number | null;
  rulesDesc: string | null;
  /** The readable part of `rulesDesc`, unpacked by the server. */
  hostRulesText?: string;
  cancellationPolicy: string | null;
  extraRules: Record<string, unknown> | null;
}

// The three presets the guest-facing page renders, with the refund ladder
// shown in the design.
const POLICIES = [
  {
    key: "easy",
    label: "سهل گیرانه",
    tone: "text-[#15803D]",
    steps: [
      "تا ۷ روز قبل از ورود مهمان: ۱۰۰٪ مبلغ کل رزرو به مهمان بازگردانده می‌شود",
      "تا روز شروع اقامت: مبلغ ۱ شب اول رزرو + ۱۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
      "از روز ورود به اقامتگاه: مبلغ شب‌های سپری شده + مبلغ ۱ شب بعد + ۱۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
    ],
  },
  {
    key: "moderate",
    label: "متعادل",
    tone: "text-[#B26A00]",
    steps: [
      "تا ۱۰ روز قبل از ورود مهمان: ۱۰۰٪ مبلغ کل رزرو به مهمان بازگردانده می‌شود",
      "تا روز شروع اقامت: مبلغ ۲ شب اول رزرو + ۳۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
      "از روز ورود به اقامتگاه: مبلغ شب‌های سپری شده + مبلغ ۲ شب بعد + ۳۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
    ],
  },
  {
    key: "strict",
    label: "سخت گیرانه",
    tone: "text-[#C62828]",
    steps: [
      "تا ۱۴ روز قبل از ورود مهمان: ۱۰۰٪ مبلغ کل رزرو به مهمان بازگردانده می‌شود",
      "تا روز شروع اقامت: مبلغ ۳ شب اول رزرو + ۵۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
      "از روز ورود به اقامتگاه: مبلغ شب‌های سپری شده + مبلغ ۳ شب بعد + ۵۰٪ مبلغ شب‌های باقی مانده به میزبان واریز می‌شود",
    ],
  },
] as const;

const HOURS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

function Stepper({
  value,
  onChange,
  label,
  unit,
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  unit: string;
  min?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-x-12">
      <span className="text-13 leading-20 text-gray-6C6A7D">{label}</span>
      <span className="flex items-center gap-x-8">
        <button
          type="button"
          aria-label={`کاهش ${label}`}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-24 h-24 rounded-full border border-gray-E5E5E6 text-gray-6C6A7D hover:bg-gray-F0F0F0 leading-none"
        >
          −
        </button>
        <span className="min-w-[54px] text-center text-14 font-m text-black">
          {faNum(value)} {unit}
        </span>
        <button
          type="button"
          aria-label={`افزایش ${label}`}
          onClick={() => onChange(value + 1)}
          className="w-24 h-24 rounded-full border border-gray-E5E5E6 text-gray-6C6A7D hover:bg-gray-F0F0F0 leading-none"
        >
          +
        </button>
      </span>
    </div>
  );
}

export default function RulesTab({
  residenceId,
  rules,
  values,
  onSaved,
}: {
  residenceId: number;
  rules: ResidenceRuleRow[];
  values: RulesValues;
  onSaved: () => void;
}) {
  const { data: catalog } = useSWR<CatalogRule[]>("/api/admin/rules", (p: string) =>
    apiFetch<CatalogRule[]>(p)
  );

  // "بله"/"خیر" per rule; cancellation lives in its own field, not as a toggle.
  const initialToggles = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (const r of rules) m[r.rule.id] = String(r.value ?? "") === "بله";
    return m;
  }, [rules]);

  const [toggles, setToggles] = useState<Record<number, boolean>>(initialToggles);
  const [minNights, setMinNights] = useState(values.minReservableDays ?? 1);
  const [minGuests, setMinGuests] = useState(values.capacity ?? 1);
  const [checkinFrom, setCheckinFrom] = useState(values.checkinFrom ?? "14:00");
  const [checkout, setCheckout] = useState(values.checkout ?? "12:00");
  const [policy, setPolicy] = useState(values.cancellationPolicy ?? "easy");
  // Never `values.rulesDesc` directly: on 2,555 of the 2,557 migrated listings
  // that have it, the column holds Odoo's JSON blob, and putting that in the
  // box meant an agent saw a wall of escaped JSON — and saving wrote the wall
  // back. The server unpacks it; see the backend's `hostRules.ts`.
  const [hostRules, setHostRules] = useState(
    values.hostRulesText ?? (values.extraRules as { desc?: string })?.desc ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleRules = (catalog ?? []).filter((r) => r.key !== "cancellation");

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/rules`, {
        method: "PATCH",
        body: JSON.stringify({
          rules: toggleRules.map((r) => ({
            ruleId: r.id,
            value: toggles[r.id] ? "بله" : "خیر",
          })),
          checkinFrom,
          checkout,
          minReservableDays: minNights,
          rulesDesc: hostRules || undefined,
          cancellationPolicy: policy,
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
      <div className="flex-1 min-w-0 flex flex-col gap-y-16">
        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-14">قوانین عمومی</h3>
          <div className="flex flex-col gap-y-12">
            {toggleRules.map((r) => (
              <label key={r.id} className="flex items-center justify-between gap-x-12">
                <span className="text-13 leading-20 text-black">{r.name}</span>
                <Toggle
                  checked={!!toggles[r.id]}
                  onChange={(next) => setToggles((t) => ({ ...t, [r.id]: next }))}
                />
              </label>
            ))}
            {toggleRules.length === 0 && (
              <p className="text-13 text-gray-9B9BAA">
                کاتالوگ قوانین خالی است — از تنظیمات ← قوانین اضافه کن.
              </p>
            )}
          </div>

          <div className="mt-14">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">
              قوانین دلخواه میزبان
            </span>
            <textarea
              value={hostRules}
              onChange={(e) => setHostRules(e.target.value)}
              rows={3}
              placeholder="توضیحات"
              className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            />
          </div>
        </Card>

        <Card className="p-20 flex items-center gap-x-40 gap-y-12 flex-wrap">
          <Stepper
            label="حداقل تعداد شب رزرو"
            value={minNights}
            onChange={setMinNights}
            unit="شب"
          />
          <Stepper
            label="حداقل تعداد نفرات برای رزرو"
            value={minGuests}
            onChange={setMinGuests}
            unit="نفر"
          />
        </Card>

        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-14">ساعت ورود و خروج مهمان</h3>
          <div className="grid md:grid-cols-2 gap-12">
            <label className="block">
              <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">ساعت ورود مهمان</span>
              <Select
                value={checkinFrom}
                onChange={(e) => setCheckinFrom(e.target.value)}
                className="w-full"
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D">ساعت خروج مهمان</span>
              <Select value={checkout} onChange={(e) => setCheckout(e.target.value)} className="w-full">
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </Card>

        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-14">قوانین لغو رزرو</h3>
          <div className="grid md:grid-cols-3 gap-16">
            {POLICIES.map((p) => (
              <label
                key={p.key}
                className={`rounded-12 border p-14 cursor-pointer transition ${
                  policy === p.key
                    ? "border-primary-main bg-[#03D6BB0A]"
                    : "border-gray-E5E5E6 hover:border-gray-D2D2D7"
                }`}
              >
                <span className="flex items-center gap-x-8 mb-10">
                  <input
                    type="radio"
                    name="cancellation"
                    checked={policy === p.key}
                    onChange={() => setPolicy(p.key)}
                    className="accent-primary-main"
                  />
                  <span className={`text-14 leading-22 font-m ${p.tone}`}>{p.label}</span>
                </span>
                <ol className="flex flex-col gap-y-8">
                  {p.steps.map((s, i) => (
                    <li key={i} className="text-11 leading-18 text-gray-6C6A7D">
                      {s}
                    </li>
                  ))}
                </ol>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-12 w-[200px] shrink-0 flex flex-col gap-y-8 sticky top-[76px]">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره..." : "ویرایش قوانین"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setToggles(initialToggles);
            setMinNights(values.minReservableDays ?? 1);
            setCheckinFrom(values.checkinFrom ?? "14:00");
            setCheckout(values.checkout ?? "12:00");
            setPolicy(values.cancellationPolicy ?? "easy");
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
