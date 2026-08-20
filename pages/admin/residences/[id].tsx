import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";

interface ResidenceDetail {
  id: number;
  name: string;
  description: string | null;
  state: string;
  reference: string;
  weekPrice: number | null;
  weekendPrice: number | null;
  maxCapacity: number | null;
  host: { name: string | null; phone: string };
  city: { name: string; province: { name: string } | null } | null;
  images: { url: string }[];
  rooms: { id: number; name: string }[];
}

const STATE_OPTIONS = [
  { value: "PENDING", label: "در انتظار بررسی" },
  { value: "PUBLISHED", label: "تایید و انتشار" },
  { value: "REJECTED", label: "رد کردن" },
  { value: "DEACTIVATED", label: "غیرفعال کردن" },
  { value: "DELETED", label: "حذف" },
];

export default function AdminResidenceDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const { data, mutate, isLoading } = useSWR(
    id ? `/api/admin/residences/${id}` : null,
    (path: string) => apiFetch<ResidenceDetail>(path)
  );

  async function changeState(state: string) {
    if (!id) return;
    if (!confirm("وضعیت این اقامتگاه تغییر کند؟")) return;
    await apiFetch(`/api/admin/residences/${id}/state`, {
      method: "PATCH",
      body: JSON.stringify({ state }),
    });
    mutate();
  }

  return (
    <AdminLayout>
      <h1>جزئیات اقامتگاه</h1>
      {isLoading && <p>در حال بارگذاری...</p>}
      {data && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>{data.name}</h2>
          <p style={{ color: "#6b7280" }}>کد: {data.reference}</p>
          <p>
            میزبان: {data.host.name ?? "-"} ({data.host.phone})
          </p>
          <p>
            شهر: {data.city?.name ?? "-"} {data.city?.province ? `- ${data.city.province.name}` : ""}
          </p>
          <p>قیمت هفته: {data.weekPrice?.toLocaleString("fa-IR") ?? "-"} تومان</p>
          <p>ظرفیت: {data.maxCapacity ?? "-"} نفر</p>
          <p>تعداد اتاق‌ها: {data.rooms.length}</p>
          {data.description && <p>{data.description}</p>}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {STATE_OPTIONS.map((opt) => (
              <button key={opt.value} className="btn secondary" onClick={() => changeState(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
