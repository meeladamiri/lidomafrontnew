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
  { key: "rails", label: "اسلایدرها" },
  { key: "sections", label: "عنوان بخش‌ها" },
  { key: "blocks", label: "بنر، اسلایدر و باکس‌ها" },
  { key: "extras", label: "اپلیکیشن، ویدیو و سرچ" },
  { key: "faqs", label: "سوالات متداول" },
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

interface RailItem {
  id: number;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  alt: string | null;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
}

interface Rail {
  id: number;
  kind: "RESIDENCE" | "DESTINATION";
  title: string | null;
  subtitle: string | null;
  headingLevel: number;
  sourceType: string | null;
  sourceSlug: string | null;
  take: number;
  linkTo: string | null;
  isEnabled: boolean;
  sortOrder: number;
  items: RailItem[];
}

interface RailSources {
  cities: { slug: string; name: string; type: string; count: number }[];
  tags: { slug: string; name: string }[];
  types: { slug: string; name: string }[];
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
  rails: Rail[];
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
                tab === t.key
                  ? "bg-primary-main text-white"
                  : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
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
          {tab === "rails" && <RailsTab rails={data.rails ?? []} onSaved={() => mutate()} />}
          {tab === "sections" && <SectionsTab sections={data.sections} onSaved={() => mutate()} />}
          {tab === "blocks" && <BlocksTab data={data} onSaved={() => mutate()} />}
          {tab === "extras" && <ExtrasTab data={data} onSaved={() => mutate()} />}
          {tab === "faqs" && <HomeFaqsTab />}
        </div>
      )}
    </AdminLayout>
  );
}

/**
 * The save control for a whole tab.
 *
 * Each of these tabs is one form spread over several cards, but the button used
 * to sit at the bottom of the last card only — so editing the header fields at
 * the top looked like a screen with no way to save. It sticks to the bottom of
 * the viewport instead, and says what it is saving.
 */
