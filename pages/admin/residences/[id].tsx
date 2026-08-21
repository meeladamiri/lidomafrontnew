import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";

interface Image {
  id: number;
  url: string;
  title: string | null;
  sortOrder: number;
  isMain: boolean;
}
interface Room {
  id: number;
  name: string;
  description: string | null;
  capacity: number | null;
  maxCapacity: number | null;
  singleBed: number;
  doubleBed: number;
  traditionalBed: number;
  weekPrice: number | null;
  weekendPrice: number | null;
  peakPrice: number | null;
}
interface Amenity {
  id: number;
  category: string | null;
  name: string;
}
interface Rule {
  id: number;
  category: string | null;
  name: string;
}
interface ResidenceDetail {
  id: number;
  reference: string;
  state: string;
  name: string;
  name2: string | null;
  description: string | null;
  type: "BOOMGARDI" | "SUIT";
  region: string | null;
  rentType: string | null;
  address: string | null;
  neighborhood: string | null;
  floor: string | null;
  foundationArea: number | null;
  totalArea: number | null;
  capacity: number | null;
  maxCapacity: number | null;
  checkinFrom: string | null;
  checkinTo: string | null;
  checkout: string | null;
  minReservableDays: number | null;
  rulesDesc: string | null;
  cancellationPolicy: string | null;
  cancellationPolicyDesc: string | null;
  weekPrice: number | null;
  weekendPrice: number | null;
  peakPrice: number | null;
  extraPrice: number | null;
  extraGuestsPrice: number | null;
  weeklyDiscount: number | null;
  monthlyDiscount: number | null;
  host: { id: number; name: string | null; phone: string };
  city: { name: string; province: { name: string } | null } | null;
  images: Image[];
  rooms: Room[];
  amenities: { amenityId: number; amenity: Amenity }[];
  rules: { ruleId: number; rule: Rule }[];
}

const STATE_OPTIONS = [
  { value: "PENDING", label: "در انتظار بررسی" },
  { value: "PUBLISHED", label: "تایید و انتشار" },
  { value: "REJECTED", label: "رد کردن" },
  { value: "DEACTIVATED", label: "غیرفعال کردن" },
  { value: "DELETED", label: "حذف" },
];

