import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Select,
  Skeleton,
  Toolbar,
  ToolbarSearch,
  faNum,
  parseCoord,
} from "@/components/Admin/ui";

const LocationPicker = dynamic(() => import("@/components/Admin/LocationPicker"), { ssr: false });

/**
 * جاذبه‌های گردشگری — the catalogue behind "فاصله تا جاذبه‌های گردشگری".
 *
 * 18,335 places recovered from Odoo, which the first migration flattened into
 * free text on each listing's distance rows and then dropped. The catalogue is
 * what makes "what is near this listing" answerable at all.
 *
 * ## Coordinates are the point of this page
 *
 * Only 720 of the 18,335 have any. An attraction without them can still be
 * picked by hand for a listing in the same city, but it cannot be *found* —
 * the proximity search skips it, and its distance has to be typed. So the
 * default filter is «بدون مختصات» and the counter is on the header: this page
 * exists mainly to close that gap, and it should say how big the gap is every
 * time it opens.
 */

interface Attraction {
  id: number;
  odooId: number | null;
  name: string;
  latitude: number | null;
  longitude: number | null;
  isActive: boolean;
  usedByCount: number;
  location: { id: number; name: string; parent: { name: string } | null } | null;
}

interface Counts {
  total: number;
  withCoords: number;
  withoutCoords: number;
  active: number;
}

const PAGE_SIZE = 20;