function SaveBar({
  onSave,
  saving,
  error,
  hint,
}: {
  onSave: () => void;
  saving: boolean;
  error: string | null;
  hint?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 px-4 pb-4 pt-2">
      <Card className="px-20 py-12 flex items-center gap-x-12 shadow-[0_-4px_16px_-6px_rgba(24,39,75,0.18)]">
        <div className="min-w-0">
          {error ? (
            <p className="text-12 leading-20 text-[#DC2626]">{error}</p>
          ) : (
            <p className="text-11 leading-20 text-gray-B0AFBC">
              {hint ?? "همه‌ی فیلدهای این تب با هم ذخیره می‌شن."}
            </p>
          )}
        </div>
        <Button className="mr-auto shrink-0" disabled={saving} onClick={onSave}>
          {saving ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </Button>
      </Card>
    </div>
  );
}

function useSaver(url: string, onSaved: () => void) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async (body: any, method: "PATCH" | "POST" | "DELETE" = "PATCH") => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(url, {
        method,
        ...(method === "DELETE" ? {} : { body: JSON.stringify(body) }),
      });
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
            <Input
              value={form.heroTitle}
              onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
            />
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
            <Input
              dir="ltr"
              value={form.heroImageUrl}
              onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
            />
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
          H1 از عنوان هدر جداست: متنی که کاربر می‌بینه و تنها H1 صفحه همیشه یک جمله نیستن، و H1
          چیزیه که گوگل می‌خونه. خالی بذاری، عنوان هدر جاش می‌شینه.
        </p>
        <div className="flex flex-col gap-y-14">
          <Field label="H1 صفحه">
            <Input value={form.h1} onChange={(e) => setForm({ ...form, h1: e.target.value })} />
          </Field>
          <Field
            label="meta title"
            hint={`${faNum(titleLen)} کاراکتر${
              titleLen > 60 ? " — از ۶۰ بیشتره، گوگل کوتاهش می‌کنه." : ""
            }`}
          >
            <Input
              value={form.metaTitle}
              onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
            />
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
            <Input
              value={form.metaKeywords}
              onChange={(e) => setForm({ ...form, metaKeywords: e.target.value })}
            />
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
      </Card>

      <SaveBar
        saving={saving}
        error={error}
        onSave={() =>
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
      />
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
  const [editing, setEditing] = useState<{
    kind: string;
    endpoint: string;
    row: Block | null;
  } | null>(null);

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
                            await apiFetch(`/api/admin/home/${k.endpoint}/${r.id}`, {
                              method: "DELETE",
                            });
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
    ((
      {
        banners: ["name", "link", "pcImageUrl", "mobileImageUrl", "alt"],
        sliders: ["title", "link", "imageUrl", "alt"],
        types: ["title", "subtitle", "link", "imageUrl", "alt", "showInMobile"],
        trustBoxes: ["title", "subtitle", "iconUrl", "alt"],
        descSections: [
          "title",
          "contentHtml",
          "pcImageUrl",
          "mobileImageUrl",
          "alt",
          "headingLevel",
        ],
        articles: ["title", "link", "imageUrl", "authorName", "alt"],
      }[kind] ?? []
    ).includes(f));

  const body: any = { isActive: form.isActive, sortOrder: Number(form.sortOrder) || 0 };
  for (const f of [
    "name",
    "title",
    "subtitle",
    "link",
    "contentHtml",
    "pcImageUrl",
    "mobileImageUrl",
    "imageUrl",
    "iconUrl",
    "authorName",
    "alt",
  ]) {
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
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
        )}
        {has("subtitle") && (
          <Field label="زیرعنوان">
            <Input
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />
          </Field>
        )}
        {has("authorName") && (
          <Field label="نویسنده">
            <Input
              value={form.authorName}
              onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            />
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
            <Input
              dir="ltr"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </Field>
        )}
        {["pcImageUrl", "mobileImageUrl", "imageUrl", "iconUrl"].map((f) =>
          has(f) ? (
            <Field
              key={f}
              label={
                {
                  pcImageUrl: "تصویر دسکتاپ",
                  mobileImageUrl: "تصویر موبایل",
                  imageUrl: "تصویر",
                  iconUrl: "آیکن",
                }[f]!
              }
            >
              <Input
                dir="ltr"
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              />
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
            <Toggle
              checked={form.isActive}
              onChange={(v) => setForm({ ...form, isActive: v })}
              label="فعال"
            />
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
            <Input
              value={form.appTitle}
              onChange={(e) => setForm({ ...form, appTitle: e.target.value })}
            />
          </Field>
          <Field label="زیرعنوان">
            <Input
              value={form.appSubtitle}
              onChange={(e) => setForm({ ...form, appSubtitle: e.target.value })}
            />
          </Field>
          <Field label="تصویر">
            <Input
              dir="ltr"
              value={form.appImageUrl}
              onChange={(e) => setForm({ ...form, appImageUrl: e.target.value })}
            />
          </Field>
          <Field label="لینک دانلود مستقیم">
            <Input
              dir="ltr"
              value={form.appDirectUrl}
              onChange={(e) => setForm({ ...form, appDirectUrl: e.target.value })}
            />
          </Field>
          <Field label="بازار">
            <Input
              dir="ltr"
              value={form.appBazaarUrl}
              onChange={(e) => setForm({ ...form, appBazaarUrl: e.target.value })}
            />
          </Field>
          <Field label="مایکت">
            <Input
              dir="ltr"
              value={form.appMyketUrl}
              onChange={(e) => setForm({ ...form, appMyketUrl: e.target.value })}
            />
          </Field>
          <Field label="سیب‌اپ">
            <Input
              dir="ltr"
              value={form.appSibappUrl}
              onChange={(e) => setForm({ ...form, appSibappUrl: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      <Card className="px-20 py-18">
        <div className="flex items-center gap-x-12 mb-4">
          <Toggle
            checked={form.videoEnabled}
            onChange={(v) => setForm({ ...form, videoEnabled: v })}
          />
          <span className="text-14 leading-22 font-m text-gray-1E1D28">ویدیو معرفی</span>
        </div>
        <p className="text-11 leading-20 text-gray-B0AFBC mb-14">
          این هم توی اودو نبود. لینک آپارات یا فایل ویدیو رو بذار.
        </p>
        <div className="grid md:grid-cols-2 gap-14">
          <Field label="عنوان">
            <Input
              value={form.videoTitle}
              onChange={(e) => setForm({ ...form, videoTitle: e.target.value })}
            />
          </Field>
          <Field label="لینک ویدیو">
            <Input
              dir="ltr"
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
            />
          </Field>
          <Field label="تصویر پوستر" hint="تا قبل از پخش نشون داده می‌شه؛ برای LCP مهمه.">
            <Input
              dir="ltr"
              value={form.videoPosterUrl}
              onChange={(e) => setForm({ ...form, videoPosterUrl: e.target.value })}
            />
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
      </Card>

      <SaveBar
        saving={saving}
        error={error}
        hint="بخش اپلیکیشن و ویدیو با هم ذخیره می‌شن. پیشنهادهای سرچ جداگانه‌ن."
        onSave={() =>
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
      />

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
          <Input
            dir="ltr"
            value={form.href}
            onChange={(e) => setForm({ ...form, href: e.target.value })}
          />
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
                {
                  label: form.label.trim(),
                  href: form.href.trim(),
                  sortOrder: Number(form.sortOrder) || 0,
                },
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

// ---------------------------------------------------------------------------
// اسلایدرها
//
// Which listings a home-page slider shows used to be a query hardcoded in
// backend/src/modules/home/home.service.ts. An editor could rename
// "ویلاهای شمال" but not point it at another city, and a new slider meant a
// deploy. This tab owns that decision.
//
// A "اقامتگاه" rail names a source and the backend fills it with published
// listings in Residence.importance order — the same priority the listings team
// already maintains — so a rail leads with the same listings the rest of the
// site prioritises. A "شهر و تگ" rail carries hand-made tiles instead.
// ---------------------------------------------------------------------------

const RAIL_SOURCES = [
  { value: "CITY", label: "شهر یا منطقه", needsSlug: true },
  { value: "TAG", label: "تگ", needsSlug: true },
  { value: "TYPE", label: "نوع اقامتگاه", needsSlug: true },
  { value: "FAST", label: "رزرو آنی", needsSlug: false },
  { value: "OFFER", label: "تخفیف‌دار", needsSlug: false },
  { value: "TOP_RATED", label: "پرامتیازترین", needsSlug: false },
  { value: "ALL", label: "همه (فقط بر اساس اولویت)", needsSlug: false },
] as const;

function RailsTab({ rails, onSaved }: { rails: Rail[]; onSaved: () => void }) {
  const { data: sources } = useSWR<RailSources>("/api/admin/home/rail-sources", (p: string) =>
    apiFetch<RailSources>(p)
  );
  const [editing, setEditing] = useState<Rail | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="px-20 py-16 flex items-center justify-between border-b border-gray-EFEFEF">
          <div>
            <span className="text-13 leading-22 font-m text-gray-1E1D28">
              اسلایدرهای صفحه اصلی <span className="text-gray-B0AFBC">({faNum(rails.length)})</span>
            </span>
            <p className="text-11 leading-20 text-gray-B0AFBC mt-2">
              ترتیب نمایش با «ترتیب» تعیین می‌شه. اسلایدر اقامتگاه خودش پر می‌شه؛ اقامتگاه‌ها به
              ترتیب «اولویت» خودشون میان.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>افزودن اسلایدر</Button>
        </div>

        {rails.length === 0 ? (
          <EmptyState text="اسلایدری تعریف نشده." />
        ) : (
          <div className="divide-y divide-gray-F5F5F5">
            {rails.map((r) => {
              const source = RAIL_SOURCES.find((s) => s.value === r.sourceType);
              const summary =
                r.kind === "RESIDENCE"
                  ? [source?.label ?? "—", r.sourceSlug || null, faNum(r.take) + " کارت"]
                      .filter(Boolean)
                      .join(" · ")
                  : faNum(r.items?.length ?? 0) + " آیتم";

              return (
                <div key={r.id} className="px-20 py-12 flex items-center gap-x-12">
                  <Badge tone={r.kind === "RESIDENCE" ? "blue" : "purple"}>
                    {r.kind === "RESIDENCE" ? "اقامتگاه" : "شهر و تگ"}
                  </Badge>
                  <div className="min-w-0">
                    <div className="text-13 leading-20 font-m text-gray-1E1D28 truncate">
                      {r.title || "بدون عنوان"}
                    </div>
                    <div dir="auto" className="text-11 text-gray-B0AFBC truncate">
                      {summary} · ترتیب {faNum(r.sortOrder)} · H{faNum(r.headingLevel)}
                    </div>
                  </div>
                  {!r.isEnabled && <Badge tone="red">غیرفعال</Badge>}
                  <div className="mr-auto flex gap-x-10 shrink-0">
                    <button
                      onClick={() => setEditing(r)}
                      className="text-12 text-primary-main hover:underline"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={async () => {
                        await apiFetch("/api/admin/home/rails/" + r.id, { method: "DELETE" });
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

      {(creating || editing) && (
        <RailModal
          rail={editing}
          sources={sources}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            onSaved();
          }}
        />
      )}
    </>
  );
}

function RailModal({
  rail,
  sources,
  onClose,
  onSaved,
}: {
  rail: Rail | null;
  sources: RailSources | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    kind: (rail?.kind ?? "RESIDENCE") as Rail["kind"],
    title: rail?.title ?? "",
    subtitle: rail?.subtitle ?? "",
    headingLevel: rail?.headingLevel ?? 2,
    sourceType: rail?.sourceType ?? "CITY",
    sourceSlug: rail?.sourceSlug ?? "",
    take: rail?.take ?? 15,
    linkTo: rail?.linkTo ?? "",
    isEnabled: rail?.isEnabled ?? true,
    sortOrder: rail?.sortOrder ?? 0,
  });
  const { save, saving, error } = useSaver(
    rail ? "/api/admin/home/rails/" + rail.id : "/api/admin/home/rails",
    onSaved
  );

  const source = RAIL_SOURCES.find((s) => s.value === form.sourceType);
  const slugOptions =
    form.sourceType === "CITY"
      ? sources?.cities.map((c) => ({ slug: c.slug, name: c.name + " (" + faNum(c.count) + ")" }))
      : form.sourceType === "TAG"
      ? sources?.tags
      : form.sourceType === "TYPE"
      ? sources?.types
      : undefined;

  const str = (v: string) => (v.trim() ? v.trim() : null);

  return (
    <Modal open title={rail ? "ویرایش اسلایدر" : "افزودن اسلایدر"} onClose={onClose}>
      <div className="flex flex-col gap-y-14">
        <Field label="نوع اسلایدر">
          <Select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as Rail["kind"] })}
          >
            <option value="RESIDENCE">اسلایدر اقامتگاه — خودکار پر می‌شه</option>
            <option value="DESTINATION">اسلایدر شهر و تگ — آیتم‌ها رو خودت می‌سازی</option>
          </Select>
        </Field>

        <Field label="عنوان" hint="همون تیتری که بالای اسلایدر دیده می‌شه.">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>

        {form.kind === "RESIDENCE" && (
          <>
            <Field label="منبع اقامتگاه‌ها">
              <Select
                value={form.sourceType}
                onChange={(e) => setForm({ ...form, sourceType: e.target.value, sourceSlug: "" })}
              >
                {RAIL_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </Field>

            {!!source?.needsSlug && (
              <Field
                label={
                  form.sourceType === "CITY" ? "شهر" : form.sourceType === "TAG" ? "تگ" : "نوع"
                }
                hint={
                  form.sourceType === "CITY"
                    ? "شهرهای زیرمجموعه هم خودکار میان (مثل شمال)."
                    : undefined
                }
              >
                <Select
                  value={form.sourceSlug}
                  onChange={(e) => setForm({ ...form, sourceSlug: e.target.value })}
                >
                  <option value="">— انتخاب کنید —</option>
                  {(slugOptions ?? []).map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.name} — {o.slug}
                    </option>
                  ))}
                </Select>
              </Field>
            )}

            <Field label="تعداد کارت" hint="حداکثر ۳۰.">
              <Input
                type="number"
                value={form.take}
                onChange={(e) => setForm({ ...form, take: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        <Field label="لینک «مشاهده همه»" hint="خالی بذاری، از روی منبع ساخته می‌شه.">
          <Input
            dir="ltr"
            value={form.linkTo}
            onChange={(e) => setForm({ ...form, linkTo: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-14">
          <Field label="سطح تیتر">
            <Select
              value={String(form.headingLevel)}
              onChange={(e) => setForm({ ...form, headingLevel: Number(e.target.value) })}
            >
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="4">H4</option>
            </Select>
          </Field>
          <Field label="ترتیب">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
        </div>

        <div className="flex items-center gap-x-12">
          <Toggle checked={form.isEnabled} onChange={(v) => setForm({ ...form, isEnabled: v })} />
          <span className="text-13 leading-22 text-gray-1E1D28">فعال</span>
        </div>

        {form.kind === "DESTINATION" && !!rail && <RailItemsEditor rail={rail} onSaved={onSaved} />}
        {form.kind === "DESTINATION" && !rail && (
          <p className="text-11 leading-20 text-gray-B0AFBC">
            اول اسلایدر رو ذخیره کن، بعد آیتم‌هاش رو اضافه کن.
          </p>
        )}

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}
        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            disabled={saving}
            onClick={() =>
              save(
                {
                  kind: form.kind,
                  title: str(form.title),
                  subtitle: str(form.subtitle),
                  headingLevel: Number(form.headingLevel),
                  sourceType: form.kind === "RESIDENCE" ? form.sourceType : null,
                  sourceSlug: form.kind === "RESIDENCE" ? str(form.sourceSlug) : null,
                  take: Number(form.take) || 15,
                  linkTo: str(form.linkTo),
                  isEnabled: form.isEnabled,
                  sortOrder: Number(form.sortOrder) || 0,
                },
                rail ? "PATCH" : "POST"
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

/** Tiles of a "شهر و تگ" slider — each with its own image and link. */
function RailItemsEditor({ rail, onSaved }: { rail: Rail; onSaved: () => void }) {
  const [form, setForm] = useState({ title: "", imageUrl: "", link: "" });
  const { save, saving, error } = useSaver("/api/admin/home/rail-items", onSaved);

  return (
    <div className="rounded-12 border border-gray-EFEFEF p-14">
      <div className="text-13 leading-22 font-m text-gray-1E1D28 mb-10">
        آیتم‌ها <span className="text-gray-B0AFBC">({faNum(rail.items?.length ?? 0)})</span>
      </div>

      {(rail.items?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-y-8 mb-12">
          {rail.items.map((i) => (
            <div key={i.id} className="flex items-center gap-x-10">
              {i.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={adminImageUrl(i.imageUrl, 96)}
                  alt=""
                  className="w-40 h-28 object-cover rounded-6 bg-gray-F5F5F5 shrink-0"
                />
              ) : (
                <div className="w-40 h-28 rounded-6 bg-gray-F5F5F5 shrink-0" />
              )}
              <span className="text-12 text-gray-1E1D28 truncate">{i.title}</span>
              <span dir="ltr" className="text-11 text-gray-B0AFBC truncate">
                {i.link}
              </span>
              <button
                onClick={async () => {
                  await apiFetch("/api/admin/home/rail-items/" + i.id, { method: "DELETE" });
                  onSaved();
                }}
                className="mr-auto text-12 text-[#DC2626] hover:underline shrink-0"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        <Field label="عنوان">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="تصویر">
          <Input
            dir="ltr"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </Field>
        <Field label="لینک">
          <Input
            dir="ltr"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </Field>
      </div>
      {error && <p className="text-12 leading-20 text-[#DC2626] mt-8">{error}</p>}
      <div className="flex justify-end mt-10">
        <Button
          variant="ghost"
          disabled={saving || !form.title.trim()}
          onClick={async () => {
            const done = await save(
              {
                railId: rail.id,
                title: form.title.trim(),
                imageUrl: form.imageUrl.trim() || null,
                link: form.link.trim() || null,
                sortOrder: (rail.items?.length ?? 0) * 10,
              },
              "POST"
            );
            if (done) setForm({ title: "", imageUrl: "", link: "" });
          }}
        >
          {saving ? "…" : "افزودن آیتم"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// سوالات متداول صفحه اصلی
//
// The FAQ store is shared across the site and scoped per page, so home-page
// questions are rows with scope PAGE and path "/". That is not something an
// editor can be expected to work out from the FAQ screen, which is why this tab
// exists: it filters to the home page and writes the scope for you.
// ---------------------------------------------------------------------------

interface HomeFaq {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  sortOrder: number;
}

function HomeFaqsTab() {
  // The endpoint returns a plain array.
  const { data, isLoading, mutate } = useSWR<HomeFaq[]>(
    "/api/admin/faqs?scope=PAGE&path=%2F",
    (p: string) => apiFetch<HomeFaq[]>(p)
  );
  const [editing, setEditing] = useState<HomeFaq | null>(null);
  const [creating, setCreating] = useState(false);
  const faqs = data ?? [];

  return (
    <>
      <Card className="p-0 overflow-hidden">
        <div className="px-20 py-16 flex items-center justify-between border-b border-gray-EFEFEF">
          <div>
            <span className="text-13 leading-22 font-m text-gray-1E1D28">
              سوالات متداول صفحه اصلی{" "}
              <span className="text-gray-B0AFBC">({faNum(faqs.length)})</span>
            </span>
            <p className="text-11 leading-20 text-gray-B0AFBC mt-2">
              این سوال‌ها فقط روی صفحه اصلی نمایش داده می‌شن و با schema.org/FAQPage به گوگل معرفی
              می‌شن. برای صفحات دیگه به{" "}
              <Link href="/admin/settings/faqs" className="text-primary-main hover:underline">
                تنظیمات سوالات متداول
              </Link>{" "}
              برو.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>افزودن سوال</Button>
        </div>

        {isLoading ? (
          <div className="p-20">
            <Skeleton className="h-48" />
          </div>
        ) : faqs.length === 0 ? (
          <EmptyState text="هنوز سوالی برای صفحه اصلی نوشته نشده." />
        ) : (
          <div className="divide-y divide-gray-F5F5F5">
            {faqs.map((f) => (
              <div key={f.id} className="px-20 py-12 flex items-center gap-x-12">
                <div className="min-w-0">
                  <div className="text-13 leading-20 font-m text-gray-1E1D28 truncate">
                    {f.question}
                  </div>
                  <div className="text-11 text-gray-B0AFBC truncate">{f.answer}</div>
                </div>
                {!f.isActive && <Badge tone="red">غیرفعال</Badge>}
                <div className="mr-auto flex gap-x-10 shrink-0">
                  <button
                    onClick={() => setEditing(f)}
                    className="text-12 text-primary-main hover:underline"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={async () => {
                      await apiFetch("/api/admin/faqs/" + f.id, { method: "DELETE" });
                      mutate();
                    }}
                    className="text-12 text-[#DC2626] hover:underline"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {(creating || editing) && (
        <HomeFaqModal
          faq={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            mutate();
          }}
        />
      )}
    </>
  );
}

function HomeFaqModal({
  faq,
  onClose,
  onSaved,
}: {
  faq: HomeFaq | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    question: faq?.question ?? "",
    answer: faq?.answer ?? "",
    isActive: faq?.isActive ?? true,
    sortOrder: faq?.sortOrder ?? 0,
  });
  const { save, saving, error } = useSaver(
    faq ? "/api/admin/faqs/" + faq.id : "/api/admin/faqs",
    onSaved
  );

  return (
    <Modal open title={faq ? "ویرایش سوال" : "افزودن سوال صفحه اصلی"} onClose={onClose}>
      <div className="flex flex-col gap-y-14">
        <Field label="سوال">
          <Input
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </Field>
        <Field label="پاسخ" hint="می‌تونی HTML ساده بذاری.">
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
          <div className="flex items-center gap-x-12 pb-8">
            <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} />
            <span className="text-13 leading-22 text-gray-1E1D28">فعال</span>
          </div>
        </div>

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}
        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button
            disabled={saving || !form.question.trim() || !form.answer.trim()}
            onClick={() =>
              save(
                {
                  // The scope is written for the editor: home-page questions are
                  // PAGE-scoped rows on path "/".
                  scope: "PAGE",
                  path: "/",
                  locationId: null,
                  tagId: null,
                  question: form.question.trim(),
                  answer: form.answer.trim(),
                  isActive: form.isActive,
                  sortOrder: Number(form.sortOrder) || 0,
                },
                faq ? "PATCH" : "POST"
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
