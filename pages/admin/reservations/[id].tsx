import { useState } from "react";
import CancelReservationModal from "@/components/Admin/CancelReservationModal";
import ReservationStatePanel from "@/components/Admin/ReservationStatePanel";
import ActivityTimeline from "@/components/Admin/ActivityTimeline";
import ReservationActions from "@/components/Admin/ReservationActions";
import ReservationCalendarPanel from "@/components/Admin/ReservationCalendarPanel";
import { useRouter } from "next/router";
import { adminImageUrl } from "@/components/Admin/ui";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";

interface Review {
  id: number;
  cleaning: number;
  location: number;
  quality: number;
  integrity: number;
  greeting: number;
  delivery: number;
  averageRating: number;
  comment: string;
  hostAnswer: string | null;
  createdAt: string;
}

interface ReservationDetail {
  id: number;
  reference: string;
  state: "HOST_APPROVAL" | "SECOND_PAYMENT" | "DONE" | "CANCEL" | "EXPIRED";
  startDate: string;
  endDate: string;
  expiryDate: string | null;
  daysCount: number;
  guestsCount: number;
  extraGuestsCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  hostShare: number | null;
  websiteShare: number | null;
  vatAmount: number | null;
  guestCommission: number | null;
  settledAmount: number;
  commissionPercent: number | null;
  vatPercent: number | null;
  guestCommissionPercent: number | null;
  voucherCode: string | null;
  cancelledBy: "HOST_CANCELLED" | "LIDOMA_CANCELLED" | "GUEST_CANCELLED" | null;
  cancelReason: string | null;
  cancelDesc: string | null;
  guestNameOverride: string | null;
  guestPhoneOverride: string | null;
  createdAt: string;
  updatedAt: string;
  guest: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  host: { id: number; name: string | null; phone: string; avatarUrl: string | null };
  residence: {
    id: number;
    name: string;
    reference: string;
    type: "BOOMGARDI" | "SUIT";
    address: string | null;
    neighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
    capacity: number | null;
    maxCapacity: number | null;
    averageRating: number;
    reviewsCount: number;
    minReservableDays: number | null;
    checkinFrom: string | null;
    checkinTo: string | null;
    checkout: string | null;
    beforeStartTime: number | null;
    fullReturnTime: number | null;
    hostShareTotalAmount: number | null;
    hostSharePastNights: number | null;
    hostShareFutureNights: number | null;
    city: { name: string; province: { name: string } | null } | null;
    images: { url: string }[];
    rules: { rule: { name: string } }[];
  };
  rooms: { room: { id: number; name: string; image: string | null } }[];
  review: Review | null;
}

const STATE_LABELS: Record<string, string> = {
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت نهایی",
  DONE: "تکمیل شده",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};
const STATE_BADGE: Record<string, string> = {
  HOST_APPROVAL: "yellow",
  SECOND_PAYMENT: "yellow",
  DONE: "green",
  CANCEL: "red",
  EXPIRED: "gray",
};
const CANCELLED_BY_LABELS: Record<string, string> = {
  HOST_CANCELLED: "میزبان",
  LIDOMA_CANCELLED: "پشتیبانی لیدوما",
  GUEST_CANCELLED: "مهمان",
};
const TYPE_LABELS: Record<string, string> = { BOOMGARDI: "بوم‌گردی", SUIT: "سوئیت" };

function Avatar({ url, name }: { url: string | null; name: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={adminImageUrl(url, 96)} alt="" width={40} height={40} style={{ borderRadius: "50%", objectFit: "cover" }} />
  ) : (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#e5e7eb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        color: "#6b7280",
      }}
    >
      {name?.[0] ?? "?"}
    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
      <span style={{ color: "#6b7280", fontSize: 13 }}>{label}</span>
      <span>{score} / 5</span>
    </div>
  );
}

