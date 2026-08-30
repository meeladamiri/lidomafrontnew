import { useState } from "react";
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
  faDate,
  faNum,
} from "@/components/Admin/ui";

// Global residence settings: the amenity catalog (with its sub-feature
// definitions), the rule catalog, and the peak-day calendar. Everything here
// applies to every residence.

const TABS = [
  { key: "amenities", label: "امکانات" },
  { key: "rules", label: "قوانین و مقررات" },
  { key: "peak", label: "روزهای پیک" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

interface FeatureDef {
  id?: number;
  name: string;
  fieldType: "TEXT" | "DROPDOWN" | "SWITCH" | "CHECKBOX";
  placeholder: string | null;
  values: string | null;
}

interface Amenity {
  id: number;
  key: string | null;
  name: string;
  category: string | null;
  iconUrl: string | null;
  features: FeatureDef[];
}

interface Rule {
  id: number;
  key: string | null;
  name: string;
  category: string | null;
}

interface PeakDay {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  cities: { city: { id: number; name: string } }[];
}

const FIELD_TYPES = [
  { value: "SWITCH", label: "کلید (دارد / ندارد)" },
  { value: "DROPDOWN", label: "لیست کشویی" },
  { value: "TEXT", label: "متن آزاد" },
  { value: "CHECKBOX", label: "چک‌باکس" },
] as const;

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>("amenities");

  return (
    <AdminLayout
      title="تنظیمات"
      breadcrumb={<Link href="/admin">داشبورد</Link>}
      toolbar={
        <Card className="px-8 py-6 flex items-center gap-x-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              aria-pressed={tab === t.key}
              className={`px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap transition ${
                tab === t.key ? "bg-primary-main text-white" : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
              }`}
            >
              {t.label}
            </button>
          ))}
          {/* Own pages rather than tabs — each carries a lot of state. */}
          <Link
            href="/admin/settings/reservations"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            تنظیمات رزرواسیون
          </Link>
          <Link
            href="/admin/settings/locations"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            دسته‌بندی مکان‌ها
          </Link>
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
          <Link
            href="/admin/settings/wizard"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            ثبت اقامتگاه
          </Link>
        </Card>
      }
    >
      {tab === "amenities" && <AmenitiesSettings />}
      {tab === "rules" && <RulesSettings />}
      {tab === "peak" && <PeakDaysSettings />}
    </AdminLayout>
  );
}

