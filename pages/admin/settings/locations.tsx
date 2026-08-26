import { useMemo, useState } from "react";
import Link from "next/link";
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
  Toggle,
  faNum,
} from "@/components/Admin/ui";

// "دسته‌بندی مکان‌ها" — the tree every /search/<slug> page is built from:
// کشور › استان › شهر › محله, plus regions like شمال.
//
// Two relationships that look alike but are not:
//   • والد (parent)      — the breadcrumb chain. Display only; it does NOT
//                          pull a child's listings onto the parent's page,
//                          except for a province, which always spans its cities.
//   • شهرهای زیرمجموعه   — the curated inclusion list. THIS is what makes a
//                          location's page also show another one's listings
//                          (قزوین also lists الموت; شمال lists all three
//                          northern provinces).
// Keeping them separate is deliberate: making the tree itself inclusive would
// silently change high-traffic pages (سمنان would jump from 8 to 83 listings).

const TYPES = [
  { value: "COUNTRY", label: "کشور" },
  { value: "PROVINCE", label: "استان" },
  { value: "CITY", label: "شهر" },
  { value: "REGION", label: "منطقه" },
  { value: "VILLAGE", label: "روستا" },
  { value: "NEIGHBORHOOD", label: "محله" },
] as const;

type LocationType = (typeof TYPES)[number]["value"];

const TYPE_LABEL: Record<string, string> = Object.fromEntries(TYPES.map((t) => [t.value, t.label]));

const TYPE_TONE: Record<string, string> = {
  COUNTRY: "bg-[#EEF2FF] text-[#4338CA]",
  PROVINCE: "bg-[#ECFDF5] text-[#047857]",
  CITY: "bg-[#EFF6FF] text-[#1D4ED8]",
  REGION: "bg-[#FFF7ED] text-[#C2410C]",
  VILLAGE: "bg-[#F0FDF4] text-[#15803D]",
  NEIGHBORHOOD: "bg-[#FDF4FF] text-[#A21CAF]",
};

interface LocationRow {
  id: number;
  name: string;
  titleEn: string | null;
  type: LocationType;
  parentId: number | null;
  canonicalId: number | null;
  isPublished: boolean;
  isPrimary: boolean;
  isActive: boolean;
  popularIndex: number | null;
  shomalIndex: number | null;
  sortOrder: number;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  keywords: string | null;
  odooId: number | null;
  residenceCount: number;
  extraResidenceCount: number;
  childCount: number;
}

interface LocationSeo {
  id: number;
  residenceType: "SUIT" | "BOOMGARDI" | "HOTEL" | null;
  pageTitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  contentTitle: string | null;
  contentHtml: string | null;
  phone: string | null;
  showPhone: boolean;
  showInHomepage: boolean;
  homepageIndex: number | null;
}

interface LocationDetail extends LocationRow {
  breadcrumb: { id: number; name: string; type: LocationType }[];
  includes: { child: { id: number; name: string; type: LocationType; titleEn: string | null } }[];
  includedIn: { parent: { id: number; name: string; type: LocationType } }[];
  children: { id: number; name: string; type: LocationType }[];
  seo: LocationSeo[];
}

const SITE = "https://lidomatrip.com";

