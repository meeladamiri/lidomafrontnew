import { useMemo } from "react";
import useSWR from "swr";
import moment from "moment-jalaali";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Card, EmptyState, Skeleton, Stars, faNum } from "@/components/Admin/ui";
import { JALALI_MONTHS, faDigits } from "@/components/Admin/JalaliDate";

/**
 * آمار اقامتگاه.
 *
 * Reads the same service the host's own statistics page reads, so a host and
 * the ops team looking at the same listing cannot be shown different numbers.
 *
 * Two things it refuses to do:
 *
 *   • **Draw zero where it means "not measured".** Views were never recorded
 *     before the counter shipped, so the months before that are marked as not
 *     collected rather than plotted as flat zero — which reads as "nobody
 *     visited" and is a different, wrong, claim.
 *   • **Fold cancellations into rejections.** «رد شده» is the host declining;
 *     «لغو شده» is usually the guest. The old host page counted the second and
 *     labelled it the first.
 */

interface MonthPoint {
  month: string;
  nights: number;
  income: number;
  reservations: number;
  views: number;
}

interface DayPoint {
  date: string;
  nights: number;
  views: number;
}

interface Stats {
  reservations: {
    total: number;
    pending: number;
    confirmed: number;
    done: number;
    cancelled: number;
    rejected: number;
    expired: number;
    draft: number;
  };
  nights: { total: number; last_year: number; last_month: number };
  income: { total: number; monthly_average: number; last_year: number };
  reviews: {
    count: number;
    average: number;
    cleaning: number;
    location: number;
    quality: number;
    integrity: number;
    greeting: number;
    delivery: number;
    spread: Record<string, number>;
  };
  favourites: number;
  views: { last_year: number; last_month: number; tracking_since: string | null };
  monthly: MonthPoint[];
  daily: DayPoint[];
}

const money = (n: number) => n.toLocaleString("fa-IR");

/** «۱۲٫۴ م» / «۳٫۱ میلیارد» — a chart axis has no room for nine digits. */
function shortMoney(n: number): string {
  if (n >= 1_000_000_000) return faNum(Math.round(n / 100_000_000) / 10) + " میلیارد";
  if (n >= 1_000_000) return faNum(Math.round(n / 100_000) / 10) + " م";
  if (n >= 1_000) return faNum(Math.round(n / 1000)) + " هزار";
  return faNum(n);
}

/** `2026-09` → «شهریور ۱۴۰۵» */
function jalaliMonthLabel(key: string): string {
  const m = moment(key + "-15", "YYYY-MM-DD");
  return `${JALALI_MONTHS[m.jMonth()]} ${faDigits(m.jYear())}`;
}

/** `2026-09` → «شهریور» — for a crowded axis. */
function jalaliMonthShort(key: string): string {
  return JALALI_MONTHS[moment(key + "-15", "YYYY-MM-DD").jMonth()];
}

function Tile({
  label,
  value,
  hint,
  tone = "text-black",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-12 border border-gray-E5E5E6 p-14">
      <p className="text-12 leading-20 text-gray-6C6A7D">{label}</p>
      <p className={`text-20 leading-30 font-b mt-2 ${tone}`}>{value}</p>
      {!!hint && <p className="text-11 leading-18 text-gray-9B9BAA mt-2">{hint}</p>}
    </div>
  );
}

/**
 * A bar chart, in divs.
 *
 * No chart library: this draws two series over twelve or thirty points, and a
 * dependency for that is a dependency to keep patched forever. Every bar is
 * also a `title`, so a value that is too small to see is still readable.
 */
