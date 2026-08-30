import { useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";

/**
 * فاکتور رزرو — the printable one.
 *
 * Deliberately outside `AdminLayout`: a sidebar and a top bar are furniture
 * for navigating, and this page exists to become paper. It opens in a new tab
 * and calls `print()` once the data is in, so the button is one click rather
 * than a click and then a reminder to press Ctrl+P.
 *
 * Everything is inline and monochrome. A printed invoice goes through
 * whatever printer is in the office, and a layout that depends on background
 * colours comes out as grey boxes with grey text in it.
 */

interface Invoice {
  reference: string;
  state: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  guestsCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  websiteShare: number | null;
  vatAmount: number | null;
  guestCommission: number | null;
  hostShare: number | null;
  settledAmount: number;
  clearRemainder: number | null;
  commissionPercent: number | null;
  guestNameOverride: string | null;
  guestPhoneOverride: string | null;
  guest: { name: string | null; phone: string };
  host: { name: string | null; phone: string };
  residence: { name: string; reference: string | null; address: string | null };
}

const fa = (n: number | null | undefined) => (n ?? 0).toLocaleString("fa-IR");
const faDate = (s?: string) =>
  s ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(s)) : "—";

const STATE: Record<string, string> = {
  DRAFT: "در انتظار ثبت درخواست",
  HOST_APPROVAL: "در انتظار تایید میزبان",
  SECOND_PAYMENT: "در انتظار پرداخت مهمان",
  DONE: "قطعی",
  CANCEL: "لغو شده",
  EXPIRED: "منقضی شده",
};

export default function ReservationInvoicePage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data } = useSWR<Invoice>(
    id ? `/api/admin/reservations/${id}/invoice` : null,
    (p: string) => apiFetch<Invoice>(p)
  );

  useEffect(() => {
    // One frame after the data paints, so the dialog does not open over an
    // empty page.
    if (data) {
      const t = setTimeout(() => window.print(), 350);
      return () => clearTimeout(t);
    }
  }, [data]);

  if (!data) return <p style={{ padding: 40, fontFamily: "inherit" }}>در حال آماده‌سازی فاکتور…</p>;

  const guestName = data.guestNameOverride || data.guest.name || "—";
  const guestPhone = data.guestPhoneOverride || data.guest.phone;

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: 32, color: "#111", lineHeight: 1.9 }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 14mm; }
        }
        table { width: 100%; border-collapse: collapse; }
        td, th { padding: 7px 8px; border-bottom: 1px solid #e5e5e5; text-align: right; font-size: 13px; }
        th { font-weight: 600; }
        h1 { font-size: 20px; margin: 0 0 2px; }
        h2 { font-size: 14px; margin: 22px 0 6px; }
      `}</style>

      <div className="no-print" style={{ marginBottom: 20 }}>
        <button onClick={() => window.print()} style={{ padding: "8px 18px", cursor: "pointer" }}>
          چاپ
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>فاکتور رزرو</h1>
          <p style={{ margin: 0, fontSize: 13, color: "#555" }}>
            کد رزرو: {data.reference} · وضعیت: {STATE[data.state] ?? data.state}
          </p>
        </div>
        <div style={{ textAlign: "left", fontSize: 13, color: "#555" }}>
          <div>لیدوما تریپ</div>
          <div>تاریخ صدور: {faDate(new Date().toISOString())}</div>
        </div>
      </div>

      <h2>مشخصات اقامت</h2>
      <table>
        <tbody>
          <tr>
            <th style={{ width: 160 }}>اقامتگاه</th>
            <td>
              {data.residence.name}
              {data.residence.reference ? ` (${data.residence.reference})` : ""}
            </td>
          </tr>
          {data.residence.address && (
            <tr>
              <th>نشانی</th>
              <td>{data.residence.address}</td>
            </tr>
          )}
          <tr>
            <th>تاریخ اقامت</th>
            <td>
              {faDate(data.startDate)} تا {faDate(data.endDate)} · {fa(data.daysCount)} شب
            </td>
          </tr>
          <tr>
            <th>تعداد مهمان</th>
            <td>{fa(data.guestsCount)} نفر</td>
          </tr>
        </tbody>
      </table>

      <h2>طرفین</h2>
      <table>
        <tbody>
          <tr>
            <th style={{ width: 160 }}>مهمان</th>
            <td>
              {guestName} — {guestPhone}
            </td>
          </tr>
          <tr>
            <th>میزبان</th>
            <td>
              {data.host.name ?? "—"} — {data.host.phone}
            </td>
          </tr>
        </tbody>
      </table>

      <h2>صورتحساب</h2>
      <table>
        <tbody>
          <tr>
            <th style={{ width: 260 }}>مبلغ کل اجاره</th>
            <td>{fa(data.totalAmount)} تومان</td>
          </tr>
          {!!data.guestCommission && (
            <tr>
              <th>کارمزد مهمان</th>
              <td>{fa(data.guestCommission)} تومان</td>
            </tr>
          )}
          <tr>
            <th>جمع پرداختی مهمان</th>
            <td>{fa(data.paidAmount)} تومان</td>
          </tr>
          {data.remainingAmount > 0 && (
            <tr>
              <th>باقی‌مانده</th>
              <td>{fa(data.remainingAmount)} تومان</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>تسویه با میزبان</h2>
      <table>
        <tbody>
          <tr>
            <th style={{ width: 260 }}>
              کارمزد میزبان وبسایت
              {data.commissionPercent != null ? ` (${fa(data.commissionPercent)}٪)` : ""}
            </th>
            <td>{fa(data.websiteShare)} تومان</td>
          </tr>
          <tr>
            <th>ارزش افزوده</th>
            <td>{fa(data.vatAmount)} تومان</td>
          </tr>
          <tr>
            <th>سهم میزبان</th>
            <td>
              <b>{fa(data.hostShare)} تومان</b>
            </td>
          </tr>
          <tr>
            <th>واریز شده</th>
            <td>{fa(data.settledAmount)} تومان</td>
          </tr>
          <tr>
            <th>مانده واریز</th>
            <td>
              <b>{fa(data.clearRemainder)} تومان</b>
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 28, fontSize: 11, color: "#777" }}>
        این فاکتور از پنل مدیریت لیدوما تریپ صادر شده و مبالغ آن بر اساس آخرین وضعیت ثبت‌شده‌ی رزرو
        است.
      </p>
    </div>
  );
}
