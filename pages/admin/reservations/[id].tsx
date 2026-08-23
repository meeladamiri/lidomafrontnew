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

  const { data, mutate, isLoading } = useSWR(id ? `/api/admin/reservations/${id}` : null, (path: string) =>
    apiFetch<ReservationDetail>(path)
  );

  async function runAction(action: "cancel" | "forceApprove" | "markDone") {
    if (!id) return;

    let reason: string | undefined;
    let desc: string | undefined;
    if (action === "cancel") {
      reason = prompt("دلیل لغو رزرو (برای مهمان/میزبان نمایش داده می‌شود):") || undefined;
      if (reason === undefined) return; // user pressed cancel on the prompt
      desc = prompt("توضیح داخلی (اختیاری، فقط برای تیم پشتیبانی):") || undefined;
    } else if (!confirm("انجام این عملیات مطمئنید؟")) {
      return;
    }

    try {
      await apiFetch(`/api/admin/reservations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action, reason, desc }),
      });
      mutate();
    } catch (e: any) {
      alert(e?.message || "خطا در انجام عملیات");
    }
  }

  return (
    <AdminLayout>
      <h1>جزئیات رزرو</h1>
      {isLoading && <p>در حال بارگذاری...</p>}
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
              <p>مبلغ کل: {data.totalAmount.toLocaleString("fa-IR")} تومان</p>
              <p>پرداخت‌شده: {data.paidAmount.toLocaleString("fa-IR")} تومان</p>
              <p>باقی‌مانده: {data.remainingAmount.toLocaleString("fa-IR")} تومان</p>
              {data.hostShare != null && <p>سهم میزبان: {data.hostShare.toLocaleString("fa-IR")} تومان</p>}
              {data.websiteShare != null && <p>سهم لیدوما: {data.websiteShare.toLocaleString("fa-IR")} تومان</p>}
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

            <div className="card">
              <h3 style={{ marginTop: 0 }}>عملیات</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.state === "HOST_APPROVAL" && (
                  <button className="btn secondary" onClick={() => runAction("forceApprove")}>
                    تایید به‌جای میزبان
                  </button>
                )}
                {data.state === "SECOND_PAYMENT" && (
                  <button className="btn secondary" onClick={() => runAction("markDone")}>
                    تکمیل دستی (تایید پرداخت)
                  </button>
                )}
                {(data.state === "HOST_APPROVAL" || data.state === "SECOND_PAYMENT") && (
                  <button className="btn secondary" onClick={() => runAction("cancel")}>
                    لغو رزرو
                  </button>
                )}
                {(data.state === "DONE" || data.state === "CANCEL" || data.state === "EXPIRED") && (
                  <p style={{ color: "#6b7280" }}>این رزرو در وضعیت نهایی است — عملیاتی در دسترس نیست.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