export default function AdminLocationsPage() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | LocationType>("");
  const [openId, setOpenId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, mutate } = useSWR<LocationRow[]>("/api/admin/locations", (p: string) =>
    apiFetch<LocationRow[]>(p)
  );

  const all = data ?? [];
  const byId = useMemo(() => new Map(all.map((l) => [l.id, l])), [all]);

  const filtered = useMemo(() => {
    const needle = q.trim();
    return all.filter((l) => {
      if (typeFilter && l.type !== typeFilter) return false;
      if (!needle) return true;
      return (
        l.name.includes(needle) ||
        (l.titleEn ?? "").toLowerCase().includes(needle.toLowerCase())
      );
    });
  }, [all, q, typeFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    all.forEach((l) => (c[l.type] = (c[l.type] ?? 0) + 1));
    return c;
  }, [all]);

  // Slug collisions are the one thing that silently costs an indexed page, so
  // they get surfaced at the top rather than only on save.
  const duplicateSlugs = useMemo(() => {
    const seen = new Map<string, LocationRow[]>();
    all.forEach((l) => {
      const s = l.titleEn?.trim().toLowerCase();
      if (!s) return;
      if (!seen.has(s)) seen.set(s, []);
      seen.get(s)!.push(l);
    });
    return [...seen.entries()].filter(([, rows]) => rows.length > 1);
  }, [all]);

  const noSlug = all.filter((l) => !l.titleEn?.trim()).length;

  return (
    <AdminLayout
      title="دسته‌بندی مکان‌ها"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link>
          <span className="mx-6 text-gray-B0AFBC">/</span>
          <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
      toolbar={
        <Card className="px-8 py-6 flex items-center gap-x-4 overflow-x-auto">
          <Link
            href="/admin/settings"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            امکانات و قوانین
          </Link>
          <span className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap bg-primary-main text-white">
            دسته‌بندی مکان‌ها
          </span>
          <Link
            href="/admin/settings/tags"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            تگ‌های سئو
          </Link>
          <Link
            href="/admin/settings/sitemap"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            sitemap و robots
          </Link>
          <Link
            href="/admin/settings/faqs"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            سوالات متداول
          </Link>
          <Link
            href="/admin/settings/home"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            صفحه اصلی
          </Link>
        </Card>
      }
    >
      <div className="flex flex-col gap-y-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-12">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(typeFilter === t.value ? "" : t.value)}
              className={`rounded-12 px-16 py-14 text-right transition border ${
                typeFilter === t.value
                  ? "border-primary-main bg-primary-main/5"
                  : "border-gray-EFEFEF bg-white hover:border-gray-D9D9D9"
              }`}
            >
              <div className="text-12 leading-18 text-gray-6C6A7D">{t.label}</div>
              <div className="text-20 leading-28 font-b text-gray-1E1D28">
                {faNum(counts[t.value] ?? 0)}
              </div>
            </button>
          ))}
        </div>

        {(duplicateSlugs.length > 0 || noSlug > 0) && (
          <Card className="px-20 py-16 border-r-4 border-r-[#F59E0B]">
            <div className="text-13 leading-22 font-m text-gray-1E1D28 mb-6">نکته‌های سئویی</div>
            {duplicateSlugs.length > 0 && (
              <p className="text-12 leading-22 text-gray-6C6A7D">
                {faNum(duplicateSlugs.length)} اسلاگ تکراری در داده‌ی اودو وجود داره (مثل{" "}
                <span className="font-m">{duplicateSlugs[0][0]}</span> که هم برای{" "}
                {duplicateSlugs[0][1].map((r) => `${r.name} (${TYPE_LABEL[r.type]})`).join(" و ")} ثبت
                شده). این‌ها عمداً دست‌نخورده موندن چون آدرس‌های ایندکس‌شده روشون بنا شدن — ولی اسلاگ
                تکراری جدید پذیرفته نمی‌شه.
              </p>
            )}
            {noSlug > 0 && (
              <p className="text-12 leading-22 text-gray-6C6A7D mt-4">
                {faNum(noSlug)} مکان اسلاگ انگلیسی ندارن و صفحه‌ی سرچ اختصاصی نمی‌گیرن.
              </p>
            )}
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="px-20 py-16 flex flex-wrap items-center gap-12 border-b border-gray-EFEFEF">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی نام فارسی یا اسلاگ…"
              className="flex-1 min-w-[220px]"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-[160px]"
            >
              <option value="">همه‌ی انواع</option>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Button onClick={() => setCreating(true)}>افزودن مکان</Button>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState text="مکانی با این فیلترها پیدا نشد." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-13 leading-22">
                <thead className="bg-gray-FAFAFA text-gray-6C6A7D">
                  <tr>
                    <th className="text-right font-m px-20 py-12">نام</th>
                    <th className="text-right font-m px-12 py-12">نوع</th>
                    <th className="text-right font-m px-12 py-12">اسلاگ</th>
                    <th className="text-right font-m px-12 py-12">والد</th>
                    <th className="text-right font-m px-12 py-12">اقامتگاه</th>
                    <th className="text-right font-m px-12 py-12">زیرمجموعه</th>
                    <th className="text-right font-m px-12 py-12">وضعیت</th>
                    <th className="px-20 py-12" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 400).map((l) => (
                    <tr key={l.id} className="border-t border-gray-F5F5F5 hover:bg-gray-FAFAFA">
                      <td className="px-20 py-12 font-m text-gray-1E1D28">{l.name}</td>
                      <td className="px-12 py-12">
                        <span
                          className={`inline-block px-8 py-2 rounded-8 text-11 leading-18 ${
                            TYPE_TONE[l.type] ?? ""
                          }`}
                        >
                          {TYPE_LABEL[l.type]}
                        </span>
                      </td>
                      <td className="px-12 py-12 text-gray-6C6A7D" dir="ltr">
                        {l.titleEn || <span className="text-[#DC2626]">—</span>}
                      </td>
                      <td className="px-12 py-12 text-gray-6C6A7D">
                        {l.parentId ? byId.get(l.parentId)?.name ?? "—" : "—"}
                      </td>
                      <td className="px-12 py-12 text-gray-6C6A7D">
                        {faNum(l.residenceCount)}
                        {l.extraResidenceCount > 0 && (
                          <span className="text-11 text-gray-B0AFBC"> +{faNum(l.extraResidenceCount)}</span>
                        )}
                      </td>
                      <td className="px-12 py-12 text-gray-6C6A7D">{faNum(l.childCount)}</td>
                      <td className="px-12 py-12">
                        {l.isPublished ? (
                          <Badge tone="green">منتشرشده</Badge>
                        ) : (
                          <Badge tone="red">منتشرنشده</Badge>
                        )}
                      </td>
                      <td className="px-20 py-12 text-left">
                        <button
                          onClick={() => setOpenId(l.id)}
                          className="text-12 text-primary-main hover:underline"
                        >
                          مدیریت
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length > 400 && (
                <div className="px-20 py-12 text-12 text-gray-6C6A7D">
                  {faNum(filtered.length - 400)} مورد دیگه نمایش داده نشد — جستجو رو دقیق‌تر کن.
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {openId !== null && (
        <LocationDetailModal
          id={openId}
          allLocations={all}
          onClose={() => setOpenId(null)}
          onSaved={() => mutate()}
        />
      )}

      {creating && (
        <CreateLocationModal
          allLocations={all}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            mutate();
          }}
        />
      )}
    </AdminLayout>
  );
}

