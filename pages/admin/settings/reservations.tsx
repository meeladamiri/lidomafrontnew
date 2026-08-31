import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Card, Field, Input, Skeleton, Toggle, faNum } from "@/components/Admin/ui";

/**
 * تنظیمات رزرواسیون — the rates every booking is split by.
 *
 * The page is mostly one worked example. Percentages of percentages are easy
 * to agree to and hard to picture, and the one that catches people is VAT:
 * it is charged on the commission, not on the rent, so 10% here is 1.5% of a
 * booking rather than 10% of it. Showing the arithmetic on a real number is
 * the cheapest way to stop that being discovered from a host's invoice.
 */

interface Settings {
  commissionPercent: number;
  vatPercent: number;
  guestCommissionPercent: number;
  releaseOnStartDate: boolean;
  minSettlement: number;
  approvalWindowMinutes: number;
  paymentWindowMinutes: number;
  hostOverrides: number;
}

const SAMPLE = 5_000_000;

export default function ReservationSettingsPage() {
  const { data, isLoading, mutate } = useSWR<Settings>("/api/admin/settings/reservation", (p: string) =>
    apiFetch<Settings>(p)
  );

  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <Shell><Skeleton className="h-[420px]" /></Shell>;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
  };

  const num = (v: string) => {
    const n = Number(v.replace(/[^\d.]/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  // The same arithmetic the backend does, on one example booking.
  const commission = Math.round((SAMPLE * form.commissionPercent) / 100);
  const vat = Math.round((commission * form.vatPercent) / 100);
  const guestFee = Math.round((SAMPLE * form.guestCommissionPercent) / 100);
  const hostShare = SAMPLE - commission - vat;

  async function save() {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/settings/reservation", {
        method: "PUT",
        body: JSON.stringify({
          commissionPercent: form.commissionPercent,
          vatPercent: form.vatPercent,
          guestCommissionPercent: form.guestCommissionPercent,
          releaseOnStartDate: form.releaseOnStartDate,
          minSettlement: Math.round(form.minSettlement),
          approvalWindowMinutes: Math.max(1, Math.round(form.approvalWindowMinutes)),
          paymentWindowMinutes: Math.max(1, Math.round(form.paymentWindowMinutes)),
        }),
      });
      setSaved(true);
      mutate();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Shell>
      <div className="grid gap-16 lg:grid-cols-[1fr_360px] items-start">
        <div className="flex flex-col gap-y-16">
          <Card className="p-20">
            <h2 className="text-16 leading-24 font-m text-black mb-4">کارمزد و مالیات</h2>
            <p className="text-12 leading-20 text-gray-9B9BAA mb-16">
              این نرخ‌ها در لحظه‌ی ثبت رزرو روی همان رزرو ذخیره می‌شوند. تغییرشان روی رزروهای
              گذشته اثری ندارد — سهم میزبانی که قبلاً محاسبه شده، دست‌نخورده می‌ماند.
            </p>

            <div className="grid md:grid-cols-2 gap-14">
              <Field label="کارمزد میزبان وبسایت (٪)">
                <Input
                  inputMode="decimal"
                  value={String(form.commissionPercent)}
                  onChange={(e) => set("commissionPercent", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  از مبلغ اجاره کسر می‌شود.
                  {form.hostOverrides > 0 && (
                    <>
                      {" "}
                      <b className="text-gray-6C6A7D">
                        {faNum(form.hostOverrides)} میزبان نرخ اختصاصی دارند
                      </b>{" "}
                      و این تغییر روی آن‌ها اعمال نمی‌شود.
                    </>
                  )}
                </p>
              </Field>

              <Field label="ارزش افزوده (٪)">
                <Input
                  inputMode="decimal"
                  value={String(form.vatPercent)}
                  onChange={(e) => set("vatPercent", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  روی <b className="text-gray-6C6A7D">کارمزد</b> حساب می‌شود، نه روی کل اجاره.
                </p>
              </Field>

              <Field label="کارمزد مهمان وبسایت (٪)">
                <Input
                  inputMode="decimal"
                  value={String(form.guestCommissionPercent)}
                  onChange={(e) => set("guestCommissionPercent", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  به مبلغ پرداختی مهمان <b className="text-gray-6C6A7D">اضافه</b> می‌شود.
                </p>
              </Field>

              <Field label="حداقل مبلغ تسویه (تومان)">
                <Input
                  inputMode="numeric"
                  value={form.minSettlement.toLocaleString("fa-IR")}
                  onChange={(e) => set("minSettlement", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  کمتر از این مبلغ، میزبان نمی‌تواند درخواست تسویه بدهد.
                </p>
              </Field>
            </div>
          </Card>

          <Card className="p-20">
            <h2 className="text-16 leading-24 font-m text-black mb-4">مهلت‌ها</h2>
            <p className="text-12 leading-20 text-gray-9B9BAA mb-16">
              پس از پایان مهلت، رزرو <b>منقضی</b> می‌شود و تاریخ‌هایش دوباره برای فروش آزاد
              می‌شوند. این‌ها فقط <b>پیش‌فرض</b>‌اند — مهلت هر رزرو در صفحه‌ی جزئیات همان رزرو
              جداگانه قابل تغییر است.
            </p>

            <div className="grid md:grid-cols-2 gap-14">
              <Field label="مدت زمان تایید میزبان (دقیقه)">
                <Input
                  inputMode="numeric"
                  value={String(form.approvalWindowMinutes)}
                  onChange={(e) => set("approvalWindowMinutes", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  {describeMinutes(form.approvalWindowMinutes)} — از لحظه‌ی ثبت رزرو.
                </p>
              </Field>

              <Field label="مدت زمان پرداخت مهمان (دقیقه)">
                <Input
                  inputMode="numeric"
                  value={String(form.paymentWindowMinutes)}
                  onChange={(e) => set("paymentWindowMinutes", num(e.target.value))}
                />
                <p className="mt-6 text-11 leading-18 text-gray-9B9BAA">
                  {describeMinutes(form.paymentWindowMinutes)} — از لحظه‌ی تایید میزبان.
                </p>
              </Field>
            </div>

            <p className="mt-12 text-11 leading-18 text-gray-9B9BAA">
              اودو یک فیلد برای هر دو داشت («مهلت تایید یا پرداخت») و مقادیر واقعی‌اش ۱۲۰،
              ۶۰ و ۷۲۰ دقیقه بود.
            </p>
          </Card>

          <Card className="p-20">
            <h2 className="text-16 leading-24 font-m text-black mb-4">زمان آزادسازی سهم میزبان</h2>
            <p className="text-12 leading-20 text-gray-9B9BAA mb-14">
              سهم میزبان تا این لحظه <b>مسدود</b> است: در کیف پولش دیده می‌شود ولی قابل برداشت
              نیست، و لغو رزرو می‌تواند پسش بگیرد.
            </p>
            <label className="flex items-start gap-x-12 cursor-pointer">
              <Toggle
                checked={form.releaseOnStartDate}
                onChange={(v) => set("releaseOnStartDate", v)}
              />
              <span>
                <span className="block text-14 leading-22 text-black">
                  {form.releaseOnStartDate ? "روز شروع اقامت" : "روز پایان اقامت"}
                </span>
                <span className="block text-12 leading-20 text-gray-9B9BAA">
                  {form.releaseOnStartDate
                    ? "مهمان رسیده و رزرو دیگر منتفی نمی‌شود — همان نقطه‌ای که اودو هم انتخاب کرده بود."
                    : "پول تا خروج مهمان مسدود می‌ماند."}
                </span>
              </span>
            </label>
          </Card>

          <div className="flex items-center gap-x-12">
            <Button onClick={save} disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
            </Button>
            {saved && <span className="text-13 text-[#2E7D32]">ذخیره شد</span>}
            {!!error && <span className="text-13 text-[#C62828]">{error}</span>}
          </div>
        </div>

        <Card className="p-20 sticky top-16">
          <h3 className="text-14 leading-22 font-m text-black mb-2">یک رزرو نمونه</h3>
          <p className="text-11 leading-18 text-gray-9B9BAA mb-14">
            با نرخ‌های بالا، روی اجاره‌ی {faNum(SAMPLE)} تومان
          </p>

          <Row label="مبلغ کل اجاره" value={SAMPLE} strong />
          <Row label={`کارمزد میزبان وبسایت (${faNum(form.commissionPercent)}٪)`} value={-commission} />
          <Row label={`ارزش افزوده (${faNum(form.vatPercent)}٪ از کارمزد)`} value={-vat} />
          <div className="my-10 border-t border-dashed border-gray-E5E5E6" />
          <Row label="سهم میزبان" value={hostShare} strong tone="green" />

          <div className="mt-16 pt-14 border-t border-gray-F0F0F0">
            <Row label="مبلغ کل اجاره" value={SAMPLE} />
            <Row
              label={`کارمزد مهمان (${faNum(form.guestCommissionPercent)}٪)`}
              value={guestFee}
            />
            <Row label="پرداختی مهمان" value={SAMPLE + guestFee} strong />
          </div>

          <p className="mt-14 text-11 leading-18 text-gray-9B9BAA">
            درآمد سایت از این رزرو: <b className="text-gray-6C6A7D">{faNum(commission + guestFee)}</b>{" "}
            تومان (ارزش افزوده متعلق به سایت نیست).
          </p>
        </Card>
      </div>
    </Shell>
  );
}

function Row({
  label,
  value,
  strong,
  tone,
}: {
  label: string;
  value: number;
  strong?: boolean;
  tone?: "green";
}) {
  return (
    <div className="flex items-baseline justify-between gap-x-12 py-4">
      <span className={`text-12 leading-20 ${strong ? "text-black" : "text-gray-6C6A7D"}`}>
        {label}
      </span>
      <span
        className={`text-13 leading-20 whitespace-nowrap ${strong ? "font-m" : ""} ${
          tone === "green" ? "text-[#2E7D32]" : value < 0 ? "text-gray-6C6A7D" : "text-black"
        }`}
      >
        {/* The sign is written out rather than left as a leading "-": on an
            RTL line a minus in front of a number lands where nobody looks. */}
        {value < 0 ? "− " : ""}
        {faNum(Math.abs(value))}
      </span>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout
      title="تنظیمات رزرواسیون"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link>
          {" / "}
          <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
    >
      {children}
    </AdminLayout>
  );
}

/**
 * "۱۲۰" in a box is a number; "۲ ساعت" is a decision. The field stays in
 * minutes because that is what the backend stores, and the reading is put
 * underneath rather than converting the input — a unit that changes as you
 * type is worse than one that never does.
 */
function describeMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "—";
  if (minutes < 60) return `${faNum(minutes)} دقیقه`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours < 24) {
    return rest === 0
      ? `${faNum(hours)} ساعت`
      : `${faNum(hours)} ساعت و ${faNum(rest)} دقیقه`;
  }

  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  return restHours === 0 ? `${faNum(days)} روز` : `${faNum(days)} روز و ${faNum(restHours)} ساعت`;
}
