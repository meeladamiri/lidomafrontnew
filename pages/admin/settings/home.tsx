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
  adminImageUrl,
  faNum,
} from "@/components/Admin/ui";

// "صفحه اصلی" — the CMS Odoo used to hold (x_homepage_*).
//
// Grouped by what an editor actually changes together rather than by table:
// the hero and its SEO, then the section headings, then each family of blocks.

const TABS = [
  { key: "hero", label: "هدر و سئو" },
  { key: "sections", label: "عنوان بخش‌ها" },
  { key: "blocks", label: "بنر، اسلایدر و باکس‌ها" },
  { key: "extras", label: "اپلیکیشن، ویدیو و سرچ" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

interface Settings {
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroTitleMobile: string | null;
  heroSubtitleMobile: string | null;
  heroImageUrl: string | null;
  heroImageMobileUrl: string | null;
  pcTitleColor: string | null;
  pcSubtitleColor: string | null;
  pcTitleSize: number | null;
  pcSubtitleSize: number | null;
  mobileTitleColor: string | null;
  mobileSubtitleColor: string | null;
  mobileTitleSize: number | null;
  mobileSubtitleSize: number | null;
  searchBackground: string | null;
  searchBorderColor: string | null;
  h1: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  appEnabled: boolean;
  appTitle: string | null;
  appSubtitle: string | null;
  appImageUrl: string | null;
  appBazaarUrl: string | null;
  appMyketUrl: string | null;
  appSibappUrl: string | null;
  appDirectUrl: string | null;
  videoEnabled: boolean;
  videoTitle: string | null;
  videoDescription: string | null;
  videoUrl: string | null;
  videoPosterUrl: string | null;
}

interface Section {
  key: string;
  label: string;
  title: string | null;
  subtitle: string | null;
  headingLevel: number;
  isEnabled: boolean;
  sortOrder: number;
}

interface Block {
  id: number;
  name?: string;
  title?: string | null;
  subtitle?: string | null;
  label?: string;
  href?: string;
  link?: string | null;
  contentHtml?: string | null;
  pcImageUrl?: string | null;
  mobileImageUrl?: string | null;
  imageUrl?: string | null;
  iconUrl?: string | null;
  authorName?: string | null;
  alt?: string | null;
  showInMobile?: boolean;
  headingLevel?: number;
  isActive: boolean;
  sortOrder: number;
}

interface HomeData {
  settings: Settings | null;
  sections: Section[];
  banners: Block[];
  descSections: Block[];
  types: Block[];
  sliders: Block[];
  trustBoxes: Block[];
  articles: Block[];
  suggestions: Block[];
}

export default function AdminHomePage() {
  const [tab, setTab] = useState<TabKey>("hero");
  const { data, isLoading, mutate } = useSWR<HomeData>("/api/admin/home", (p: string) =>
    apiFetch<HomeData>(p)
  );

  return (
    <AdminLayout
      title="صفحه اصلی"
      breadcrumb={
        <>
          <Link href="/admin">داشبورد</Link>
          <span className="mx-6 text-gray-B0AFBC">/</span>
          <Link href="/admin/settings">تنظیمات</Link>
        </>
      }
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
        </Card>
      }
    >
      {isLoading || !data ? (
        <div className="flex flex-col gap-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-y-16">
          {tab === "hero" && <HeroTab settings={data.settings} onSaved={() => mutate()} />}
          {tab === "sections" && <SectionsTab sections={data.sections} onSaved={() => mutate()} />}
          {tab === "blocks" && <BlocksTab data={data} onSaved={() => mutate()} />}
          {tab === "extras" && <ExtrasTab data={data} onSaved={() => mutate()} />}
        </div>
      )}
    </AdminLayout>
  );
}

function useSaver(url: string, onSaved: () => void) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (body: any, method: "PATCH" | "POST" | "DELETE" = "PATCH") => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(url, { method, ...(method === "DELETE" ? {} : { body: JSON.stringify(body) }) });
      onSaved();
      return true;
    } catch (e: any) {
      setError(e?.message ?? "ذخیره نشد.");
      return false;
    } finally {
      setSaving(false);
    }
  };
  return { save, saving, error };
}

