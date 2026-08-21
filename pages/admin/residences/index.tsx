import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch, apiFetchPaginated } from "@/api/Admin/adminApi";

interface ResidenceRow {
  id: number;
  name: string;
  state: string;
  reference: string;
  host: { name: string | null; phone: string };
  city: { name: string } | null;
  weekPrice: number | null;
  averageRating: number;
  images: { url: string }[];
}

interface FilterFieldMeta {
  label: string;
  type: "string" | "number" | "boolean" | "enum" | "date";
  enumValues?: string[];
}

interface FilterCondition {
  field: string;
  operator: string;
  value: string;
}

interface FilterPreset {
  id: number;
  name: string;
  entity: string;
  filters: FilterCondition[];
}

const STATE_BADGE: Record<string, string> = {
  DRAFT: "gray",
  PENDING: "yellow",
  PUBLISHED: "green",
  REJECTED: "red",
  DEACTIVATED: "gray",
  DELETED: "red",
};

const STATE_LABELS: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  PUBLISHED: "منتشر شده",
  REJECTED: "رد شده",
  DEACTIVATED: "غیرفعال",
  DELETED: "حذف شده",
};

const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  string: [
    { value: "contains", label: "شامل" },
    { value: "equals", label: "برابر" },
  ],
  number: [
    { value: "equals", label: "برابر" },
    { value: "gte", label: "حداقل" },
    { value: "lte", label: "حداکثر" },
  ],
  boolean: [{ value: "equals", label: "برابر" }],
  enum: [{ value: "equals", label: "برابر" }],
  date: [
    { value: "gte", label: "از تاریخ" },
    { value: "lte", label: "تا تاریخ" },
  ],
};

function ValueInput({
  meta,
  value,
  onChange,
}: {
  meta: FilterFieldMeta | undefined;
  value: string;
  onChange: (v: string) => void;
}) {
  if (!meta) return <input value={value} onChange={(e) => onChange(e.target.value)} />;
  if (meta.type === "boolean") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="true">بله</option>
        <option value="false">خیر</option>
      </select>
    );
  }
  if (meta.type === "enum") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">انتخاب کنید</option>
        {meta.enumValues?.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    );
  }
  if (meta.type === "number") {
    return <input type="number" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  if (meta.type === "date") {
    return <input type="date" value={value} onChange={(e) => onChange(e.target.value)} />;
  }
  return <input value={value} onChange={(e) => onChange(e.target.value)} />;
}