function BarChart({
  points,
  format,
  emptyText,
}: {
  points: { key: string; label: string; value: number; caption?: string }[];
  format: (n: number) => string;
  emptyText: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 0);

  if (max === 0) {
    return (
      <div className="h-[140px] flex items-center justify-center">
        <p className="text-12 leading-20 text-gray-9B9BAA">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-x-4 h-[140px]" dir="ltr">
      {points.map((p) => (
        <div key={p.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
          <span className="text-9 leading-12 text-gray-9B9BAA mb-2 whitespace-nowrap">
            {p.value > 0 ? format(p.value) : ""}
          </span>
          <div
            title={`${p.caption ?? p.label}: ${format(p.value)}`}
            style={{ height: `${Math.max(2, (p.value / max) * 100)}%` }}
            className={`w-full rounded-t-4 ${p.value > 0 ? "bg-primary-main" : "bg-gray-E5E5E6"}`}
          />
          <span className="text-9 leading-12 text-gray-9B9BAA mt-4 truncate w-full text-center">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function RatingRow({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-x-10">
      <span className="text-12 leading-20 text-gray-6C6A7D w-[92px] shrink-0">{label}</span>
      <div className="flex-1 h-6 rounded-full bg-gray-F0F0F0 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-main"
          style={{ width: `${Math.min(100, (score / 5) * 100)}%` }}
        />
      </div>
      <span className="text-12 leading-20 text-black font-m w-[28px] text-left">
        {faNum(score)}
      </span>
    </div>
  );
}

export default function StatsTab({ residenceId }: { residenceId: number }) {
  const { data, isLoading, error } = useSWR<Stats>(
    `/api/admin/residences/${residenceId}/stats`,
    (p: string) => apiFetch<Stats>(p)
  );

  const monthPoints = useMemo(
    () =>
      (data?.monthly ?? []).map((m) => ({
        key: m.month,
        label: jalaliMonthShort(m.month),
        caption: jalaliMonthLabel(m.month),
        nights: m.nights,
        income: m.income,
        views: m.views,
      })),
    [data]
  );

  const dayPoints = useMemo(
    () =>
      (data?.daily ?? []).map((d) => ({
        key: d.date,
        label: faDigits(moment(d.date, "YYYY-MM-DD").format("jD")),
        caption: faDigits(moment(d.date, "YYYY-MM-DD").format("jYYYY/jMM/jDD")),
        nights: d.nights,
        views: d.views,
      })),
    [data]
  );

  if (isLoading) return <Skeleton className="h-[420px]" />;
  if (error || !data)
    return (
      <Card>
        <EmptyState text="آمار این اقامتگاه خوانده نشد" />
      </Card>
    );

  const r = data.reservations;
  const reviewMax = Math.max(...Object.values(data.reviews.spread), 1);

  return (
    <div className="flex flex-col gap-y-16">
      {/* ---------- رزروها ---------- */}
      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-14">آمار رزرو</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10">
          <Tile label="کل درخواست‌ها" value={faNum(r.total)} />
          <Tile label="تایید شده" value={faNum(r.confirmed)} tone="text-[#2E7D32]" />
          <Tile label="قطعی شده" value={faNum(r.done)} tone="text-[#2E7D32]" />
          <Tile label="در انتظار میزبان" value={faNum(r.pending)} tone="text-[#B26A00]" />
          <Tile label="رد شده" value={faNum(r.rejected)} tone="text-[#C62828]" />
          <Tile label="لغو شده" value={faNum(r.cancelled)} tone="text-[#C62828]" />
        </div>
        {r.expired > 0 && (
          <p className="text-11 leading-18 text-gray-9B9BAA mt-10">
            {faNum(r.expired)} درخواست هم منقضی شده — مهلت پرداختشان گذشت و خودکار بسته شدند.
          </p>
        )}
        <p className="text-11 leading-18 text-gray-9B9BAA mt-8">
          «رد شده» یعنی میزبان نپذیرفته؛ «لغو شده» یعنی رزرو بعد از ثبت لغو شده — معمولاً از سمت
          مهمان. این دو یکی نیستند.
        </p>
      </Card>

      {/* ---------- شب و درآمد ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-14">شب اقامت</h3>
          <div className="grid grid-cols-3 gap-10 mb-16">
            <Tile label="کل" value={faNum(data.nights.total)} />
            <Tile label="۱۲ ماه اخیر" value={faNum(data.nights.last_year)} />
            <Tile label="۳۰ روز اخیر" value={faNum(data.nights.last_month)} />
          </div>
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">شب اقامت ماهانه</p>
          <BarChart
            points={monthPoints.map((m) => ({ ...m, value: m.nights }))}
            format={(n) => faNum(n)}
            emptyText="در ۱۲ ماه اخیر شب اقامتی ثبت نشده"
          />
        </Card>

        <Card className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-14">درآمد</h3>
          <div className="grid grid-cols-3 gap-10 mb-16">
            <Tile label="کل (سهم میزبان)" value={shortMoney(data.income.total)} hint="تومان" />
            <Tile label="۱۲ ماه اخیر" value={shortMoney(data.income.last_year)} hint="تومان" />
            <Tile
              label="میانگین ماهانه"
              value={shortMoney(data.income.monthly_average)}
              hint="فقط ماه‌هایی که درآمد داشته"
            />
          </div>
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">درآمد ماهانه</p>
          <BarChart
            points={monthPoints.map((m) => ({ ...m, value: m.income }))}
            format={shortMoney}
            emptyText="در ۱۲ ماه اخیر درآمدی ثبت نشده"
          />
        </Card>
      </div>

      {/* ---------- بازدید ---------- */}
      <Card className="p-20">
        <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
          <h3 className="text-16 leading-24 font-m text-black">بازدید صفحه</h3>
          {data.views.tracking_since ? (
            <Badge tone="gray">
              شمارش از {faDigits(moment(data.views.tracking_since, "YYYY-MM-DD").format("jYYYY/jMM/jDD"))}
            </Badge>
          ) : (
            <Badge tone="yellow">هنوز شمارشی ثبت نشده</Badge>
          )}
        </div>

        {/* Not a footnote. Somebody reading a flat line here would otherwise
            conclude the listing gets no traffic, which is a different claim
            from "nobody was counting". */}
        <div className="rounded-10 bg-[#FFF8EC] border border-[#F5D9A8] px-12 py-10 mb-14">
          <p className="text-12 leading-20 text-black">
            شمارش بازدید تازه راه افتاده. ماه‌های قبل از شروع شمارش <b>اندازه‌گیری نشده‌اند</b> — نه
            اینکه بازدید نداشته‌اند. داده‌ی بازدید قدیمی هم در دسترس نیست: آخرین چیزی که سیستم قبلی
            ثبت کرده مربوط به خرداد ۱۴۰۰ است.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          <Tile label="۳۰ روز اخیر" value={faNum(data.views.last_month)} />
          <Tile label="۱۲ ماه اخیر" value={faNum(data.views.last_year)} />
          <Tile label="افزودن به علاقه‌مندی‌ها" value={faNum(data.favourites)} />
          <Tile
            label="نظر ثبت‌شده"
            value={faNum(data.reviews.count)}
            hint={data.reviews.count > 0 ? `میانگین ${faNum(data.reviews.average)}` : undefined}
          />
        </div>

        <p className="text-12 leading-20 text-gray-6C6A7D mb-8">بازدید روزانه — ۳۰ روز اخیر</p>
        <BarChart
          points={dayPoints.map((d) => ({ ...d, value: d.views }))}
          format={(n) => faNum(n)}
          emptyText="هنوز بازدیدی شمرده نشده"
        />

        <p className="text-12 leading-20 text-gray-6C6A7D mb-8 mt-16">بازدید ماهانه</p>
        <BarChart
          points={monthPoints.map((m) => ({ ...m, value: m.views }))}
          format={(n) => faNum(n)}
          emptyText="هنوز بازدیدی شمرده نشده"
        />
      </Card>

      {/* ---------- شب روزانه ---------- */}
      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-14">شب اقامت روزانه — ۳۰ روز اخیر</h3>
        <BarChart
          points={dayPoints.map((d) => ({ ...d, value: d.nights }))}
          format={(n) => faNum(n)}
          emptyText="در ۳۰ روز اخیر شب اقامتی ثبت نشده"
        />
      </Card>

      {/* ---------- نظرات ---------- */}
      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-14">خلاصه نظرات</h3>

        {data.reviews.count === 0 ? (
          <EmptyState text="هنوز نظری برای این اقامتگاه ثبت نشده" />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_1fr] gap-16">
            <div className="rounded-12 border border-gray-E5E5E6 p-14 text-center">
              <p className="text-40 leading-56 font-b text-black">{faNum(data.reviews.average)}</p>
              <div className="flex justify-center mb-6">
                <Stars value={data.reviews.average} />
              </div>
              <p className="text-12 leading-20 text-gray-6C6A7D">
                از {faNum(data.reviews.count)} نظر
              </p>
            </div>

            <div className="rounded-12 border border-gray-E5E5E6 p-14 flex flex-col justify-center gap-y-8">
              <RatingRow label="نظافت" score={data.reviews.cleaning} />
              <RatingRow label="موقعیت مکانی" score={data.reviews.location} />
              <RatingRow label="کیفیت نسبت به نرخ" score={data.reviews.quality} />
              <RatingRow label="صحت مطالب" score={data.reviews.integrity} />
              <RatingRow label="برخورد میزبان" score={data.reviews.greeting} />
              <RatingRow label="نحوه تحویل" score={data.reviews.delivery} />
            </div>

            {/* The histogram, because an average alone hides its own shape. */}
            <div className="rounded-12 border border-gray-E5E5E6 p-14 flex flex-col justify-center gap-y-8">
              {["5", "4", "3", "2", "1"].map((star) => {
                const count = data.reviews.spread[star] ?? 0;
                return (
                  <div key={star} className="flex items-center gap-x-10">
                    <span className="text-12 leading-20 text-gray-6C6A7D w-[42px] shrink-0">
                      {faNum(Number(star))} ستاره
                    </span>
                    <div className="flex-1 h-6 rounded-full bg-gray-F0F0F0 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#FFC120]"
                        style={{ width: `${(count / reviewMax) * 100}%` }}
                      />
                    </div>
                    <span className="text-12 leading-20 text-black font-m w-[36px] text-left">
                      {faNum(count)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