function HeroTab({ settings, onSaved }: { settings: Settings | null; onSaved: () => void }) {
  const s = settings ?? ({} as Settings);
  const [form, setForm] = useState({
    heroTitle: s.heroTitle ?? "",
    heroSubtitle: s.heroSubtitle ?? "",
    heroTitleMobile: s.heroTitleMobile ?? "",
    heroSubtitleMobile: s.heroSubtitleMobile ?? "",
    h1: s.h1 ?? "",
    metaTitle: s.metaTitle ?? "",
    metaDescription: s.metaDescription ?? "",
    metaKeywords: s.metaKeywords ?? "",
    pcTitleColor: s.pcTitleColor ?? "",
    pcSubtitleColor: s.pcSubtitleColor ?? "",
    pcTitleSize: s.pcTitleSize ?? "",
    pcSubtitleSize: s.pcSubtitleSize ?? "",
    mobileTitleColor: s.mobileTitleColor ?? "",
    mobileSubtitleColor: s.mobileSubtitleColor ?? "",
    mobileTitleSize: s.mobileTitleSize ?? "",
    mobileSubtitleSize: s.mobileSubtitleSize ?? "",
    searchBackground: s.searchBackground ?? "",
    searchBorderColor: s.searchBorderColor ?? "",
    heroImageUrl: s.heroImageUrl ?? "",
    heroImageMobileUrl: s.heroImageMobileUrl ?? "",
  });
  const { save, saving, error } = useSaver("/api/admin/home/settings", onSaved);

  const num = (v: any) => (v === "" ? null : Number(v));
  const str = (v: string) => (v.trim() ? v.trim() : null);

  const titleLen = form.metaTitle.trim().length;
  const descLen = form.metaDescription.trim().length;

  return (
    <>
      <Card className="px-20 py-18">
        <div className="text-14 leading-22 font-m text-gray-1E1D28 mb-14">هدر صفحه</div>
        <div className="grid md:grid-cols-2 gap-14">
          <Field label="عنوان دسکتاپ">
            <Input value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
          </Field>
          <Field label="عنوان موبایل" hint="اودو برای موبایل عنوان کوتاه‌تری نگه می‌داشت.">
            <Input
              value={form.heroTitleMobile}
              onChange={(e) => setForm({ ...form, heroTitleMobile: e.target.value })}
            />
          </Field>
          <Field label="زیرعنوان دسکتاپ">
            <Input
              value={form.heroSubtitle}
              onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
            />
          </Field>
          <Field label="زیرعنوان موبایل">
            <Input
              value={form.heroSubtitleMobile}
              onChange={(e) => setForm({ ...form, heroSubtitleMobile: e.target.value })}
            />
          </Field>
          <Field label="تصویر هدر دسکتاپ" hint="آدرس تصویر">
            <Input dir="ltr" value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} />
          </Field>
          <Field label="تصویر هدر موبایل">
            <Input
              dir="ltr"
              value={form.heroImageMobileUrl}
              onChange={(e) => setForm({ ...form, heroImageMobileUrl: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card className="px-20 py-18">
        <div className="text-14 leading-22 font-m text-gray-1E1D28 mb-4">سئو</div>
        <p className="text-11 leading-20 text-gray-B0AFBC mb-14">
          H1 از عنوان هدر جداست: متنی که کاربر می‌بینه و تنها H1 صفحه همیشه یک جمله نیستن، و H1 چیزیه
          که گوگل می‌خونه. خالی بذاری، عنوان هدر جاش می‌شینه.
        </p>
        <div className="flex flex-col gap-y-14">
          <Field label="H1 صفحه">
            <Input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} />
          </Field>
          <Field
            label="meta title"
            hint={`${faNum(titleLen)} کاراکتر${titleLen > 60 ? " — از ۶۰ بیشتره، گوگل کوتاهش می‌کنه." : ""}`}
          >
            <Input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
          </Field>
          <Field
            label="meta description"
            hint={`${faNum(descLen)} کاراکتر${descLen > 160 ? " — از ۱۶۰ بیشتره." : ""}`}
          >
            <textarea
              rows={3}
              value={form.metaDescription}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main"
            />
          </Field>
          <Field label="meta keywords">
            <Input value={form.metaKeywords} onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card className="px-20 py-18">
        <div className="text-14 leading-22 font-m text-gray-1E1D28 mb-14">ظاهر هدر</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-14">
          {[
            ["pcTitleColor", "رنگ عنوان دسکتاپ"],
            ["pcSubtitleColor", "رنگ زیرعنوان دسکتاپ"],
            ["mobileTitleColor", "رنگ عنوان موبایل"],
            ["mobileSubtitleColor", "رنگ زیرعنوان موبایل"],
            ["searchBackground", "پس‌زمینه سرچ‌باکس"],
            ["searchBorderColor", "حاشیه سرچ‌باکس"],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <Input
                dir="ltr"
                value={(form as any)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </Field>
          ))}
          {[
            ["pcTitleSize", "سایز عنوان دسکتاپ"],
            ["pcSubtitleSize", "سایز زیرعنوان دسکتاپ"],
            ["mobileTitleSize", "سایز عنوان موبایل"],
            ["mobileSubtitleSize", "سایز زیرعنوان موبایل"],
          ].map(([k, label]) => (
            <Field key={k} label={label}>
              <Input
                type="number"
                value={(form as any)[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              />
            </Field>
          ))}
        </div>

        {error && <p className="text-12 leading-20 text-[#DC2626] mt-10">{error}</p>}
        <div className="flex justify-end mt-14">
          <Button
            disabled={saving}
            onClick={() =>
              save({
                heroTitle: str(form.heroTitle),
                heroSubtitle: str(form.heroSubtitle),
                heroTitleMobile: str(form.heroTitleMobile),
                heroSubtitleMobile: str(form.heroSubtitleMobile),
                heroImageUrl: str(form.heroImageUrl),
                heroImageMobileUrl: str(form.heroImageMobileUrl),
                h1: str(form.h1),
                metaTitle: str(form.metaTitle),
                metaDescription: str(form.metaDescription),
                metaKeywords: str(form.metaKeywords),
                pcTitleColor: str(form.pcTitleColor),
                pcSubtitleColor: str(form.pcSubtitleColor),
                pcTitleSize: num(form.pcTitleSize),
                pcSubtitleSize: num(form.pcSubtitleSize),
                mobileTitleColor: str(form.mobileTitleColor),
                mobileSubtitleColor: str(form.mobileSubtitleColor),
                mobileTitleSize: num(form.mobileTitleSize),
                mobileSubtitleSize: num(form.mobileSubtitleSize),
                searchBackground: str(form.searchBackground),
                searchBorderColor: str(form.searchBorderColor),
              })
            }
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </Card>
    </>
  );
}

function SectionsTab({ sections, onSaved }: { sections: Section[]; onSaved: () => void }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-20 py-16 border-b border-gray-EFEFEF">
        <div className="text-14 leading-22 font-m text-gray-1E1D28">عنوان بخش‌ها</div>
        <p className="text-11 leading-20 text-gray-B0AFBC mt-4">
          صفحه فقط یک H1 داره (هدر)، پس عنوان هر بخش H2 یا پایین‌تره. سطح رو فقط وقتی H3 کن که بخش
          واقعاً زیرمجموعه‌ی بخش بالاییشه.
        </p>
      </div>
      <div className="divide-y divide-gray-F5F5F5">
        {sections.map((s) => (
          <SectionRow key={s.key} section={s} onSaved={onSaved} />
        ))}
      </div>
    </Card>
  );
}

function SectionRow({ section, onSaved }: { section: Section; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    headingLevel: section.headingLevel,
    isEnabled: section.isEnabled,
  });
  const [dirty, setDirty] = useState(false);
  const { save, saving } = useSaver(`/api/admin/home/sections/${section.key}`, onSaved);
  const set = (p: Partial<typeof form>) => {
    setForm({ ...form, ...p });
    setDirty(true);
  };

  return (
    <div className="px-20 py-14">
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8 mb-10">
        <Toggle checked={form.isEnabled} onChange={(v) => set({ isEnabled: v })} />
        <span className="text-13 leading-22 font-m text-gray-1E1D28">{section.label}</span>
        <span dir="ltr" className="text-11 text-gray-B0AFBC">
          {section.key}
        </span>
        {dirty && (
          <Button
            className="mr-auto"
            disabled={saving}
            onClick={async () => {
              const okDone = await save({
                title: form.title.trim() || null,
                subtitle: form.subtitle.trim() || null,
                headingLevel: Number(form.headingLevel),
                isEnabled: form.isEnabled,
              });
              if (okDone) setDirty(false);
            }}
          >
            {saving ? "…" : "ذخیره"}
          </Button>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-12">
        <Field label="عنوان">
          <Input value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="زیرعنوان">
          <Input value={form.subtitle} onChange={(e) => set({ subtitle: e.target.value })} />
        </Field>
        <Field label="سطح تیتر">
          <Select
            value={String(form.headingLevel)}
            onChange={(e) => set({ headingLevel: Number(e.target.value) })}
          >
            <option value="2">H2</option>
            <option value="3">H3</option>
            <option value="4">H4</option>
          </Select>
        </Field>
      </div>
    </div>
  );
}

const BLOCK_KINDS = [
  { key: "banners", label: "بنرها", endpoint: "banners", img: "pcImageUrl" },
  { key: "sliders", label: "پیشنهادات فصل", endpoint: "sliders", img: "imageUrl" },
  { key: "types", label: "نوع اقامتگاه", endpoint: "types", img: "imageUrl" },
  { key: "trustBoxes", label: "چرا ما", endpoint: "trust-boxes", img: "iconUrl" },
  { key: "descSections", label: "ناحیه‌های متنی", endpoint: "desc-sections", img: "pcImageUrl" },
  { key: "articles", label: "مقالات", endpoint: "articles", img: "imageUrl" },
] as const;

function BlocksTab({ data, onSaved }: { data: HomeData; onSaved: () => void }) {
  const [editing, setEditing] = useState<{ kind: string; endpoint: string; row: Block | null } | null>(
    null
  );

  return (
    <>
      {BLOCK_KINDS.map((k) => {
        const rows = (data as any)[k.key] as Block[];
        return (
          <Card key={k.key} className="p-0 overflow-hidden">
            <div className="px-20 py-16 flex items-center justify-between border-b border-gray-EFEFEF">
              <span className="text-13 leading-22 font-m text-gray-1E1D28">
                {k.label} <span className="text-gray-B0AFBC">({faNum(rows.length)})</span>
              </span>
              <Button onClick={() => setEditing({ kind: k.key, endpoint: k.endpoint, row: null })}>
                افزودن
              </Button>
            </div>
            {rows.length === 0 ? (
              <EmptyState text="موردی نیست." />
            ) : (
              <div className="divide-y divide-gray-F5F5F5">
                {rows.map((r) => {
                  const img = (r as any)[k.img] as string | null;
                  return (
                    <div key={r.id} className="px-20 py-12 flex items-center gap-x-12">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={adminImageUrl(img, 96)}
                          alt=""
                          className="w-48 h-32 object-cover rounded-8 bg-gray-F5F5F5 shrink-0"
                        />
                      ) : (
                        <div className="w-48 h-32 rounded-8 bg-gray-F5F5F5 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-13 leading-20 font-m text-gray-1E1D28 truncate">
                          {r.title || r.name || r.label || "—"}
                        </div>
                        {(r.subtitle || r.link || r.href) && (
                          <div dir="auto" className="text-11 text-gray-B0AFBC truncate">
                            {r.subtitle || r.link || r.href}
                          </div>
                        )}
                      </div>
                      {!r.isActive && <Badge tone="red">غیرفعال</Badge>}
                      <div className="mr-auto flex gap-x-10 shrink-0">
                        <button
                          onClick={() => setEditing({ kind: k.key, endpoint: k.endpoint, row: r })}
                          className="text-12 text-primary-main hover:underline"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={async () => {
                            await apiFetch(`/api/admin/home/${k.endpoint}/${r.id}`, { method: "DELETE" });
                            onSaved();
                          }}
                          className="text-12 text-[#DC2626] hover:underline"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}

      {editing && (
        <BlockModal
          kind={editing.kind}
          endpoint={editing.endpoint}
          row={editing.row}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            onSaved();
          }}
        />
      )}
    </>
  );
}

function BlockModal({
  kind,
  endpoint,
  row,
  onClose,
  onSaved,
}: {
  kind: string;
  endpoint: string;
  row: Block | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>({
    name: row?.name ?? "",
    title: row?.title ?? "",
    subtitle: row?.subtitle ?? "",
    link: row?.link ?? "",
    contentHtml: row?.contentHtml ?? "",
    pcImageUrl: row?.pcImageUrl ?? "",
    mobileImageUrl: row?.mobileImageUrl ?? "",
    imageUrl: row?.imageUrl ?? "",
    iconUrl: row?.iconUrl ?? "",
    authorName: row?.authorName ?? "",
    alt: row?.alt ?? "",
    showInMobile: row?.showInMobile ?? true,
    headingLevel: row?.headingLevel ?? 2,
    isActive: row?.isActive ?? true,
    sortOrder: row?.sortOrder ?? 0,
  });
  const { save, saving, error } = useSaver(
    row ? `/api/admin/home/${endpoint}/${row.id}` : `/api/admin/home/${endpoint}`,
    onSaved
  );

  const str = (v: string) => (v?.trim() ? v.trim() : null);
  const has = (f: string) =>
    ({
      banners: ["name", "link", "pcImageUrl", "mobileImageUrl", "alt"],
      sliders: ["title", "link", "imageUrl", "alt"],
      types: ["title", "subtitle", "link", "imageUrl", "alt", "showInMobile"],
      trustBoxes: ["title", "subtitle", "iconUrl", "alt"],
      descSections: ["title", "contentHtml", "pcImageUrl", "mobileImageUrl", "alt", "headingLevel"],
      articles: ["title", "link", "imageUrl", "authorName", "alt"],
    }[kind] ?? []).includes(f);

  const body: any = { isActive: form.isActive, sortOrder: Number(form.sortOrder) || 0 };
  for (const f of ["name", "title", "subtitle", "link", "contentHtml", "pcImageUrl", "mobileImageUrl", "imageUrl", "iconUrl", "authorName", "alt"]) {
    if (has(f)) body[f] = str(form[f]);
  }
  if (has("showInMobile")) body.showInMobile = form.showInMobile;
  if (has("headingLevel")) body.headingLevel = Number(form.headingLevel);

  return (
    <Modal open title={row ? "ویرایش" : "افزودن"} onClose={onClose} width="max-w-[680px]">
      <div className="flex flex-col gap-y-14">
        {has("name") && (
          <Field label="نام">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        )}
        {has("title") && (
          <Field label="عنوان">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
        )}
        {has("subtitle") && (
          <Field label="زیرعنوان">
            <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </Field>
        )}
        {has("authorName") && (
          <Field label="نویسنده">
            <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
          </Field>
        )}
        {has("contentHtml") && (
          <Field label="متن" hint="HTML مجازه.">
            <textarea
              rows={6}
              value={form.contentHtml}
              onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
              className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main font-mono"
            />
          </Field>
        )}
        {has("link") && (
          <Field label="لینک" hint="لینک‌های قدیمی سرور-ساید به مقصد نهایی resolve می‌شن.">
            <Input dir="ltr" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </Field>
        )}
        {["pcImageUrl", "mobileImageUrl", "imageUrl", "iconUrl"].map((f) =>
          has(f) ? (
            <Field
              key={f}
              label={
                { pcImageUrl: "تصویر دسکتاپ", mobileImageUrl: "تصویر موبایل", imageUrl: "تصویر", iconUrl: "آیکن" }[f]!
              }
            >
              <Input dir="ltr" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
            </Field>
          ) : null
        )}
        {has("alt") && (
          <Field label="متن جایگزین تصویر (alt)" hint="برای دسترس‌پذیری و سئوی تصویر لازمه.">
            <Input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
          </Field>
        )}
        {has("headingLevel") && (
          <Field label="سطح تیتر">
            <Select
              value={String(form.headingLevel)}
              onChange={(e) => setForm({ ...form, headingLevel: e.target.value })}
            >
              <option value="2">H2</option>
              <option value="3">H3</option>
            </Select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-14 items-end">
          <Field label="ترتیب">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
          </Field>
          <div className="pb-8 flex flex-col gap-y-8">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="فعال" />
            {has("showInMobile") && (
              <Toggle
                checked={form.showInMobile}
                onChange={(v) => setForm({ ...form, showInMobile: v })}
                label="نمایش در موبایل"
              />
            )}
          </div>
        </div>

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}
        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button disabled={saving} onClick={() => save(body, row ? "PATCH" : "POST")}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ExtrasTab({ data, onSaved }: { data: HomeData; onSaved: () => void }) {
  const s = data.settings ?? ({} as Settings);
  const [form, setForm] = useState({
    appEnabled: s.appEnabled ?? false,
    appTitle: s.appTitle ?? "",
    appSubtitle: s.appSubtitle ?? "",
    appImageUrl: s.appImageUrl ?? "",
    appBazaarUrl: s.appBazaarUrl ?? "",
    appMyketUrl: s.appMyketUrl ?? "",
    appSibappUrl: s.appSibappUrl ?? "",
    appDirectUrl: s.appDirectUrl ?? "",
    videoEnabled: s.videoEnabled ?? false,
    videoTitle: s.videoTitle ?? "",
    videoDescription: s.videoDescription ?? "",
    videoUrl: s.videoUrl ?? "",
    videoPosterUrl: s.videoPosterUrl ?? "",
  });
  const { save, saving, error } = useSaver("/api/admin/home/settings", onSaved);
  const str = (v: string) => (v.trim() ? v.trim() : null);
  const [addingSuggestion, setAddingSuggestion] = useState(false);

  return (
    <>
      <Card className="px-20 py-18">
        <div className="flex items-center gap-x-12 mb-4">
          <Toggle checked={form.appEnabled} onChange={(v) => setForm({ ...form, appEnabled: v })} />
          <span className="text-14 leading-22 font-m text-gray-1E1D28">بخش اپلیکیشن</span>
        </div>
        <p className="text-11 leading-20 text-gray-B0AFBC mb-14">
          این بخش توی اودو وجود نداشت — از صفر ساخته شده، پس محتواش رو باید خودت پر کنی. تا وقتی
          خاموشه، روی صفحه نمایش داده نمی‌شه.
        </p>
        <div className="grid md:grid-cols-2 gap-14">
          <Field label="عنوان">
            <Input value={form.appTitle} onChange={(e) => setForm({ ...form, appTitle: e.target.value })} />
          </Field>
          <Field label="زیرعنوان">
            <Input value={form.appSubtitle} onChange={(e) => setForm({ ...form, appSubtitle: e.target.value })} />
          </Field>
          <Field label="تصویر">
            <Input dir="ltr" value={form.appImageUrl} onChange={(e) => setForm({ ...form, appImageUrl: e.target.value })} />
          </Field>
          <Field label="لینک دانلود مستقیم">
            <Input dir="ltr" value={form.appDirectUrl} onChange={(e) => setForm({ ...form, appDirectUrl: e.target.value })} />
          </Field>
          <Field label="بازار">
            <Input dir="ltr" value={form.appBazaarUrl} onChange={(e) => setForm({ ...form, appBazaarUrl: e.target.value })} />
          </Field>
          <Field label="مایکت">
            <Input dir="ltr" value={form.appMyketUrl} onChange={(e) => setForm({ ...form, appMyketUrl: e.target.value })} />
          </Field>
          <Field label="سیب‌اپ">
            <Input dir="ltr" value={form.appSibappUrl} onChange={(e) => setForm({ ...form, appSibappUrl: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card className="px-20 py-18">
        <div className="flex items-center gap-x-12 mb-4">
          <Toggle checked={form.videoEnabled} onChange={(v) => setForm({ ...form, videoEnabled: v })} />
          <span className="text-14 leading-22 font-m text-gray-1E1D28">ویدیو معرفی</span>
        </div>
        <p className="text-11 leading-20 text-gray-B0AFBC mb-14">
          این هم توی اودو نبود. لینک آپارات یا فایل ویدیو رو بذار.
        </p>
        <div className="grid md:grid-cols-2 gap-14">
          <Field label="عنوان">
            <Input value={form.videoTitle} onChange={(e) => setForm({ ...form, videoTitle: e.target.value })} />
          </Field>
          <Field label="لینک ویدیو">
            <Input dir="ltr" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
          </Field>
          <Field label="تصویر پوستر" hint="تا قبل از پخش نشون داده می‌شه؛ برای LCP مهمه.">
            <Input dir="ltr" value={form.videoPosterUrl} onChange={(e) => setForm({ ...form, videoPosterUrl: e.target.value })} />
          </Field>
        </div>
        <Field label="توضیحات" className="mt-14">
          <textarea
            rows={3}
            value={form.videoDescription}
            onChange={(e) => setForm({ ...form, videoDescription: e.target.value })}
            className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main"
          />
        </Field>

        {error && <p className="text-12 leading-20 text-[#DC2626] mt-10">{error}</p>}
        <div className="flex justify-end mt-14">
          <Button
            disabled={saving}
            onClick={() =>
              save({
                appEnabled: form.appEnabled,
                appTitle: str(form.appTitle),
                appSubtitle: str(form.appSubtitle),
                appImageUrl: str(form.appImageUrl),
                appBazaarUrl: str(form.appBazaarUrl),
                appMyketUrl: str(form.appMyketUrl),
                appSibappUrl: str(form.appSibappUrl),
                appDirectUrl: str(form.appDirectUrl),
                videoEnabled: form.videoEnabled,
                videoTitle: str(form.videoTitle),
                videoDescription: str(form.videoDescription),
                videoUrl: str(form.videoUrl),
                videoPosterUrl: str(form.videoPosterUrl),
              })
            }
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-20 py-16 flex items-center justify-between border-b border-gray-EFEFEF">
          <div>
            <span className="text-13 leading-22 font-m text-gray-1E1D28">پیشنهادهای سرچ‌باکس</span>
            <p className="text-11 leading-20 text-gray-B0AFBC mt-2">
              چیپس‌های زیر جعبه‌ی جستجو. توی اودو نبود.
            </p>
          </div>
          <Button onClick={() => setAddingSuggestion(true)}>افزودن</Button>
        </div>
        {data.suggestions.length === 0 ? (
          <EmptyState text="پیشنهادی تعریف نشده." />
        ) : (
          <div className="divide-y divide-gray-F5F5F5">
            {data.suggestions.map((s) => (
              <div key={s.id} className="px-20 py-12 flex items-center gap-x-12">
                <span className="text-13 text-gray-1E1D28">{s.label}</span>
                <span dir="ltr" className="text-11 text-gray-B0AFBC">
                  {s.href}
                </span>
                {!s.isActive && <Badge tone="red">غیرفعال</Badge>}
                <button
                  onClick={async () => {
                    await apiFetch(`/api/admin/home/suggestions/${s.id}`, { method: "DELETE" });
                    onSaved();
                  }}
                  className="mr-auto text-12 text-[#DC2626] hover:underline"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {addingSuggestion && (
        <SuggestionModal
          onClose={() => setAddingSuggestion(false)}
          onSaved={() => {
            setAddingSuggestion(false);
            onSaved();
          }}
        />
      )}
    </>
  );
}

function SuggestionModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ label: "", href: "", sortOrder: 0 });
  const { save, saving, error } = useSaver("/api/admin/home/suggestions", onSaved);

  return (
    <Modal open title="افزودن پیشنهاد سرچ" onClose={onClose}>
      <div className="flex flex-col gap-y-14">
        <Field label="متن">
          <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </Field>
        <Field label="لینک" hint="مثل /search/shiraz?pool=1">
          <Input dir="ltr" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} />
        </Field>
        <Field label="ترتیب">
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
          />
        </Field>
        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}
        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            disabled={saving || !form.label.trim() || !form.href.trim()}
            onClick={() =>
              save(
                { label: form.label.trim(), href: form.href.trim(), sortOrder: Number(form.sortOrder) || 0 },
                "POST"
              )
            }
          >
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
