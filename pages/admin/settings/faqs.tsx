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
  faNum,
} from "@/components/Admin/ui";

// "سوالات متداول" — one list, scoped per page family.
//
// The raw rows do not tell you what any given page ends up showing, because
// several scopes stack on one page. So the screen leads with "این صفحه چی
// نشون می‌ده؟": pick a real page and see the resolved, interpolated list in
// the order a visitor gets it.

const SCOPES = [
  { value: "GLOBAL", label: "همه‌ی صفحات", hint: "روی هر صفحه‌ای که سوالات متداول داره" },
  { value: "SEARCH", label: "همه‌ی صفحات سرچ", hint: "صفحه‌ی هر شهر و هر تگ" },
  { value: "LOCATION", label: "یک شهر مشخص", hint: "صفحه‌ی اون شهر و تگ‌هاش" },
  { value: "TAG", label: "یک تگ مشخص", hint: "اون تگ روی همه‌ی شهرها" },
  { value: "TAG_LOCATION", label: "ترکیب تگ و شهر", hint: "فقط همون یک صفحه" },
  { value: "RESIDENCE", label: "صفحات اقامتگاه", hint: "صفحه‌ی جزئیات هر اقامتگاه" },
  { value: "PAGE", label: "یک صفحه‌ی مشخص", hint: "با مسیر، مثل /rules" },
] as const;

const SCOPE_LABEL: Record<string, string> = Object.fromEntries(
  SCOPES.map((s) => [s.value, s.label])
);

const SCOPE_TONE: Record<string, "green" | "blue" | "purple" | "yellow" | "gray"> = {
  GLOBAL: "purple",
  SEARCH: "blue",
  LOCATION: "green",
  TAG: "yellow",
  TAG_LOCATION: "yellow",
  RESIDENCE: "gray",
  PAGE: "gray",
};

interface Faq {
  id: number;
  scope: string;
  locationId: number | null;
  tagId: number | null;
  path: string | null;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
  location: { id: number; name: string; titleEn: string | null } | null;
  tag: { id: number; key: string; name: string } | null;
}

interface LocationRow {
  id: number;
  name: string;
  titleEn: string | null;
  type: string;
}
interface TagRow {
  id: number;
  key: string;
  name: string;
}