const TABS = [
  { key: "general", label: "کلی" },
  { key: "pricing", label: "قیمت‌گذاری" },
  { key: "images", label: "تصاویر" },
  { key: "rooms", label: "اتاق‌ها" },
  { key: "amenities", label: "امکانات" },
  { key: "rules", label: "قوانین" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}

export default function AdminResidenceDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  const [tab, setTab] = useState<TabKey>("general");

  const { data, mutate, isLoading } = useSWR(
    id ? `/api/admin/residences/${id}` : null,
    (path: string) => apiFetch<ResidenceDetail>(path)
  );

  async function changeState(state: string) {
    if (!id) return;
    if (!confirm("وضعیت این اقامتگاه تغییر کند؟")) return;
    await apiFetch(`/api/admin/residences/${id}/state`, { method: "PATCH", body: JSON.stringify({ state }) });
    mutate();
  }

  async function save(path: string, body: object) {
    if (!id) return;
    try {
      await apiFetch(`/api/admin/residences/${id}${path}`, { method: "PATCH", body: JSON.stringify(body) });
      mutate();
      alert("ذخیره شد");
    } catch (e: any) {
      alert(e?.message || "خطا در ذخیره‌سازی");
    }
  }

  return (
    <AdminLayout>
      <h1>جزئیات اقامتگاه</h1>
      {isLoading && <p>در حال بارگذاری...</p>}
      {data && (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0 }}>{data.name}</h2>
                <p style={{ color: "#6b7280", margin: "4px 0" }}>
                  کد: {data.reference} · میزبان: {data.host.name ?? "-"} ({data.host.phone}) · شهر:{" "}
                  {data.city?.name ?? "-"} {data.city?.province ? `- ${data.city.province.name}` : ""}
                </p>
              </div>
              <span className="badge gray">{data.state}</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {STATE_OPTIONS.map((opt) => (
                <button key={opt.value} className="btn secondary" onClick={() => changeState(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e5e7eb" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`btn ${tab === t.key ? "" : "secondary"}`}
                style={{ borderRadius: "8px 8px 0 0" }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "general" && <GeneralTab data={data} onSave={(body) => save("", body)} />}
          {tab === "pricing" && <PricingTab data={data} onSave={(body) => save("/pricing", body)} />}
          {tab === "images" && <ImagesTab residenceId={data.id} images={data.images} onChanged={mutate} />}
          {tab === "rooms" && <RoomsTab residenceId={data.id} rooms={data.rooms} onChanged={mutate} />}
          {tab === "amenities" && (
            <AmenitiesTab residenceId={data.id} selected={data.amenities} onChanged={mutate} />
          )}
          {tab === "rules" && <RulesTab data={data} onChanged={mutate} />}
        </>
      )}
    </AdminLayout>
  );
}

function GeneralTab({ data, onSave }: { data: ResidenceDetail; onSave: (body: object) => void }) {
  const [form, setForm] = useState({
    name: data.name,
    name2: data.name2 ?? "",
    description: data.description ?? "",
    address: data.address ?? "",
    neighborhood: data.neighborhood ?? "",
    floor: data.floor ?? "",
    foundationArea: data.foundationArea ?? "",
    totalArea: data.totalArea ?? "",
    capacity: data.capacity ?? "",
    maxCapacity: data.maxCapacity ?? "",
    checkinFrom: data.checkinFrom ?? "",
    checkout: data.checkout ?? "",
    minReservableDays: data.minReservableDays ?? "",
    rulesDesc: data.rulesDesc ?? "",
    cancellationPolicyDesc: data.cancellationPolicyDesc ?? "",
  });
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="card">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="نام">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="نام دوم">
          <input value={form.name2} onChange={(e) => set("name2", e.target.value)} />
        </Field>
        <Field label="آدرس">
          <input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
        <Field label="محله">
          <input value={form.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />
        </Field>
        <Field label="طبقه">
          <input value={form.floor} onChange={(e) => set("floor", e.target.value)} />
        </Field>
        <Field label="متراژ زیربنا">
          <input type="number" value={form.foundationArea} onChange={(e) => set("foundationArea", e.target.value)} />
        </Field>
        <Field label="متراژ کل">
          <input type="number" value={form.totalArea} onChange={(e) => set("totalArea", e.target.value)} />
        </Field>
        <Field label="ظرفیت">
          <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </Field>
        <Field label="حداکثر ظرفیت">
          <input type="number" value={form.maxCapacity} onChange={(e) => set("maxCapacity", e.target.value)} />
        </Field>
        <Field label="ساعت ورود">
          <input value={form.checkinFrom} onChange={(e) => set("checkinFrom", e.target.value)} placeholder="14:00" />
        </Field>
        <Field label="ساعت خروج">
          <input value={form.checkout} onChange={(e) => set("checkout", e.target.value)} placeholder="12:00" />
        </Field>
        <Field label="حداقل شب اقامت">
          <input
            type="number"
            value={form.minReservableDays}
            onChange={(e) => set("minReservableDays", e.target.value)}
          />
        </Field>
      </div>
      <Field label="توضیحات">
        <textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <Field label="قوانین اضافه (متن آزاد)">
        <textarea rows={2} value={form.rulesDesc} onChange={(e) => set("rulesDesc", e.target.value)} />
      </Field>
      <Field label="توضیح سیاست لغو">
        <textarea
          rows={2}
          value={form.cancellationPolicyDesc}
          onChange={(e) => set("cancellationPolicyDesc", e.target.value)}
        />
      </Field>
      <button
        className="btn"
        onClick={() =>
          onSave({
            ...form,
            foundationArea: form.foundationArea === "" ? undefined : Number(form.foundationArea),
            totalArea: form.totalArea === "" ? undefined : Number(form.totalArea),
            capacity: form.capacity === "" ? undefined : Number(form.capacity),
            maxCapacity: form.maxCapacity === "" ? undefined : Number(form.maxCapacity),
            minReservableDays: form.minReservableDays === "" ? undefined : Number(form.minReservableDays),
          })
        }
      >
        ذخیره
      </button>
    </div>
  );
}

function PricingTab({ data, onSave }: { data: ResidenceDetail; onSave: (body: object) => void }) {
  const [form, setForm] = useState({
    weekPrice: data.weekPrice ?? "",
    weekendPrice: data.weekendPrice ?? "",
    peakPrice: data.peakPrice ?? "",
    extraPrice: data.extraPrice ?? "",
    extraGuestsPrice: data.extraGuestsPrice ?? "",
    weeklyDiscount: data.weeklyDiscount ?? "",
    monthlyDiscount: data.monthlyDiscount ?? "",
  });
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="card">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="قیمت هفته (تومان)">
          <input type="number" value={form.weekPrice} onChange={(e) => set("weekPrice", e.target.value)} />
        </Field>
        <Field label="قیمت آخر هفته">
          <input type="number" value={form.weekendPrice} onChange={(e) => set("weekendPrice", e.target.value)} />
        </Field>
        <Field label="قیمت اوج">
          <input type="number" value={form.peakPrice} onChange={(e) => set("peakPrice", e.target.value)} />
        </Field>
        <Field label="قیمت نفر اضافه">
          <input type="number" value={form.extraPrice} onChange={(e) => set("extraPrice", e.target.value)} />
        </Field>
        <Field label="قیمت مهمان اضافه">
          <input
            type="number"
            value={form.extraGuestsPrice}
            onChange={(e) => set("extraGuestsPrice", e.target.value)}
          />
        </Field>
        <Field label="تخفیف هفتگی (%)">
          <input type="number" value={form.weeklyDiscount} onChange={(e) => set("weeklyDiscount", e.target.value)} />
        </Field>
        <Field label="تخفیف ماهانه (%)">
          <input
            type="number"
            value={form.monthlyDiscount}
            onChange={(e) => set("monthlyDiscount", e.target.value)}
          />
        </Field>
      </div>
      <button
        className="btn"
        onClick={() =>
          onSave(
            Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v === "" ? undefined : Number(v)]))
          )
        }
      >
        ذخیره
      </button>
    </div>
  );
}