export default function AdminReservationDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [showCancel, setShowCancel] = useState(false);

  const { data, mutate, isLoading } = useSWR(id ? `/api/admin/reservations/${id}` : null, (path: string) =>
    apiFetch<ReservationDetail>(path)
  );


  return (
    <AdminLayout>
      <h1>جزئیات رزرو</h1>
      {isLoading && <p>در حال بارگذاری...</p>}

      {data && (
        <CancelReservationModal
          reservationId={data.id}
          reference={data.reference}
          open={showCancel}
          onClose={() => setShowCancel(false)}
          onCancelled={() => mutate()}
        />
      )}
      {data && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>{data.reference}</h2>
                  <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 13 }}>
                    ثبت‌شده: {data.createdAt.slice(0, 10)} · آخرین تغییر: {data.updatedAt.slice(0, 10)}
                  </p>
                </div>
                <span className={`badge ${STATE_BADGE[data.state] ?? "gray"}`}>
                  {STATE_LABELS[data.state] ?? data.state}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <h3>مهمان</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar url={data.guest.avatarUrl} name={data.guest.name} />
                    <div>
                      <Link href={`/admin/users/${data.guest.id}`}>{data.guest.name ?? "-"}</Link>
                      <p style={{ margin: 0 }}>
                        <a href={`tel:${data.guestPhoneOverride || data.guest.phone}`}>
                          {data.guestPhoneOverride || data.guest.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                  {data.guestNameOverride && (
                    <p style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>
                      رزرو برای شخص دیگر: {data.guestNameOverride}
                    </p>
                  )}
                </div>
                <div>
                  <h3>میزبان</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar url={data.host.avatarUrl} name={data.host.name} />
                    <div>
                      <Link href={`/admin/users/${data.host.id}`}>{data.host.name ?? "-"}</Link>
                      <p style={{ margin: 0 }}>
                        <a href={`tel:${data.host.phone}`}>{data.host.phone}</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0 }}>اقامتگاه</h3>
              <div style={{ display: "flex", gap: 16 }}>
                {data.residence.images[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={adminImageUrl(data.residence.images[0].url, 320)}
                    alt=""
                    style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 8, flexShrink: 0 }}
                  />
                )}
                <div>
                  <Link href={`/admin/residences/${data.residence.id}`}>{data.residence.name}</Link>{" "}
                  <span style={{ color: "#6b7280" }}>
                    ({data.residence.reference} · {TYPE_LABELS[data.residence.type]})
                  </span>
                  <p style={{ color: "#6b7280", margin: "4px 0" }}>
                    {data.residence.city?.name ?? "-"}
                    {data.residence.city?.province ? ` - ${data.residence.city.province.name}` : ""}
                    {data.residence.neighborhood ? ` — ${data.residence.neighborhood}` : ""}
                    {data.residence.address ? ` — ${data.residence.address}` : ""}
                  </p>
                  <p style={{ margin: 0, fontSize: 13 }}>
                    ظرفیت: {data.residence.capacity ?? "-"} (حداکثر {data.residence.maxCapacity ?? "-"}) · امتیاز:{" "}
                    {data.residence.averageRating.toFixed(1)} ({data.residence.reviewsCount.toLocaleString("fa-IR")}{" "}
                    نظر)
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13 }}>
                    ورود از {data.residence.checkinFrom ?? "-"} تا {data.residence.checkinTo ?? "-"} · خروج تا{" "}
                    {data.residence.checkout ?? "-"} · حداقل اقامت: {data.residence.minReservableDays ?? "-"} شب
                  </p>
                </div>
              </div>

              {data.residence.rules.length > 0 && (
                <p style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                  قوانین: {data.residence.rules.map((r) => r.rule.name).join("، ")}
                </p>
              )}

              {data.rooms.length > 0 && (
                <>
                  <h4 style={{ marginBottom: 8 }}>اتاق‌های رزروشده</h4>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {data.rooms.map((r) => (
                      <div key={r.room.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {r.room.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={adminImageUrl(r.room.image, 96)}
                            alt=""
                            style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }}
                          />
                        )}
                        <span>{r.room.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0 }}>تاریخ و ظرفیت</h3>
              <p>
                {data.startDate.slice(0, 10)} تا {data.endDate.slice(0, 10)} (
                {data.daysCount.toLocaleString("fa-IR")} شب)
              </p>
              <p>
                {data.guestsCount.toLocaleString("fa-IR")} نفر
                {data.extraGuestsCount > 0 && ` (+${data.extraGuestsCount.toLocaleString("fa-IR")} نفر اضافه)`}
              </p>
              {data.expiryDate && <p>مهلت پرداخت/تایید: {data.expiryDate.slice(0, 10)}</p>}
            </div>

            {data.state === "CANCEL" && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0 }}>اطلاعات لغو</h3>
                <p>لغوکننده: {(data.cancelledBy && CANCELLED_BY_LABELS[data.cancelledBy]) ?? "-"}</p>
                {data.cancelReason && <p>دلیل: {data.cancelReason}</p>}
                {data.cancelDesc && <p>توضیح: {data.cancelDesc}</p>}
              </div>
            )}

            {data.review && (
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ marginTop: 0 }}>
                  نظر مهمان — {data.review.averageRating.toFixed(1)} / ۵
                </h3>
                <p>{data.review.comment}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px", marginTop: 8 }}>
                  <ScoreRow label="نظافت" score={data.review.cleaning} />
                  <ScoreRow label="موقعیت مکانی" score={data.review.location} />
                  <ScoreRow label="کیفیت نسبت به نرخ" score={data.review.quality} />
                  <ScoreRow label="صحت مطالب" score={data.review.integrity} />
                  <ScoreRow label="برخورد میزبان" score={data.review.greeting} />
                  <ScoreRow label="نحوه تحویل" score={data.review.delivery} />
                </div>
                {data.review.hostAnswer && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      background: "#f9fafb",
                      borderRadius: 8,
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>پاسخ میزبان:</p>
                    <p style={{ margin: "4px 0 0" }}>{data.review.hostAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <h3 style={{ marginTop: 0 }}>مبلغ</h3>

              {/* The split, in the order the money actually moves: what the
                  stay costs, what the guest pays for it, what the site keeps,
                  and what is left for the host. Percentages are the ones this
                  booking was made under, not today's — they are stored on the
                  reservation for exactly that reason. */}
              <MoneyRow label="مبلغ کل اجاره" value={data.totalAmount} strong />
              <MoneyRow label="جمع مبلغ پرداختی مهمان" value={data.paidAmount} />
              {data.remainingAmount > 0 && (
                <MoneyRow label="باقی‌مانده پرداخت مهمان" value={data.remainingAmount} tone="red" />
              )}

              <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />

              <MoneyRow
                label="کارمزد میزبان وبسایت"
                hint={data.commissionPercent != null ? `${data.commissionPercent.toLocaleString("fa-IR")}٪ از اجاره` : undefined}
                value={data.websiteShare}
                negative
              />
              <MoneyRow
                label="کارمزد مهمان وبسایت"
                hint={
                  data.guestCommissionPercent != null
                    ? `${data.guestCommissionPercent.toLocaleString("fa-IR")}٪، افزوده به پرداختی مهمان`
                    : undefined
                }
                value={data.guestCommission}
              />
              <MoneyRow
                label="ارزش افزوده"
                hint={data.vatPercent != null ? `${data.vatPercent.toLocaleString("fa-IR")}٪ از کارمزد` : undefined}
                value={data.vatAmount}
                negative
              />

              <div style={{ height: 1, background: "#eee", margin: "10px 0" }} />

              <MoneyRow label="مقدار اصلی سهم میزبان بابت کل رزرو" value={data.hostShare} strong />
              <MoneyRow label="واریز شده به میزبان" value={data.settledAmount} />
              <MoneyRow
                label="مقدار مانده سهم میزبان بابت واریزی سایت"
                value={(data.hostShare ?? 0) - data.settledAmount}
                strong
                tone={(data.hostShare ?? 0) - data.settledAmount > 0 ? "red" : "green"}
              />

              {data.voucherCode && <p>کد تخفیف: {data.voucherCode}</p>}
              {(data.residence.hostShareTotalAmount != null ||
                data.residence.hostSharePastNights != null ||
                data.residence.hostShareFutureNights != null) && (
                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  سیاست تسویه‌ی اقامتگاه: کل {data.residence.hostShareTotalAmount ?? "-"}٪ · شب‌های گذشته{" "}
                  {data.residence.hostSharePastNights ?? "-"}٪ · شب‌های آینده {data.residence.hostShareFutureNights ?? "-"}٪
                </p>
              )}
            </div>

            {(data.state === "HOST_APPROVAL" || data.state === "SECOND_PAYMENT") && (
              <ExpiryCard
                id={data.id}
                state={data.state}
                expiryDate={data.expiryDate}
                onChanged={() => mutate()}
              />
            )}

            <ReservationCalendarPanel
              reservationId={data.id}
              reference={data.reference}
              residenceId={data.residence.id}
              startDate={data.startDate}
              endDate={data.endDate}
              onRepriced={() => mutate()}
            />

            <ReservationStatePanel reservationId={data.id} onChanged={() => mutate()} />

            <div style={{ marginBottom: 20 }}>
              <ActivityTimeline reservationId={data.id} />
            </div>

            <ReservationActions
              reservationId={data.id}
              residenceId={data.residence.id}
              canCancel={data.state !== "CANCEL" && data.state !== "EXPIRED"}
              onCancel={() => setShowCancel(true)}
              onActed={() => mutate()}
            />          </div>
        </div>
      )}
    </AdminLayout>
  );
}