function AmenitiesSettings() {
  const { data, isLoading, mutate } = useSWR<Amenity[]>("/api/admin/amenities", (p: string) =>
    apiFetch<Amenity[]>(p)
  );
  const [editing, setEditing] = useState<Amenity | "new" | null>(null);

  const grouped = new Map<string, Amenity[]>();
  for (const a of data ?? []) {
    const cat = a.category || "سایر";
    grouped.set(cat, [...(grouped.get(cat) ?? []), a]);
  }

  if (isLoading) return <Skeleton className="h-[300px]" />;

  return (
    <div className="flex flex-col gap-y-16">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <i className="icon-Plus text-16" /> امکانات جدید
        </Button>
      </div>

      {[...grouped.entries()].map(([category, items]) => (
        <Card key={category} className="p-20">
          <h3 className="text-16 leading-24 font-m text-black mb-12">{category}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {items.map((a) => (
              <button
                key={a.id}
                onClick={() => setEditing(a)}
                className="flex items-center gap-x-10 p-10 rounded-10 border border-gray-E5E5E6 hover:border-primary-main transition text-right"
              >
                {a.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.iconUrl} alt="" className="w-20 h-20 shrink-0 opacity-70" />
                ) : (
                  <i className="icon-Possibilities text-18 text-gray-9B9BAA shrink-0" />
                )}
                <span className="flex-1 min-w-0">
                  <span className="block text-13 leading-20 text-black truncate">{a.name}</span>
                  <span className="block text-11 text-gray-9B9BAA truncate">{a.key ?? "—"}</span>
                </span>
                {a.features.length > 0 && (
                  <Badge tone="blue">{faNum(a.features.length)} ویژگی</Badge>
                )}
              </button>
            ))}
          </div>
        </Card>
      ))}

      {!!editing && (
        <AmenityModal
          amenity={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function AmenityModal({
  amenity,
  onClose,
  onSaved,
}: {
  amenity: Amenity | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: amenity?.name ?? "",
    key: amenity?.key ?? "",
    category: amenity?.category ?? "",
    iconUrl: amenity?.iconUrl ?? "",
  });
  const [features, setFeatures] = useState<FeatureDef[]>(amenity?.features ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body = {
        name: form.name,
        key: form.key || undefined,
        category: form.category || undefined,
        iconUrl: form.iconUrl || undefined,
        features: features
          .filter((f) => f.name.trim())
          .map((f) => ({
            fieldType: f.fieldType,
            name: f.name,
            placeholder: f.placeholder || null,
            values: f.values || null,
          })),
      };
      await apiFetch(amenity ? `/api/admin/amenities/${amenity.id}` : "/api/admin/amenities", {
        method: amenity ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!amenity) return;
    await apiFetch(`/api/admin/amenities/${amenity.id}`, { method: "DELETE" });
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={amenity ? `ویرایش ${amenity.name}` : "امکانات جدید"}
      width="max-w-[640px]"
    >
      <form onSubmit={save} className="flex flex-col gap-y-12">
        <div className="grid sm:grid-cols-2 gap-12">
          <Field label="نام">
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </Field>
          <Field label="کلید انگلیسی (برای فیلترها)">
            <Input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="pool" />
          </Field>
          <Field label="دسته‌بندی">
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="امکانات"
            />
          </Field>
          <Field label="آدرس آیکون">
            <Input
              value={form.iconUrl}
              onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
              placeholder="/assets/amenity-icons/pool.svg"
            />
          </Field>
        </div>

        <div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-12 leading-18 text-gray-6C6A7D font-m">
              ویژگی‌ها (فرم «ویژگی ها» در صفحه اقامتگاه)
            </span>
            <button
              type="button"
              onClick={() =>
                setFeatures((f) => [
                  ...f,
                  { name: "", fieldType: "SWITCH", placeholder: null, values: "دارد, ندارد" },
                ])
              }
              className="text-12 font-m text-primary-dark"
            >
              + افزودن ویژگی
            </button>
          </div>
          <div className="flex flex-col gap-y-8 max-h-[240px] overflow-y-auto">
            {features.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_1fr_28px] gap-x-8 items-center">
                <Input
                  value={f.name}
                  placeholder="نام ویژگی"
                  onChange={(e) =>
                    setFeatures((l) => l.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))
                  }
                />
                <Select
                  value={f.fieldType}
                  onChange={(e) =>
                    setFeatures((l) =>
                      l.map((x, xi) => (xi === i ? { ...x, fieldType: e.target.value as FeatureDef["fieldType"] } : x))
                    )
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <Input
                  value={f.values ?? ""}
                  placeholder="گزینه‌ها با ویرگول"
                  onChange={(e) =>
                    setFeatures((l) => l.map((x, xi) => (xi === i ? { ...x, values: e.target.value } : x)))
                  }
                />
                <button
                  type="button"
                  onClick={() => setFeatures((l) => l.filter((_, xi) => xi !== i))}
                  className="w-28 h-28 rounded-8 text-[#E53935] hover:bg-[#FFEBEB]"
                  aria-label="حذف ویژگی"
                >
                  <i className="icon-Delete text-16" />
                </button>
              </div>
            ))}
            {features.length === 0 && <p className="text-12 text-gray-9B9BAA">ویژگی‌ای تعریف نشده</p>}
          </div>
        </div>

        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}

        <div className="flex items-center justify-between">
          {!!amenity && (
            <Button type="button" variant="danger" onClick={remove}>
              حذف
            </Button>
          )}
          <div className="flex items-center gap-x-10 mr-auto">
            <Button type="button" variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function RulesSettings() {
  const { data, isLoading, mutate } = useSWR<Rule[]>("/api/admin/rules", (p: string) =>
    apiFetch<Rule[]>(p)
  );
  const [editing, setEditing] = useState<Rule | "new" | null>(null);

  if (isLoading) return <Skeleton className="h-[240px]" />;

  return (
    <div className="flex flex-col gap-y-16">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <i className="icon-Plus text-16" /> قانون جدید
        </Button>
      </div>

      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-12">مقررات اقامتگاه</h3>
        {data?.length === 0 && <EmptyState text="قانونی ثبت نشده" />}
        <div className="grid sm:grid-cols-2 gap-10">
          {data?.map((r) => (
            <button
              key={r.id}
              onClick={() => setEditing(r)}
              className="flex items-center gap-x-10 p-12 rounded-10 border border-gray-E5E5E6 hover:border-primary-main transition text-right"
            >
              <i className="icon-Rules text-18 text-gray-9B9BAA shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-13 leading-20 text-black">{r.name}</span>
                <span className="block text-11 text-gray-9B9BAA">{r.key ?? "—"}</span>
              </span>
            </button>
          ))}
        </div>
      </Card>

      {!!editing && (
        <RuleModal
          rule={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function RuleModal({
  rule,
  onClose,
  onSaved,
}: {
  rule: Rule | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: rule?.name ?? "",
    key: rule?.key ?? "",
    category: rule?.category ?? "مقررات اقامتگاه",
  });
  const [saving, setSaving] = useState(false);

  return (
    <Modal open onClose={onClose} title={rule ? `ویرایش ${rule.name}` : "قانون جدید"}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            await apiFetch(rule ? `/api/admin/rules/${rule.id}` : "/api/admin/rules", {
              method: rule ? "PATCH" : "POST",
              body: JSON.stringify({
                name: form.name,
                key: form.key || undefined,
                category: form.category || undefined,
              }),
            });
            onSaved();
          } finally {
            setSaving(false);
          }
        }}
        className="flex flex-col gap-y-12"
      >
        <Field label="متن قانون">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </Field>
        <Field label="کلید انگلیسی">
          <Input
            value={form.key}
            onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
            placeholder="pets"
          />
        </Field>
        <Field label="دسته‌بندی">
          <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        </Field>
        <div className="flex items-center justify-between">
          {!!rule && (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                await apiFetch(`/api/admin/rules/${rule.id}`, { method: "DELETE" });
                onSaved();
              }}
            >
              حذف
            </Button>
          )}
          <div className="flex items-center gap-x-10 mr-auto">
            <Button type="button" variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              ذخیره
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function PeakDaysSettings() {
  const { data, isLoading, mutate } = useSWR<PeakDay[]>("/api/admin/peak-days", (p: string) =>
    apiFetch<PeakDay[]>(p)
  );
  const [editing, setEditing] = useState<PeakDay | "new" | null>(null);

  if (isLoading) return <Skeleton className="h-[240px]" />;

  return (
    <div className="flex flex-col gap-y-16">
      <div className="flex justify-end">
        <Button onClick={() => setEditing("new")}>
          <i className="icon-Plus text-16" /> بازه پیک جدید
        </Button>
      </div>

      <Card className="p-20">
        <h3 className="text-16 leading-24 font-m text-black mb-4">روزهای پیک</h3>
        <p className="text-12 leading-20 text-gray-9B9BAA mb-14">
          در این بازه‌ها «قیمت ایام پیک» و «نرخ نفر اضافه ایام پیک» هر اقامتگاه اعمال می‌شود.
        </p>

        {data?.length === 0 && <EmptyState text="بازه‌ای تعریف نشده" />}

        <div className="flex flex-col gap-y-8">
          {data?.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              className="flex items-center gap-x-12 p-12 rounded-10 border border-gray-E5E5E6 hover:border-primary-main transition text-right"
            >
              <i className="icon-CalendarFlash text-18 text-gray-9B9BAA shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-13 leading-20 text-black">{p.name}</span>
                <span className="block text-11 text-gray-6C6A7D">
                  {faDate(p.startDate)} تا {faDate(p.endDate)}
                  {p.cities.length > 0
                    ? ` · ${p.cities.map((c) => c.city.name).join("، ")}`
                    : " · سراسر کشور"}
                </span>
              </span>
              <Badge tone={p.isActive ? "green" : "gray"}>{p.isActive ? "فعال" : "غیرفعال"}</Badge>
            </button>
          ))}
        </div>
      </Card>

      {!!editing && (
        <PeakDayModal
          peakDay={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}

function PeakDayModal({
  peakDay,
  onClose,
  onSaved,
}: {
  peakDay: PeakDay | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const iso = (d: string | undefined) => (d ? d.slice(0, 10) : "");
  const [form, setForm] = useState({
    name: peakDay?.name ?? "",
    startDate: iso(peakDay?.startDate),
    endDate: iso(peakDay?.endDate),
    isActive: peakDay?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <Modal open onClose={onClose} title={peakDay ? `ویرایش ${peakDay.name}` : "بازه پیک جدید"}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setError(null);
          try {
            await apiFetch(peakDay ? `/api/admin/peak-days/${peakDay.id}` : "/api/admin/peak-days", {
              method: peakDay ? "PATCH" : "POST",
              body: JSON.stringify(form),
            });
            onSaved();
          } catch (err) {
            setError(err instanceof Error ? err.message : "خطا در ذخیره");
          } finally {
            setSaving(false);
          }
        }}
        className="flex flex-col gap-y-12"
      >
        <Field label="عنوان (مثلاً نوروز ۱۴۰۵)">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </Field>
        <div className="grid sm:grid-cols-2 gap-12">
          <Field label="از تاریخ (میلادی)">
            <Input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              required
            />
          </Field>
          <Field label="تا تاریخ (میلادی)">
            <Input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              required
            />
          </Field>
        </div>
        <label className="flex items-center gap-x-10 text-14 text-black">
          <Toggle checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          فعال
        </label>

        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}

        <div className="flex items-center justify-between">
          {!!peakDay && (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                await apiFetch(`/api/admin/peak-days/${peakDay.id}`, { method: "DELETE" });
                onSaved();
              }}
            >
              حذف
            </Button>
          )}
          <div className="flex items-center gap-x-10 mr-auto">
            <Button type="button" variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button type="submit" disabled={saving}>
              ذخیره
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