export default function AttractionsSettingsPage() {
  const [q, setQ] = useState("");
  const [coords, setCoords] = useState<"" | "with" | "without">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Attraction | null>(null);
  const [creating, setCreating] = useState(false);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    ...(q ? { q } : {}),
    ...(coords ? { coords } : {}),
  });

  const { data, isLoading, mutate } = useSWR<{ total: number; items: Attraction[] }>(
    `/api/admin/attractions?${query}`,
    (p: string) => apiFetch<{ total: number; items: Attraction[] }>(p)
  );

  const { data: counts, mutate: reloadCounts } = useSWR<Counts>(
    "/api/admin/attractions/counts",
    (p: string) => apiFetch<Counts>(p)
  );

  const pages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  function refresh() {
    mutate();
    reloadCounts();
  }

  return (
    <AdminLayout
      title="جاذبه‌های گردشگری"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link> / <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
      actions={<Button onClick={() => setCreating(true)}>افزودن جاذبه</Button>}
    >
      <div className="flex flex-col gap-y-16">
        {!!counts && (
          <Card className="p-16 flex items-center gap-x-16 flex-wrap gap-y-10">
            <span className="text-13 text-gray-6C6A7D">
              کل : <b className="text-black">{faNum(counts.total)}</b>
            </span>
            <span className="w-px h-16 bg-gray-E5E5E6" />
            <span className="text-13 text-gray-6C6A7D">
              با مختصات : <b className="text-[#2E7D32]">{faNum(counts.withCoords)}</b>
            </span>
            <span className="text-13 text-gray-6C6A7D">
              بدون مختصات : <b className="text-[#B26A00]">{faNum(counts.withoutCoords)}</b>
            </span>
            <span className="flex-1" />
            <span className="text-11 leading-18 text-gray-9B9BAA max-w-[520px]">
              فقط جاذبه‌هایی که مختصات دارند در «جاذبه‌های نزدیک» اقامتگاه پیدا می‌شوند و فاصله‌شان
              خودکار حساب می‌شود. بقیه را باید دستی انتخاب کرد.
            </span>
          </Card>
        )}

        <Toolbar>
          <ToolbarSearch
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="جستجوی نام جاذبه…"
          />
          <Select
            value={coords}
            onChange={(e) => {
              setCoords(e.target.value as "" | "with" | "without");
              setPage(1);
            }}
          >
            <option value="">همه</option>
            <option value="with">فقط با مختصات</option>
            <option value="without">فقط بدون مختصات</option>
          </Select>
        </Toolbar>

        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-20">
              <Skeleton className="h-[300px]" />
            </div>
          ) : !data?.items.length ? (
            <div className="p-20">
              <EmptyState text="جاذبه‌ای پیدا نشد" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-[#2B3A55] text-white text-12">
                  <tr>
                    <th className="px-14 py-12 font-m">نام</th>
                    <th className="px-14 py-12 font-m">شهر</th>
                    <th className="px-14 py-12 font-m">مختصات</th>
                    <th className="px-14 py-12 font-m">استفاده‌شده</th>
                    <th className="px-14 py-12 font-m">وضعیت</th>
                    <th className="px-14 py-12 font-m" />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((a) => (
                    <tr key={a.id} className="border-b border-gray-F0F0F0 last:border-0">
                      <td className="px-14 py-10 text-13 text-black">{a.name}</td>
                      <td className="px-14 py-10 text-13 text-gray-6C6A7D">
                        {a.location ? (
                          <>
                            {a.location.name}
                            {a.location.parent ? (
                              <span className="text-11 text-gray-9B9BAA"> ({a.location.parent.name})</span>
                            ) : null}
                          </>
                        ) : (
                          <span className="text-gray-9B9BAA">—</span>
                        )}
                      </td>
                      <td className="px-14 py-10 text-12">
                        {a.latitude != null && a.longitude != null ? (
                          <span className="text-[#2E7D32]" dir="ltr">
                            {a.latitude.toFixed(4)} , {a.longitude.toFixed(4)}
                          </span>
                        ) : (
                          <Badge tone="yellow">ندارد</Badge>
                        )}
                      </td>
                      <td className="px-14 py-10 text-13 text-gray-6C6A7D">
                        {a.usedByCount > 0 ? faNum(a.usedByCount) : "—"}
                      </td>
                      <td className="px-14 py-10">
                        {a.isActive ? (
                          <Badge tone="green">فعال</Badge>
                        ) : (
                          <Badge tone="gray">غیرفعال</Badge>
                        )}
                      </td>
                      <td className="px-14 py-10">
                        <Button variant="secondary" onClick={() => setEditing(a)}>
                          ویرایش
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {pages > 1 && (
          <div className="flex items-center justify-center gap-x-10">
            <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              قبلی
            </Button>
            <span className="text-13 text-gray-6C6A7D">
              صفحه {faNum(page)} از {faNum(pages)}
            </span>
            <Button variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              بعدی
            </Button>
          </div>
        )}
      </div>

      <AttractionModal
        open={creating || !!editing}
        attraction={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={refresh}
      />
    </AdminLayout>
  );
}

function AttractionModal({
  open,
  attraction,
  onClose,
  onSaved,
}: {
  open: boolean;
  attraction: Attraction | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [latText, setLatText] = useState("");
  const [lngText, setLngText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<number | "new" | null>(null);

  // Reset when the modal opens on a different row. Keyed on the id rather than
  // `open`, so re-rendering while open does not wipe what is being typed.
  const key = attraction?.id ?? "new";
  if (open && ready !== key) {
    setName(attraction?.name ?? "");
    setLat(attraction?.latitude ?? null);
    setLng(attraction?.longitude ?? null);
    setLatText(attraction?.latitude?.toString() ?? "");
    setLngText(attraction?.longitude?.toString() ?? "");
    setError(null);
    setReady(key);
  }
  if (!open && ready !== null) setReady(null);

  async function save() {
    if (!name.trim()) {
      setError("نام جاذبه الزامی است");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body = JSON.stringify({ name: name.trim(), latitude: lat, longitude: lng });
      if (attraction) {
        await apiFetch(`/api/admin/attractions/${attraction.id}`, { method: "PATCH", body });
      } else {
        await apiFetch("/api/admin/attractions", { method: "POST", body });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={attraction ? "ویرایش جاذبه" : "افزودن جاذبه"}
      width="max-w-[620px]"
    >
      <Field label="نام جاذبه">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً پل خواجو" />
      </Field>

      <p className="mt-14 mb-8 text-12 leading-20 text-gray-6C6A7D">
        موقعیت — روی نقشه کلیک کنید یا مختصات را وارد کنید. بدون مختصات، این جاذبه در جستجوی
        «نزدیک‌ترین‌ها» پیدا نمی‌شود.
      </p>

      <LocationPicker
        lat={lat}
        lng={lng}
        height="h-[260px]"
        onChange={(newLat, newLng) => {
          setLat(newLat);
          setLng(newLng);
          setLatText(newLat.toFixed(7));
          setLngText(newLng.toFixed(7));
        }}
      />

      <div className="grid grid-cols-2 gap-10 mt-12">
        <Field label="عرض جغرافیایی">
          <Input
            value={latText}
            inputMode="decimal"
            onChange={(e) => {
              setLatText(e.target.value);
              const v = parseCoord(e.target.value);
              if (v != null && v >= -90 && v <= 90) setLat(v);
            }}
          />
        </Field>
        <Field label="طول جغرافیایی">
          <Input
            value={lngText}
            inputMode="decimal"
            onChange={(e) => {
              setLngText(e.target.value);
              const v = parseCoord(e.target.value);
              if (v != null && v >= -180 && v <= 180) setLng(v);
            }}
          />
        </Field>
      </div>

      {!!attraction?.usedByCount && (
        <p className="mt-10 text-12 leading-20 text-gray-9B9BAA">
          این جاذبه روی {faNum(attraction.usedByCount)} اقامتگاه استفاده شده.
        </p>
      )}

      {!!error && <p className="mt-12 text-13 text-[#C62828]">{error}</p>}

      <div className="mt-20 flex items-center justify-end gap-x-10">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          انصراف
        </Button>
        <Button onClick={save} disabled={busy || !name.trim()}>
          {busy ? "در حال ذخیره…" : "ذخیره"}
        </Button>
      </div>
    </Modal>
  );
}