/**
 * One line of the money breakdown.
 *
 * A missing figure prints "ثبت نشده" rather than zero. Bookings migrated from
 * Odoo have no guest fee at all, and a zero there would read as "we charged
 * nothing" instead of "nobody recorded it".
 */
function MoneyRow({
  label,
  value,
  hint,
  strong,
  negative,
  tone,
}: {
  label: string;
  value: number | null;
  hint?: string;
  strong?: boolean;
  negative?: boolean;
  tone?: "red" | "green";
}) {
  const color = tone === "red" ? "#C62828" : tone === "green" ? "#2E7D32" : strong ? "#111" : "#374151";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        padding: "3px 0",
      }}
    >
      <span style={{ fontSize: 13, color: "#6b7280" }}>
        {label}
        {hint && <span style={{ fontSize: 11, color: "#9ca3af" }}> · {hint}</span>}
      </span>
      <span
        style={{
          fontSize: 14,
          whiteSpace: "nowrap",
          color,
          fontWeight: strong ? 600 : 400,
        }}
      >
        {value == null ? (
          <span style={{ color: "#9ca3af" }}>ثبت نشده</span>
        ) : (
          <>
            {/* Written-out sign: on an RTL line a leading "−" lands where
                nobody is looking for it. */}
            {negative && value > 0 ? "− " : ""}
            {Math.abs(value).toLocaleString("fa-IR")} تومان
          </>
        )}
      </span>
    </div>
  );
}