function CreateLocationModal({
  allLocations,
  onClose,
  onSaved,
}: {
  allLocations: LocationRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ type: "CITY" as LocationType, name: "", titleEn: "", parentId: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/locations", {
        method: "POST",
        body: JSON.stringify({
          type: form.type,
          name: form.name.trim(),
          titleEn: form.titleEn.trim() || null,
          parentId: form.parentId ? Number(form.parentId) : null,
        }),
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "ذخیره نشد.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open title="افزودن مکان" onClose={onClose}>
      <div className="flex flex-col gap-y-14">
        <Field label="نوع">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LocationType })}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="نام فارسی">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field
          label="اسلاگ انگلیسی"
          hint="آدرس صفحه‌ی سرچ از همین ساخته می‌شه: /search/<اسلاگ>. خالی بذاری صفحه‌ی اختصاصی نمی‌گیره."
        >
          <Input
            dir="ltr"
            value={form.titleEn}
            onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
            placeholder="tehran"
          />
        </Field>
        <Field label="والد (برای بردکرامب)">
          <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">— بدون والد —</option>
            {allLocations
              .filter((l) => l.type !== "CITY" || form.type === "NEIGHBORHOOD")
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({TYPE_LABEL[l.type]})
                </option>
              ))}
          </Select>
        </Field>

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}

        <div className="flex gap-x-8 justify-end pt-4">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={save} disabled={saving || !form.name.trim()}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

const SEO_SETS = [
  { key: null, label: "پیش‌فرض" },
  { key: "BOOMGARDI", label: "بوم‌گردی" },
  { key: "HOTEL", label: "هتل" },
] as const;