function ImagesTab({
  residenceId,
  images,
  onChanged,
}: {
  residenceId: number;
  images: Image[];
  onChanged: () => void;
}) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  async function upload(file: File) {
    const form = new FormData();
    form.append("image", file);
    await apiFetch(`/api/admin/residences/${residenceId}/images`, { method: "POST", body: form });
    onChanged();
  }

  async function remove(imageId: number) {
    if (!confirm("این تصویر حذف بشه؟")) return;
    await apiFetch(`/api/admin/residences/${residenceId}/images/${imageId}`, { method: "DELETE" });
    onChanged();
  }

  async function move(index: number, dir: -1 | 1) {
    const ids = sorted.map((i) => i.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await apiFetch(`/api/admin/residences/${residenceId}/images/order`, {
      method: "POST",
      body: JSON.stringify({ imageIds: ids }),
    });
    onChanged();
  }

  return (
    <div className="card">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
        style={{ marginBottom: 16 }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
        {sorted.map((img, i) => (
          <div key={img.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ height: 100, background: `url(${img.url}) center/cover` }} />
            <div style={{ padding: 8, display: "flex", justifyContent: "space-between" }}>
              {img.isMain && <span className="badge green">اصلی</span>}
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn secondary" onClick={() => move(i, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button className="btn secondary" onClick={() => move(i, 1)} disabled={i === sorted.length - 1}>
                  ↓
                </button>
                <button className="btn secondary" onClick={() => remove(img.id)} style={{ color: "#ef4444" }}>
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoomsTab({ residenceId, rooms, onChanged }: { residenceId: number; rooms: Room[]; onChanged: () => void }) {
  async function addRoom() {
    const name = prompt("اسم اتاق:");
    if (!name) return;
    await apiFetch(`/api/admin/residences/${residenceId}/rooms`, { method: "POST", body: JSON.stringify({ name }) });
    onChanged();
  }

  async function updateRoom(roomId: number, patch: object) {
    await apiFetch(`/api/admin/rooms/${roomId}`, { method: "PATCH", body: JSON.stringify(patch) });
    onChanged();
  }

  async function deleteRoom(roomId: number) {
    if (!confirm("این اتاق حذف بشه؟")) return;
    await apiFetch(`/api/admin/rooms/${roomId}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <div className="card">
      <button className="btn secondary" onClick={addRoom} style={{ marginBottom: 16 }}>
        + افزودن اتاق
      </button>
      {rooms.map((r) => (
        <RoomRow key={r.id} room={r} onSave={(patch) => updateRoom(r.id, patch)} onDelete={() => deleteRoom(r.id)} />
      ))}
      {rooms.length === 0 && <p style={{ color: "#6b7280" }}>اتاقی ثبت نشده</p>}
    </div>
  );
}

function RoomRow({ room, onSave, onDelete }: { room: Room; onSave: (patch: object) => void; onDelete: () => void }) {
  const [form, setForm] = useState({
    name: room.name,
    description: room.description ?? "",
    capacity: room.capacity ?? "",
    maxCapacity: room.maxCapacity ?? "",
    singleBed: room.singleBed,
    doubleBed: room.doubleBed,
    traditionalBed: room.traditionalBed,
    weekPrice: room.weekPrice ?? "",
    weekendPrice: room.weekendPrice ?? "",
    peakPrice: room.peakPrice ?? "",
  });
  const set = (k: string, v: string | number) => setForm({ ...form, [k]: v });

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <Field label="نام">
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="ظرفیت">
          <input type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </Field>
        <Field label="حداکثر ظرفیت">
          <input type="number" value={form.maxCapacity} onChange={(e) => set("maxCapacity", e.target.value)} />
        </Field>
        <Field label="تخت یک‌نفره">
          <input type="number" value={form.singleBed} onChange={(e) => set("singleBed", Number(e.target.value))} />
        </Field>
        <Field label="تخت دونفره">
          <input type="number" value={form.doubleBed} onChange={(e) => set("doubleBed", Number(e.target.value))} />
        </Field>
        <Field label="تخت سنتی">
          <input
            type="number"
            value={form.traditionalBed}
            onChange={(e) => set("traditionalBed", Number(e.target.value))}
          />
        </Field>
        <Field label="قیمت هفته">
          <input type="number" value={form.weekPrice} onChange={(e) => set("weekPrice", e.target.value)} />
        </Field>
        <Field label="قیمت آخر هفته">
          <input type="number" value={form.weekendPrice} onChange={(e) => set("weekendPrice", e.target.value)} />
        </Field>
        <Field label="قیمت اوج">
          <input type="number" value={form.peakPrice} onChange={(e) => set("peakPrice", e.target.value)} />
        </Field>
      </div>
      <Field label="توضیحات">
        <textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn secondary"
          onClick={() =>
            onSave({
              ...form,
              capacity: form.capacity === "" ? undefined : Number(form.capacity),
              maxCapacity: form.maxCapacity === "" ? undefined : Number(form.maxCapacity),
              weekPrice: form.weekPrice === "" ? undefined : Number(form.weekPrice),
              weekendPrice: form.weekendPrice === "" ? undefined : Number(form.weekendPrice),
              peakPrice: form.peakPrice === "" ? undefined : Number(form.peakPrice),
            })
          }
        >
          ذخیره
        </button>
        <button className="btn secondary" onClick={onDelete} style={{ color: "#ef4444" }}>
          حذف اتاق
        </button>
      </div>
    </div>
  );
}

function AmenitiesTab({
  residenceId,
  selected,
  onChanged,
}: {
  residenceId: number;
  selected: { amenityId: number; amenity: Amenity }[];
  onChanged: () => void;
}) {
  const { data: catalog } = useSWR("/api/admin/amenities", (path: string) => apiFetch<Amenity[]>(path));
  const [checkedIds, setCheckedIds] = useState<number[]>(selected.map((s) => s.amenityId));

  async function save() {
    await apiFetch(`/api/admin/residences/${residenceId}/amenities`, {
      method: "PATCH",
      body: JSON.stringify({ amenities: checkedIds.map((amenityId) => ({ amenityId })) }),
    });
    onChanged();
  }

  return (
    <div className="card">
      {(catalog ?? []).map((a) => (
        <label key={a.id} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={checkedIds.includes(a.id)}
            onChange={(e) =>
              setCheckedIds(e.target.checked ? [...checkedIds, a.id] : checkedIds.filter((id) => id !== a.id))
            }
          />{" "}
          {a.name} {a.category && <span style={{ color: "#9ca3af" }}>({a.category})</span>}
        </label>
      ))}
      {(catalog ?? []).length === 0 && <p style={{ color: "#6b7280" }}>کاتالوگ امکانات هنوز خالیه.</p>}
      <button className="btn" onClick={save} style={{ marginTop: 12 }}>
        ذخیره
      </button>
    </div>
  );
}

function RulesTab({ data, onChanged }: { data: ResidenceDetail; onChanged: () => void }) {
  const { data: catalog } = useSWR("/api/admin/rules", (path: string) => apiFetch<Rule[]>(path));
  const [checkedIds, setCheckedIds] = useState<number[]>(data.rules.map((r) => r.ruleId));

  async function save() {
    await apiFetch(`/api/admin/residences/${data.id}/rules`, {
      method: "PATCH",
      body: JSON.stringify({ rules: checkedIds.map((ruleId) => ({ ruleId })) }),
    });
    onChanged();
  }

  return (
    <div className="card">
      {(catalog ?? []).map((r) => (
        <label key={r.id} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={checkedIds.includes(r.id)}
            onChange={(e) =>
              setCheckedIds(e.target.checked ? [...checkedIds, r.id] : checkedIds.filter((id) => id !== r.id))
            }
          />{" "}
          {r.name} {r.category && <span style={{ color: "#9ca3af" }}>({r.category})</span>}
        </label>
      ))}
      {(catalog ?? []).length === 0 && <p style={{ color: "#6b7280" }}>کاتالوگ قوانین هنوز خالیه.</p>}
      <button className="btn" onClick={save} style={{ marginTop: 12 }}>
        ذخیره
      </button>
    </div>
  );
}