/**
 * مهلت این رزرو.
 *
 * The site-wide window sets the deadline when a booking is made; this moves it
 * for one booking. Support needs it for the case the whole feature exists
 * for — a host who has just called to say they are on their way, or a guest
 * whose bank transfer is stuck — and the alternative today is watching the
 * booking expire and taking a new one.
 *
 * Two ways to say the same thing, because those are the two ways people ask:
 * a quick "another hour", or an exact time.
 */
function ExpiryCard({
  id,
  state,
  expiryDate,
  onChanged,
}: {
  id: number;
  state: "HOST_APPROVAL" | "SECOND_PAYMENT";
  expiryDate: string | null;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exact, setExact] = useState("");

  const left = expiryDate ? Math.round((new Date(expiryDate).getTime() - Date.now()) / 60000) : null;
  const overdue = left != null && left <= 0;

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${id}/expiry`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setExact("");
      onChanged();
    } catch (e: any) {
      setError(e?.message || "تغییر مهلت انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>
        مهلت {state === "HOST_APPROVAL" ? "تایید میزبان" : "پرداخت مهمان"}
      </h3>

      {expiryDate ? (
        <p style={{ margin: "0 0 10px", fontSize: 13 }}>
          {new Date(expiryDate).toLocaleString("fa-IR", { dateStyle: "short", timeStyle: "short" })}
          {" — "}
          <span style={{ color: overdue ? "#C62828" : "#6b7280" }}>
            {overdue
              ? "گذشته؛ در اجرای بعدی زمان‌بند منقضی می‌شود"
              : `${left!.toLocaleString("fa-IR")} دقیقه باقی مانده`}
          </span>
        </p>
      ) : (
        <p style={{ margin: "0 0 10px", fontSize: 13, color: "#6b7280" }}>
          {/* Every booking made before deadlines existed has none, and without
              one the sweep leaves it alone — so it waits forever rather than
              expiring silently. */}
          مهلتی ثبت نشده — این رزرو خودبه‌خود منقضی نمی‌شود.
        </p>
      )}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {[30, 60, 120, 720].map((m) => (
          <button
            key={m}
            className="btn secondary"
            disabled={busy}
            onClick={() => send({ minutesFromNow: m })}
          >
            {m < 60 ? `${m.toLocaleString("fa-IR")} دقیقه` : `${(m / 60).toLocaleString("fa-IR")} ساعت`}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="datetime-local"
          value={exact}
          onChange={(e) => setExact(e.target.value)}
          style={{ flex: 1, minWidth: 180 }}
        />
        <button
          className="btn secondary"
          disabled={busy || !exact}
          onClick={() => send({ expiryDate: new Date(exact).toISOString() })}
        >
          ثبت
        </button>
      </div>

      {!!error && <p style={{ color: "#C62828", fontSize: 13, marginBottom: 0 }}>{error}</p>}
    </div>
  );
}