function LocationDetailModal({
  id,
  allLocations,
  onClose,
  onSaved,
}: {
  id: number;
  allLocations: LocationRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { data, isLoading, mutate } = useSWR<LocationDetail>(`/api/admin/locations/${id}`, (p: string) =>
    apiFetch<LocationDetail>(p)
  );
  const [tab, setTab] = useState<"info" | "includes" | "seo">("info");
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <Modal open title="در حال بارگذاری…" onClose={onClose}>
        <Skeleton className="h-200" />
      </Modal>
    );
  }

  return (
    <Modal open title={`${data.name} — ${TYPE_LABEL[data.type]}`} onClose={onClose} width="max-w-[860px]">
      <div className="flex flex-col gap-y-16">
        <div className="text-12 leading-20 text-gray-6C6A7D">
          {data.breadcrumb.map((b, i) => (
            <span key={b.id}>
              {i > 0 && <span className="mx-4">›</span>}
              {b.name}
            </span>
          ))}
        </div>

        {data.titleEn && (
          <a
            href={`${SITE}/search/${data.titleEn}`}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="text-12 text-primary-main hover:underline self-start"
          >
            {SITE}/search/{data.titleEn}
          </a>
        )}

        <div className="flex gap-x-4 border-b border-gray-EFEFEF">
          {[
            { k: "info", l: "اطلاعات" },
            { k: "includes", l: `شهرهای زیرمجموعه (${faNum(data.includes.length)})` },
            { k: "seo", l: "محتوای سئو" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as any)}
              className={`px-14 py-10 text-13 leading-20 font-m transition border-b-2 -mb-px ${
                tab === t.k
                  ? "border-primary-main text-primary-main"
                  : "border-transparent text-gray-6C6A7D hover:text-gray-1E1D28"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}

        {tab === "info" && (
          <InfoTab
            location={data}
            allLocations={allLocations}
            onError={setError}
            onSaved={() => {
              mutate();
              onSaved();
            }}
          />
        )}
        {tab === "includes" && (
          <IncludesTab
            location={data}
            allLocations={allLocations}
            onError={setError}
            onSaved={() => {
              mutate();
              onSaved();
            }}
          />
        )}
        {tab === "seo" && <SeoTab location={data} onError={setError} onSaved={() => mutate()} />}
      </div>
    </Modal>
  );
}

function InfoTab({
  location,
  allLocations,
  onError,
  onSaved,
}: {
  location: LocationDetail;
  allLocations: LocationRow[];
  onError: (m: string | null) => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: location.name,
    titleEn: location.titleEn ?? "",
    type: location.type,
    parentId: location.parentId ? String(location.parentId) : "",
    canonicalId: location.canonicalId ? String(location.canonicalId) : "",
    keywords: location.keywords ?? "",
    isPublished: location.isPublished,
    isPrimary: location.isPrimary,
    sortOrder: location.sortOrder,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      await apiFetch(`/api/admin/locations/${location.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim(),
          titleEn: form.titleEn.trim() || null,
          type: form.type,
          parentId: form.parentId ? Number(form.parentId) : null,
          canonicalId: form.canonicalId ? Number(form.canonicalId) : null,
          keywords: form.keywords.trim() || null,
          isPublished: form.isPublished,
          isPrimary: form.isPrimary,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      onSaved();
    } catch (e: any) {
      onError(e?.message ?? "ذخیره نشد.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-14">
      <div className="grid md:grid-cols-2 gap-14">
        <Field label="نام فارسی">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="اسلاگ انگلیسی" hint="تغییرش آدرس ایندکس‌شده رو عوض می‌کنه — با احتیاط.">
          <Input dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
        </Field>
        <Field label="نوع">
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LocationType })}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="والد" hint="فقط بردکرامب. لیست اقامتگاه‌ها رو تغییر نمی‌ده (مگر استان).">
          <Select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
            <option value="">— بدون والد —</option>
            {allLocations
              .filter((l) => l.id !== location.id)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({TYPE_LABEL[l.type]})
                </option>
              ))}
          </Select>
        </Field>
        <Field
          label="canonical"
          hint="اگر این صفحه باید اعتبار سئوش به یه صفحه‌ی دیگه منتقل بشه."
        >
          <Select value={form.canonicalId} onChange={(e) => setForm({ ...form, canonicalId: e.target.value })}>
            <option value="">— ندارد —</option>
            {allLocations
              .filter((l) => l.id !== location.id && l.titleEn)
              .map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.titleEn})
                </option>
              ))}
          </Select>
        </Field>
        <Field label="ترتیب نمایش">
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </Field>
      </div>

      <Field label="کلیدواژه‌ها" hint="فهرست آزاد، با کاما جدا می‌شه (از x_tags اودو).">
        <Input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} />
      </Field>

      <div className="flex flex-wrap gap-x-24 gap-y-10">
        <Toggle
          checked={form.isPublished}
          onChange={(v) => setForm({ ...form, isPublished: v })}
          label="منتشرشده"
        />
        <Toggle checked={form.isPrimary} onChange={(v) => setForm({ ...form, isPrimary: v })} label="مقصد اصلی" />
      </div>

      <div className="rounded-10 bg-gray-FAFAFA px-16 py-12 text-12 leading-22 text-gray-6C6A7D">
        {faNum(location.residenceCount)} اقامتگاه اصلی · {faNum(location.extraResidenceCount)} اقامتگاه فرعی ·{" "}
        {faNum(location.children.length)} زیرشاخه
        {location.odooId ? ` · شناسه‌ی اودو ${faNum(location.odooId)}` : ""}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
      </div>
    </div>
  );
}

