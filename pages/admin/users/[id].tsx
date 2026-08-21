import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";

interface UserDetail {
  id: number;
  phone: string;
  name: string | null;
  email: string | null;
  nationalCode: string | null;
  address: string | null;
  zip: string | null;
  fax: string | null;
  job: string | null;
  education: string | null;
  birthDay: number | null;
  birthMonth: number | null;
  birthYear: number | null;
  emergencyPhone: string | null;
  contactPhone: string | null;
  avatarUrl: string | null;
  nationalCardUrl: string | null;
  description: string | null;
  verificationStatus: "NOT_CONFIRMED" | "CHECKING" | "CONFIRMED";
  isHost: boolean;
  role: "USER" | "ADMIN";
  createdAt: string;
  city: { name: string; province: { name: string } | null } | null;
  bankAccount: {
    cardNumber: string | null;
    cardOwnerName: string | null;
    shabaNumber: string | null;
    shabaOwnerName: string | null;
  } | null;
  residences: { id: number; name: string; state: string }[];
  _count: { reservationsAsGuest: number; reservationsAsHost: number };
}

const VERIFICATION_OPTIONS = [
  { value: "NOT_CONFIRMED", label: "تایید نشده" },
  { value: "CHECKING", label: "در حال بررسی" },
  { value: "CONFIRMED", label: "تایید شده" },
];

export default function AdminUserDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data, mutate, isLoading } = useSWR(id ? `/api/admin/users/${id}` : null, (path: string) =>
    apiFetch<UserDetail>(path)
  );

  async function patchUser(body: object) {
    if (!id) return;
    await apiFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    mutate();
  }

  return (
    <AdminLayout>
      <h1>جزئیات کاربر</h1>
      {isLoading && <p>در حال بارگذاری...</p>}
      {data && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            {data.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.avatarUrl}
                alt=""
                width={64}
                height={64}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
            )}
            <div>
              <h2 style={{ margin: 0 }}>{data.name ?? "-"}</h2>
              <p style={{ color: "#6b7280", margin: 0 }}>{data.phone}</p>
            </div>
          </div>

          <p>ایمیل: {data.email ?? "-"}</p>
          <p>کد ملی: {data.nationalCode ?? "-"}</p>
          <p>
            شهر: {data.city?.name ?? "-"} {data.city?.province ? `- ${data.city.province.name}` : ""}
          </p>
          <p>آدرس: {data.address ?? "-"}</p>
          <p>شغل: {data.job ?? "-"}</p>
          <p>تحصیلات: {data.education ?? "-"}</p>
          <p>
            تاریخ تولد:{" "}
            {data.birthYear && data.birthMonth && data.birthDay
              ? `${data.birthDay}/${data.birthMonth}/${data.birthYear}`
              : "-"}
          </p>
          <p>تماس اضطراری: {data.emergencyPhone ?? "-"}</p>
          <p>تماس جایگزین: {data.contactPhone ?? "-"}</p>
          {data.description && <p>توضیحات: {data.description}</p>}
          <p>تاریخ عضویت: {new Date(data.createdAt).toLocaleDateString("fa-IR")}</p>

          <h3>حساب بانکی</h3>
          {data.bankAccount ? (
            <>
              <p>
                شماره کارت: {data.bankAccount.cardNumber ?? "-"} ({data.bankAccount.cardOwnerName ?? "-"})
              </p>
              <p>
                شبا: {data.bankAccount.shabaNumber ?? "-"} ({data.bankAccount.shabaOwnerName ?? "-"})
              </p>
            </>
          ) : (
            <p style={{ color: "#6b7280" }}>ثبت نشده</p>
          )}

          <h3>آمار</h3>
          <p>رزرو به‌عنوان مهمان: {data._count.reservationsAsGuest}</p>
          <p>رزرو به‌عنوان میزبان: {data._count.reservationsAsHost}</p>

          <h3>اقامتگاه‌ها ({data.residences.length})</h3>
          {data.residences.length > 0 ? (
            <ul>
              {data.residences.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/residences/${r.id}`}>{r.name}</Link> — {r.state}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "#6b7280" }}>ندارد</p>
          )}

          <h3>وضعیت</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button className="btn secondary" onClick={() => patchUser({ isHost: !data.isHost })}>
              {data.isHost ? "لغو میزبانی" : "میزبان کردن"}
            </button>
            <button
              className="btn secondary"
              onClick={() => patchUser({ role: data.role === "ADMIN" ? "USER" : "ADMIN" })}
            >
              {data.role === "ADMIN" ? "لغو نقش ادمین" : "ادمین کردن"}
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {VERIFICATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="btn secondary"
                disabled={data.verificationStatus === opt.value}
                onClick={() => patchUser({ verificationStatus: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