export default function AdminResidencesPage() {
  const [page, setPage] = useState(1);
  const [state, setState] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"list" | "card">("list");
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<FilterCondition[]>([]);

  const { data: filterFields } = useSWR("/api/admin/residences/filter-fields", (path: string) =>
    apiFetch<Record<string, FilterFieldMeta>>(path)
  );
  const { data: presets, mutate: mutatePresets } = useSWR("/api/admin/filter-presets?entity=residence", (path: string) =>
    apiFetch<FilterPreset[]>(path)
  );

  const query = new URLSearchParams({
    page: String(page),
    pageSize: "20",
    ...(state ? { state } : {}),
    ...(q ? { q } : {}),
    ...(appliedFilters.length ? { filters: JSON.stringify(appliedFilters) } : {}),
  });
  const { data, isLoading, mutate } = useSWR(`/api/admin/residences?${query.toString()}`, (path: string) =>
    apiFetchPaginated<ResidenceRow>(path)
  );

  function addFilterRow() {
    const firstField = Object.keys(filterFields ?? {})[0] ?? "";
    setFilters([...filters, { field: firstField, operator: "contains", value: "" }]);
  }

  function updateFilterRow(index: number, patch: Partial<FilterCondition>) {
    setFilters(filters.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeFilterRow(index: number) {
    setFilters(filters.filter((_, i) => i !== index));
  }

  function applyFilters() {
    setPage(1);
    setAppliedFilters(filters.filter((f) => f.field && f.value !== ""));
  }

  async function savePreset() {
    const name = prompt("اسم این فیلتر رو وارد کن:");
    if (!name) return;
    await apiFetch("/api/admin/filter-presets", {
      method: "POST",
      body: JSON.stringify({ name, entity: "residence", filters }),
    });
    mutatePresets();
  }

  function applyPreset(preset: FilterPreset) {
    setFilters(preset.filters);
    setAppliedFilters(preset.filters);
    setPage(1);
  }

  async function deletePreset(id: number) {
    if (!confirm("این فیلتر آماده حذف بشه؟")) return;
    await apiFetch(`/api/admin/filter-presets/${id}`, { method: "DELETE" });
    mutatePresets();
  }

  return (
    <AdminLayout>
      <h1>اقامتگاه‌ها</h1>

      <div className="toolbar">
        <input
          placeholder="جستجوی نام اقامتگاه..."
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 260 }}
        />
        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setPage(1);
          }}
          style={{ maxWidth: 200 }}
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(STATE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <div style={{ display: "flex", gap: 4, marginRight: "auto" }}>
          <button
            className={`btn ${view === "list" ? "" : "secondary"}`}
            onClick={() => setView("list")}
          >
            نمایش ردیفی
          </button>
          <button
            className={`btn ${view === "card" ? "" : "secondary"}`}
            onClick={() => setView("card")}
          >
            نمایش کارتی
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>فیلتر سفارشی</h3>

        {(presets?.length ?? 0) > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {presets!.map((p) => (
              <span key={p.id} className="badge gray" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <button
                  onClick={() => applyPreset(p)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {p.name}
                </button>
                <button
                  onClick={() => deletePreset(p.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#ef4444" }}
                  title="حذف"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {filters.map((f, i) => {
          const meta = filterFields?.[f.field];
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <select
                value={f.field}
                onChange={(e) => updateFilterRow(i, { field: e.target.value, operator: "contains", value: "" })}
                style={{ maxWidth: 180 }}
              >
                {Object.entries(filterFields ?? {}).map(([field, m]) => (
                  <option key={field} value={field}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={f.operator}
                onChange={(e) => updateFilterRow(i, { operator: e.target.value })}
                style={{ maxWidth: 140 }}
              >
                {(OPERATORS_BY_TYPE[meta?.type ?? "string"] ?? []).map((op) => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <ValueInput meta={meta} value={f.value} onChange={(v) => updateFilterRow(i, { value: v })} />
              <button className="btn secondary" onClick={() => removeFilterRow(i)}>
                حذف
              </button>
            </div>
          );
        })}

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn secondary" onClick={addFilterRow}>
            + افزودن فیلتر
          </button>
          <button className="btn" onClick={applyFilters}>
            اعمال فیلتر
          </button>
          {filters.length > 0 && (
            <button className="btn secondary" onClick={savePreset}>
              ذخیره به‌عنوان فیلتر آماده
            </button>
          )}
        </div>
      </div>

      <div className="card">
        {isLoading && <p>در حال بارگذاری...</p>}

        {data && view === "list" && (
          <table>
            <thead>
              <tr>
                <th>نام</th>
                <th>میزبان</th>
                <th>شهر</th>
                <th>قیمت هفته</th>
                <th>وضعیت</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>
                    {r.host.name ?? "-"} <span style={{ color: "#9ca3af" }}>({r.host.phone})</span>
                  </td>
                  <td>{r.city?.name ?? "-"}</td>
                  <td>{r.weekPrice?.toLocaleString("fa-IR") ?? "-"}</td>
                  <td>
                    <span className={`badge ${STATE_BADGE[r.state] ?? "gray"}`}>
                      {STATE_LABELS[r.state] ?? r.state}
                    </span>
                  </td>
                  <td>
                    <Link className="btn secondary" href={`/admin/residences/${r.id}`}>
                      مشاهده
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && view === "card" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {data.items.map((r) => (
              <Link
                key={r.id}
                href={`/admin/residences/${r.id}`}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  overflow: "hidden",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div
                  style={{
                    height: 140,
                    background: r.images[0]?.url ? `url(${r.images[0].url}) center/cover` : "#f3f4f6",
                  }}
                />
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.name}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>
                    {r.city?.name ?? "-"} · {r.host.name ?? "-"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{r.weekPrice?.toLocaleString("fa-IR") ?? "-"} تومان</span>
                    <span className={`badge ${STATE_BADGE[r.state] ?? "gray"}`}>
                      {STATE_LABELS[r.state] ?? r.state}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {data && (
          <div className="pagination">
            <button className="btn secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </button>
            <span style={{ alignSelf: "center" }}>
              صفحه {page} از {data.meta.pageCount}
            </span>
            <button
              className="btn secondary"
              disabled={page >= data.meta.pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی
            </button>
            <button className="btn secondary" onClick={() => mutate()}>
              بروزرسانی
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