function IncludesTab({
  location,
  allLocations,
  onError,
  onSaved,
}: {
  location: LocationDetail;
  allLocations: LocationRow[];
  onError: (m: string | null) => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<number[]>(location.includes.map((i) => i.child.id));
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const candidates = useMemo(() => {
    const needle = q.trim();
    if (!needle) return allLocations.filter((l) => selected.includes(l.id));
    return allLocations
      .filter((l) => l.id !== location.id)
      .filter((l) => l.name.includes(needle) || (l.titleEn ?? "").toLowerCase().includes(needle.toLowerCase()))
      .slice(0, 40);
  }, [allLocations, q, selected, location.id]);

  const addedCount = allLocations
    .filter((l) => selected.includes(l.id))
    .reduce((sum, l) => sum + l.residenceCount, 0);

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      await apiFetch(`/api/admin/locations/${location.id}/includes`, {
        method: "PUT",
        body: JSON.stringify({ childIds: selected }),
      });
      onSaved();
    } catch (e: any) {
      onError(e?.message ?? "ذخیره نشد.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-14">
      <p className="text-12 leading-22 text-gray-6C6A7D">
        اقامتگاه‌های مکان‌هایی که اینجا انتخاب می‌کنی، توی صفحه‌ی{" "}
        <span className="font-m text-gray-1E1D28">{location.name}</span> هم نشون داده می‌شن. اگه یه
        استان انتخاب کنی، همه‌ی شهرهاش هم میان.
      </p>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو برای افزودن…" />

      <div className="max-h-[280px] overflow-y-auto rounded-10 border border-gray-EFEFEF divide-y divide-gray-F5F5F5">
        {candidates.length === 0 ? (
          <div className="px-16 py-20 text-12 text-gray-6C6A7D text-center">
            {q.trim() ? "چیزی پیدا نشد." : "هنوز زیرمجموعه‌ای انتخاب نشده — برای افزودن جستجو کن."}
          </div>
        ) : (
          candidates.map((l) => {
            const on = selected.includes(l.id);
            return (
              <label
                key={l.id}
                className="flex items-center gap-x-10 px-16 py-10 cursor-pointer hover:bg-gray-FAFAFA"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setSelected(on ? selected.filter((x) => x !== l.id) : [...selected, l.id])
                  }
                />
                <span className="text-13 text-gray-1E1D28 font-m">{l.name}</span>
                <span className="text-11 text-gray-B0AFBC">{TYPE_LABEL[l.type]}</span>
                <span className="text-11 text-gray-6C6A7D mr-auto">
                  {faNum(l.residenceCount)} اقامتگاه
                </span>
              </label>
            );
          })
        )}
      </div>

      <div className="rounded-10 bg-gray-FAFAFA px-16 py-12 text-12 leading-22 text-gray-6C6A7D">
        {faNum(selected.length)} مکان انتخاب شده — حدود {faNum(addedCount)} اقامتگاه به این صفحه اضافه
        می‌شه (بدون احتساب شهرهای زیر استان‌ها).
      </div>

      {location.includedIn.length > 0 && (
        <div className="text-12 leading-22 text-gray-6C6A7D">
          این مکان خودش زیرمجموعه‌ی{" "}
          <span className="font-m text-gray-1E1D28">
            {location.includedIn.map((i) => i.parent.name).join("، ")}
          </span>{" "}
          هست.
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره…" : "ذخیره زیرمجموعه‌ها"}
        </Button>
      </div>
    </div>
  );
}

function SeoTab({
  location,
  onError,
  onSaved,
}: {
  location: LocationDetail;
  onError: (m: string | null) => void;
  onSaved: () => void;
}) {
  const [set, setSet] = useState<"" | "BOOMGARDI" | "HOTEL">("");
  const current = location.seo.find((s) => (s.residenceType ?? "") === set);

  const [form, setForm] = useState(() => blank(current));
  const [saving, setSaving] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string>("");

  // Swap the form when the selected set changes.
  if (loadedFor !== set) {
    setLoadedFor(set);
    setForm(blank(location.seo.find((s) => (s.residenceType ?? "") === set)));
  }

  function blank(s: LocationSeo | undefined) {
    return {
      pageTitle: s?.pageTitle ?? "",
      metaTitle: s?.metaTitle ?? "",
      metaDescription: s?.metaDescription ?? "",
      metaKeywords: s?.metaKeywords ?? "",
      contentTitle: s?.contentTitle ?? "",
      contentHtml: s?.contentHtml ?? "",
      phone: s?.phone ?? "",
      showPhone: s?.showPhone ?? false,
      showInHomepage: s?.showInHomepage ?? false,
    };
  }

  const save = async () => {
    setSaving(true);
    onError(null);
    try {
      await apiFetch(`/api/admin/locations/${location.id}/seo`, {
        method: "PUT",
        body: JSON.stringify({
          residenceType: set || null,
          pageTitle: form.pageTitle.trim() || null,
          metaTitle: form.metaTitle.trim() || null,
          metaDescription: form.metaDescription.trim() || null,
          metaKeywords: form.metaKeywords.trim() || null,
          contentTitle: form.contentTitle.trim() || null,
          contentHtml: form.contentHtml.trim() || null,
          phone: form.phone.trim() || null,
          showPhone: form.showPhone,
          showInHomepage: form.showInHomepage,
        }),
      });
      onSaved();
    } catch (e: any) {
      onError(e?.message ?? "ذخیره نشد.");
    } finally {
      setSaving(false);
    }
  };

  const titleLen = form.metaTitle.trim().length;
  const descLen = form.metaDescription.trim().length;

  return (
    <div className="flex flex-col gap-y-14">
      <div className="flex gap-x-6">
        {SEO_SETS.map((s) => {
          const key = s.key ?? "";
          const has = location.seo.some((x) => (x.residenceType ?? "") === key);
          return (
            <button
              key={key}
              onClick={() => setSet(key as any)}
              className={`px-12 py-6 rounded-8 text-12 leading-20 font-m transition ${
                set === key ? "bg-primary-main text-white" : "bg-gray-F5F5F5 text-gray-6C6A7D hover:bg-gray-EFEFEF"
              }`}
            >
              {s.label}
              {has && <span className="mr-4 opacity-60">•</span>}
            </button>
          );
        })}
      </div>
      <p className="text-11 leading-20 text-gray-B0AFBC">
        هر نوع اقامتگاه متن سئوی جدا داره. «پیش‌فرض» روی صفحه‌ی معمولی شهر نشون داده می‌شه.
      </p>

      <Field label="عنوان صفحه (H1)">
        <Input value={form.pageTitle} onChange={(e) => setForm({ ...form, pageTitle: e.target.value })} />
      </Field>
      <Field
        label="meta title"
        hint={`${titleLen} کاراکتر${titleLen > 60 ? " — از ۶۰ بیشتره، گوگل کوتاهش می‌کنه." : ""}`}
      >
        <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
      </Field>
      <Field
        label="meta description"
        hint={`${descLen} کاراکتر${descLen > 160 ? " — از ۱۶۰ بیشتره." : ""}`}
      >
        <textarea
          value={form.metaDescription}
          onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
          rows={3}
          className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main"
        />
      </Field>
      <Field label="meta keywords">
        <Input value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} />
      </Field>
      <Field label="عنوان متن راهنما">
        <Input value={form.contentTitle} onChange={(e) => setForm({ ...form, contentTitle: e.target.value })} />
      </Field>
      <Field label="متن راهنما" hint="HTML مجازه — همون بلوک «درباره» پایین صفحه‌ی سرچ.">
        <textarea
          value={form.contentHtml}
          onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
          rows={8}
          dir="rtl"
          className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main font-mono"
        />
      </Field>

      <div className="grid md:grid-cols-2 gap-14">
        <Field label="شماره تماس اختصاصی">
          <Input dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <div className="flex flex-col justify-end gap-y-10 pb-4">
          <Toggle checked={form.showPhone} onChange={(v) => setForm({ ...form, showPhone: v })} label="نمایش شماره" />
          <Toggle
            checked={form.showInHomepage}
            onChange={(v) => setForm({ ...form, showInHomepage: v })}
            label="نمایش در صفحه‌ی اصلی"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره…" : "ذخیره محتوای سئو"}
        </Button>
      </div>
    </div>
  );
}