export default function AdminFaqsPage() {
  const [scopeFilter, setScopeFilter] = useState("");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Faq | null>(null);
  const [creating, setCreating] = useState(false);

  const query = new URLSearchParams();
  if (scopeFilter) query.set("scope", scopeFilter);
  if (q.trim()) query.set("q", q.trim());

  const { data, isLoading, mutate } = useSWR<Faq[]>(
    `/api/admin/faqs?${query.toString()}`,
    (p: string) => apiFetch<Faq[]>(p)
  );
  const { data: locations } = useSWR<LocationRow[]>("/api/admin/locations", (p: string) =>
    apiFetch<LocationRow[]>(p)
  );
  const { data: tags } = useSWR<TagRow[]>("/api/admin/seo-tags", (p: string) =>
    apiFetch<TagRow[]>(p)
  );

  const faqs = data ?? [];
  const counts = faqs.reduce<Record<string, number>>((acc, f) => {
    acc[f.scope] = (acc[f.scope] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AdminLayout
      title="سوالات متداول"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link>
          <span className="mx-6 text-gray-B0AFBC">/</span>
          <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
      toolbar={
        <Card className="px-8 py-6 flex items-center gap-x-4 overflow-x-auto">
          {[
            { href: "/admin/settings", label: "امکانات و قوانین" },
            { href: "/admin/settings/locations", label: "دسته‌بندی مکان‌ها" },
            { href: "/admin/settings/tags", label: "تگ‌های سئو" },
            { href: "/admin/settings/sitemap", label: "sitemap و robots" },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
            >
              {t.label}
            </Link>
          ))}
          <span className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap bg-primary-main text-white">
            سوالات متداول
          </span>
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
        <PagePreview locations={locations ?? []} tags={tags ?? []} />

        <Card className="px-20 py-16">
          <p className="text-12 leading-22 text-gray-6C6A7D">
            هر سوال یک «محدوده» داره که تعیین می‌کنه کجا نشون داده بشه. محدوده‌ی خاص‌تر بالاتر از
            عام‌تر میاد — سوال مخصوص شیراز بالای سوال‌های عمومی صفحات سرچ می‌شینه. توی متن سوال و
            جواب می‌تونی از{" "}
            <span dir="ltr" className="font-m">
              {"{location}"}
            </span>
            ،{" "}
            <span dir="ltr" className="font-m">
              {"{tag}"}
            </span>{" "}
            و{" "}
            <span dir="ltr" className="font-m">
              {"{site}"}
            </span>{" "}
            استفاده کنی. اگه صفحه‌ای مقدارِ اون placeholder رو نداشته باشه، سوال روی اون صفحه اصلاً
            نشون داده نمی‌شه (به‌جای اینکه با جای خالی رندر بشه).
          </p>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-20 py-16 flex flex-wrap items-center gap-12 border-b border-gray-EFEFEF">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو در متن سوال یا جواب…"
              className="flex-1 min-w-[220px]"
            />
            <Select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              className="w-[190px]"
            >
              <option value="">همه‌ی محدوده‌ها</option>
              {SCOPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                  {counts[s.value] ? ` (${counts[s.value]})` : ""}
                </option>
              ))}
            </Select>
            <Button onClick={() => setCreating(true)}>افزودن سوال</Button>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <EmptyState text="سوالی با این فیلترها نیست." />
          ) : (
            <div className="divide-y divide-gray-F5F5F5">
              {faqs.map((f) => (
                <div key={f.id} className="px-20 py-14">
                  <div className="flex flex-wrap items-center gap-x-10 gap-y-6 mb-4">
                    <Badge tone={SCOPE_TONE[f.scope] ?? "gray"}>{SCOPE_LABEL[f.scope]}</Badge>
                    {f.location && (
                      <span className="text-11 text-gray-6C6A7D">{f.location.name}</span>
                    )}
                    {f.tag && <span className="text-11 text-gray-6C6A7D">{f.tag.name}</span>}
                    {f.path && (
                      <span dir="ltr" className="text-11 text-gray-6C6A7D font-mono">
                        {f.path}
                      </span>
                    )}
                    {!f.isActive && <Badge tone="red">غیرفعال</Badge>}
                    <div className="mr-auto flex gap-x-10">
                      <button
                        onClick={() => setEditing(f)}
                        className="text-12 text-primary-main hover:underline"
                      >
                        ویرایش
                      </button>
                      <button
                        onClick={async () => {
                          await apiFetch(`/api/admin/faqs/${f.id}`, { method: "DELETE" });
                          mutate();
                        }}
                        className="text-12 text-[#DC2626] hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  <div className="text-13 leading-22 font-m text-gray-1E1D28">{f.question}</div>
                  <div className="text-12 leading-22 text-gray-6C6A7D mt-2 line-clamp-2">
                    {f.answer}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {(editing || creating) && (
        <FaqModal
          faq={editing}
          locations={locations ?? []}
          tags={tags ?? []}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            mutate();
          }}
        />
      )}
    </AdminLayout>
  );
}

/**
 * The resolved list for a real page. This leads the screen because scopes
 * stack: reading the rows tells you what exists, not what a page renders.
 */
function PagePreview({ locations, tags }: { locations: LocationRow[]; tags: TagRow[] }) {
  const [slug, setSlug] = useState("shiraz");
  const [tag, setTag] = useState("");

  const params = new URLSearchParams({ kind: "search" });
  if (slug) params.set("slug", slug);
  if (tag) params.set("tag", tag);

  type Preview = {
    context: { locationName: string | null; tagName: string | null };
    faqs: { id: number; question: string; answer: string }[];
  };
  const { data, isLoading } = useSWR<Preview>(
    `/api/admin/faqs/preview?${params.toString()}`,
    (p: string) => apiFetch<Preview>(p)
  );

  const slugged = locations.filter((l) => l.titleEn);

  return (
    <Card className="px-20 py-18">
      <div className="text-14 leading-22 font-m text-gray-1E1D28 mb-4">این صفحه چی نشون می‌ده؟</div>
      <p className="text-12 leading-22 text-gray-6C6A7D mb-14">
        یک صفحه رو انتخاب کن تا سوال‌هاش رو دقیقاً به همون ترتیبی که کاربر می‌بینه ببینی.
      </p>

      <div className="grid md:grid-cols-2 gap-14 mb-14">
        <Field label="شهر">
          <Select value={slug} onChange={(e) => setSlug(e.target.value)}>
            <option value="">— بدون شهر (صفحه‌ی سراسری) —</option>
            {slugged.map((l) => (
              <option key={l.id} value={l.titleEn!}>
                {l.name} ({l.titleEn})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="تگ">
          <Select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">— بدون تگ —</option>
            {tags.map((t) => (
              <option key={t.id} value={t.key}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="rounded-10 bg-gray-FAFAFA px-16 py-12">
        <div dir="ltr" className="text-11 text-gray-B0AFBC mb-8 font-mono">
          /search{slug ? `/${slug}` : ""}
          {tag ? `?${tag}=1` : ""}
        </div>
        {isLoading ? (
          <Skeleton className="h-60" />
        ) : !data?.faqs.length ? (
          <div className="text-12 text-gray-6C6A7D">این صفحه هیچ سوالی نشون نمی‌ده.</div>
        ) : (
          <ol className="flex flex-col gap-y-8">
            {data.faqs.map((f, i) => (
              <li key={f.id} className="text-12 leading-22">
                <span className="text-gray-B0AFBC">{faNum(i + 1)}.</span>{" "}
                <span className="font-m text-gray-1E1D28">{f.question}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Card>
  );
}

function FaqModal({
  faq,
  locations,
  tags,
  onClose,
  onSaved,
}: {
  faq: Faq | null;
  locations: LocationRow[];
  tags: TagRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    scope: faq?.scope ?? "SEARCH",
    locationId: faq?.locationId ? String(faq.locationId) : "",
    tagId: faq?.tagId ? String(faq.tagId) : "",
    path: faq?.path ?? "",
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    isActive: faq?.isActive ?? true,
    sortOrder: faq?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsLocation = form.scope === "LOCATION" || form.scope === "TAG_LOCATION";
  const needsTag = form.scope === "TAG" || form.scope === "TAG_LOCATION";
  const needsPath = form.scope === "PAGE";
  const scopeHint = SCOPES.find((s) => s.value === form.scope)?.hint;

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(faq ? `/api/admin/faqs/${faq.id}` : "/api/admin/faqs", {
        method: faq ? "PATCH" : "POST",
        body: JSON.stringify({
          scope: form.scope,
          locationId: needsLocation ? Number(form.locationId) || null : null,
          tagId: needsTag ? Number(form.tagId) || null : null,
          path: needsPath ? form.path.trim() : null,
          question: form.question.trim(),
          answer: form.answer.trim(),
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder) || 0,
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
    <Modal
      open
      title={faq ? "ویرایش سوال" : "افزودن سوال"}
      onClose={onClose}
      width="max-w-[720px]"
    >
      <div className="flex flex-col gap-y-14">
        <Field label="محدوده‌ی نمایش" hint={scopeHint}>
          <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}>
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>

        {needsLocation && (
          <Field label="شهر">
            <Select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
            >
              <option value="">— انتخاب کن —</option>
              {locations
                .filter((l) => l.titleEn)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.titleEn})
                  </option>
                ))}
            </Select>
          </Field>
        )}

        {needsTag && (
          <Field label="تگ">
            <Select value={form.tagId} onChange={(e) => setForm({ ...form, tagId: e.target.value })}>
              <option value="">— انتخاب کن —</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {needsPath && (
          <Field label="مسیر صفحه" hint="با اسلش شروع بشه، مثل /rules">
            <Input
              dir="ltr"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="/rules"
            />
          </Field>
        )}

        <Field label="سوال" hint="می‌تونی از {location} و {tag} استفاده کنی.">
          <Input
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </Field>

        <Field label="جواب" hint="این متن به‌عنوان FAQPage در نتایج گوگل هم ممکنه نمایش داده بشه.">
          <textarea
            rows={5}
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main"
          />
        </Field>

        <div className="grid grid-cols-2 gap-14 items-end">
          <Field label="ترتیب">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <div className="pb-8">
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="فعال"
            />
          </div>
        </div>

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}

        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={save} disabled={saving || !form.question.trim() || !form.answer.trim()}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
