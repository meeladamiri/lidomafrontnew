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

// "sitemap و robots.txt" — configured by rule, not page by page. The settings
// here say WHICH families of URLs belong in the sitemap and under what
// thresholds; the files themselves are generated from live data on request, so
// a newly published listing appears without anyone touching this screen.
//
// The rule the thresholds exist to serve: only submit URLs that are
// self-canonical and return 200. A sitemap full of redirects, empty pages or
// duplicates costs crawl budget instead of earning it.

const CHANGE_FREQ = [
  { value: "ALWAYS", label: "همیشه" },
  { value: "HOURLY", label: "ساعتی" },
  { value: "DAILY", label: "روزانه" },
  { value: "WEEKLY", label: "هفتگی" },
  { value: "MONTHLY", label: "ماهانه" },
  { value: "YEARLY", label: "سالانه" },
  { value: "NEVER", label: "هرگز" },
] as const;

interface Settings {
  id: number;
  siteUrl: string;
  allowIndexing: boolean;
  sitemapEnabled: boolean;
  robotsEnabled: boolean;
  maxUrlsPerFile: number;
  robotsExtra: string | null;
  crawlDelay: number | null;
  imagesEnabled: boolean;
  imageUrlMode: string;
  imageOptimizerWidth: number;
  listCitySitemapsInRobots: boolean;
}

interface Section {
  id: number;
  key: string;
  label: string;
  isEnabled: boolean;
  changeFreq: string;
  priority: number;
  minResidenceCount: number;
  includeLastmod: boolean;
  requireSitemapFlag: boolean;
  tagPriority: number;
  tagChangeFreq: string;
  listingPriority: number;
  listingChangeFreq: string;
  sortOrder: number;
}

interface Stat {
  key: string;
  label: string;
  isEnabled: boolean;
  included: number;
  excluded: { reason: string; count: number }[];
}

interface SitemapData {
  settings: Settings;
  sections: Section[];
  stats: Stat[];
  total: number;
}

interface RobotsRule {
  id: number;
  userAgent: string;
  directive: string;
  path: string;
  isActive: boolean;
  note: string | null;
  sortOrder: number;
}

export default function AdminSitemapPage() {
  const { data, isLoading, mutate } = useSWR<SitemapData>("/api/admin/sitemap", (p: string) =>
    apiFetch<SitemapData>(p)
  );
  const { data: rules, mutate: mutateRules } = useSWR<RobotsRule[]>(
    "/api/admin/robots-rules",
    (p: string) => apiFetch<RobotsRule[]>(p)
  );

  const [preview, setPreview] = useState<{ title: string; content: string } | null>(null);
  const [editingRule, setEditingRule] = useState<RobotsRule | null>(null);
  const [creatingRule, setCreatingRule] = useState(false);

  const showPreview = async (kind: "robots" | "index") => {
    const res = await apiFetch<{ content: string }>(`/api/admin/sitemap/preview/${kind}`);
    setPreview({ title: kind === "robots" ? "robots.txt" : "sitemap.xml", content: res.content });
  };

  return (
    <AdminLayout
      title="sitemap و robots"
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
          <span className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap bg-primary-main text-white">
            sitemap و robots
          </span>
        </Card>
      }
    >
      {isLoading || !data ? (
        <div className="flex flex-col gap-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-y-16">
          {!data.settings.allowIndexing && (
            <Card className="px-20 py-16 border-r-4 border-r-[#DC2626]">
              <div className="text-13 leading-22 font-m text-[#B91C1C] mb-4">
                ایندکس‌شدن سایت خاموشه
              </div>
              <p className="text-12 leading-22 text-gray-6C6A7D">
                robots.txt الان برای همه‌ی خزنده‌ها <span dir="ltr" className="font-m">Disallow: /</span>{" "}
                می‌فرسته و sitemap.xml هم ۴۰۴ می‌ده. این حالت مخصوص قبل از لانچه — برای سایت زنده باید
                روشن باشه.
              </p>
            </Card>
          )}

          <GlobalSettings settings={data.settings} onSaved={() => mutate()} onPreview={showPreview} />

          <SectionsCard sections={data.sections} stats={data.stats} total={data.total} onSaved={() => mutate()} />

          <RobotsCard
            rules={rules ?? []}
            onEdit={setEditingRule}
            onCreate={() => setCreatingRule(true)}
            onChanged={() => mutateRules()}
          />
        </div>
      )}

      {preview && (
        <Modal open title={preview.title} onClose={() => setPreview(null)} width="max-w-[780px]">
          <pre
            dir="ltr"
            className="text-12 leading-20 bg-gray-FAFAFA rounded-10 p-16 overflow-auto max-h-[60vh] whitespace-pre-wrap"
          >
            {preview.content || "(خالی)"}
          </pre>
        </Modal>
      )}

      {(editingRule || creatingRule) && (
        <RobotsRuleModal
          rule={editingRule}
          onClose={() => {
            setEditingRule(null);
            setCreatingRule(false);
          }}
          onSaved={() => {
            setEditingRule(null);
            setCreatingRule(false);
            mutateRules();
            mutate();
          }}
        />
      )}
    </AdminLayout>
  );
}

function GlobalSettings({
  settings,
  onSaved,
  onPreview,
}: {
  settings: Settings;
  onSaved: () => void;
  onPreview: (k: "robots" | "index") => void;
}) {
  const [form, setForm] = useState({
    siteUrl: settings.siteUrl,
    allowIndexing: settings.allowIndexing,
    sitemapEnabled: settings.sitemapEnabled,
    robotsEnabled: settings.robotsEnabled,
    maxUrlsPerFile: settings.maxUrlsPerFile,
    robotsExtra: settings.robotsExtra ?? "",
    crawlDelay: settings.crawlDelay ?? "",
    imagesEnabled: settings.imagesEnabled,
    imageUrlMode: settings.imageUrlMode,
    imageOptimizerWidth: settings.imageOptimizerWidth,
    listCitySitemapsInRobots: settings.listCitySitemapsInRobots,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/sitemap/settings", {
        method: "PATCH",
        body: JSON.stringify({
          siteUrl: form.siteUrl.trim(),
          allowIndexing: form.allowIndexing,
          sitemapEnabled: form.sitemapEnabled,
          robotsEnabled: form.robotsEnabled,
          maxUrlsPerFile: Number(form.maxUrlsPerFile),
          robotsExtra: form.robotsExtra.trim() || null,
          crawlDelay: form.crawlDelay === "" ? null : Number(form.crawlDelay),
          imagesEnabled: form.imagesEnabled,
          imageUrlMode: form.imageUrlMode,
          imageOptimizerWidth: Number(form.imageOptimizerWidth),
          listCitySitemapsInRobots: form.listCitySitemapsInRobots,
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
    <Card className="px-20 py-18">
      <div className="flex items-center justify-between mb-14">
        <span className="text-14 leading-22 font-m text-gray-1E1D28">تنظیمات کلی</span>
        <div className="flex gap-x-8">
          <Button variant="ghost" onClick={() => onPreview("robots")}>
            پیش‌نمایش robots.txt
          </Button>
          <Button variant="ghost" onClick={() => onPreview("index")}>
            پیش‌نمایش sitemap.xml
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-14">
        <Field label="آدرس سایت" hint="همه‌ی آدرس‌های sitemap مطلق و با همین دامنه ساخته می‌شن.">
          <Input
            dir="ltr"
            value={form.siteUrl}
            onChange={(e) => setForm({ ...form, siteUrl: e.target.value })}
          />
        </Field>
        <Field
          label="حداکثر آدرس در هر فایل"
          hint="استاندارد sitemap سقف ۵۰٬۰۰۰ آدرس داره؛ بیشتر از این بشه فایل خودکار تکه می‌شه."
        >
          <Input
            type="number"
            value={form.maxUrlsPerFile}
            onChange={(e) => setForm({ ...form, maxUrlsPerFile: Number(e.target.value) })}
          />
        </Field>
        <Field label="Crawl-delay" hint="ثانیه، فقط برای *. خالی یعنی بدون محدودیت.">
          <Input
            type="number"
            dir="ltr"
            value={form.crawlDelay}
            onChange={(e) => setForm({ ...form, crawlDelay: e.target.value as any })}
          />
        </Field>
        <div className="flex flex-col justify-center gap-y-10">
          <Toggle
            checked={form.allowIndexing}
            onChange={(v) => setForm({ ...form, allowIndexing: v })}
            label="اجازه‌ی ایندکس‌شدن سایت"
          />
          <Toggle
            checked={form.sitemapEnabled}
            onChange={(v) => setForm({ ...form, sitemapEnabled: v })}
            label="فعال‌بودن sitemap"
          />
          <Toggle
            checked={form.robotsEnabled}
            onChange={(v) => setForm({ ...form, robotsEnabled: v })}
            label="فعال‌بودن robots.txt"
          />
          <Toggle
            checked={form.listCitySitemapsInRobots}
            onChange={(v) => setForm({ ...form, listCitySitemapsInRobots: v })}
            label="لیست‌کردن sitemap هر شهر در robots.txt"
          />
        </div>
      </div>

      <div className="mt-16 pt-16 border-t border-gray-EFEFEF">
        <div className="text-13 leading-22 font-m text-gray-1E1D28 mb-10">sitemap عکس‌ها</div>
        <div className="grid md:grid-cols-3 gap-14">
          <div className="flex items-center">
            <Toggle
              checked={form.imagesEnabled}
              onChange={(v) => setForm({ ...form, imagesEnabled: v })}
              label="فعال"
            />
          </div>
          <Field label="نحوه‌ی آدرس‌دهی عکس">
            <Select
              value={form.imageUrlMode}
              onChange={(e) => setForm({ ...form, imageUrlMode: e.target.value })}
            >
              <option value="optimizer">از طریق بهینه‌ساز Next</option>
              <option value="direct">آدرس مستقیم استوریج</option>
            </Select>
          </Field>
          <Field label="عرض تصویر بهینه‌شده" hint="پیکسل">
            <Input
              type="number"
              value={form.imageOptimizerWidth}
              onChange={(e) => setForm({ ...form, imageOptimizerWidth: Number(e.target.value) })}
            />
          </Field>
        </div>
        {form.imageUrlMode === "direct" && (
          <p className="text-11 leading-20 text-[#B45309] mt-8">
            هشدار: باکت لیارا به هر User-Agent شامل «Mozilla» جواب ۴۰۴ می‌ده — یعنی به گوگل‌بات و
            همه‌ی خزنده‌های عکس. تا وقتی این حفاظت برداشته نشده، آدرس مستقیم یعنی فرستادن ۴۰۴ به
            گوگل. حالت «بهینه‌ساز» تنها شکلیه که خزنده می‌تونه بگیره.
          </p>
        )}
      </div>

      <Field
        label="خطوط اضافه‌ی robots.txt"
        className="mt-14"
        hint="عیناً به انتهای فایل اضافه می‌شه — برای دستورهایی که اینجا فیلد ندارن."
      >
        <textarea
          dir="ltr"
          rows={3}
          value={form.robotsExtra}
          onChange={(e) => setForm({ ...form, robotsExtra: e.target.value })}
          className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-12 leading-20 outline-none focus:border-primary-main font-mono"
        />
      </Field>

      {error && <p className="text-12 leading-20 text-[#DC2626] mt-8">{error}</p>}

      <div className="flex justify-end mt-14">
        <Button onClick={save} disabled={saving}>
          {saving ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </Button>
      </div>
    </Card>
  );
}

function SectionsCard({
  sections,
  stats,
  total,
  onSaved,
}: {
  sections: Section[];
  stats: Stat[];
  total: number;
  onSaved: () => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-20 py-16 border-b border-gray-EFEFEF flex items-center justify-between">
        <span className="text-14 leading-22 font-m text-gray-1E1D28">بخش‌های sitemap</span>
        <span className="text-12 text-gray-6C6A7D">
          مجموع آدرس‌ها: <span className="font-m text-gray-1E1D28">{faNum(total)}</span>
        </span>
      </div>
      <div className="divide-y divide-gray-F5F5F5">
        {sections.map((s) => (
          <SectionRow
            key={s.id}
            section={s}
            stat={stats.find((x) => x.key === s.key)}
            onSaved={onSaved}
          />
        ))}
      </div>
    </Card>
  );
}

function SectionRow({
  section,
  stat,
  onSaved,
}: {
  section: Section;
  stat?: Stat;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    isEnabled: section.isEnabled,
    changeFreq: section.changeFreq,
    priority: section.priority,
    minResidenceCount: section.minResidenceCount,
    includeLastmod: section.includeLastmod,
    requireSitemapFlag: section.requireSitemapFlag,
    tagPriority: section.tagPriority,
    tagChangeFreq: section.tagChangeFreq,
    listingPriority: section.listingPriority,
    listingChangeFreq: section.listingChangeFreq,
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const set = (patch: Partial<typeof form>) => {
    setForm({ ...form, ...patch });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/sitemap/sections/${section.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          priority: Number(form.priority),
          minResidenceCount: Number(form.minResidenceCount),
          tagPriority: Number(form.tagPriority),
          listingPriority: Number(form.listingPriority),
        }),
      });
      setDirty(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-20 py-16">
      <div className="flex flex-wrap items-center gap-x-12 gap-y-8 mb-12">
        <Toggle checked={form.isEnabled} onChange={(v) => set({ isEnabled: v })} />
        <span className="text-13 leading-22 font-m text-gray-1E1D28">{section.label}</span>
        <span dir="ltr" className="text-11 text-gray-B0AFBC">
          {section.key === "cities"
            ? "/sitemaps/sitemap-<شهر>.xml"
            : `/sitemaps/${section.key}-1.xml`}
        </span>
        {stat && (
          <Badge tone={stat.included > 0 ? "green" : "gray"}>
            {faNum(stat.included)} {section.key === "cities" ? "فایل" : "آدرس"}
          </Badge>
        )}
        {dirty && (
          <Button onClick={save} disabled={saving} className="mr-auto">
            {saving ? "…" : "ذخیره"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
        <Field label="نرخ تغییر">
          <Select value={form.changeFreq} onChange={(e) => set({ changeFreq: e.target.value })}>
            {CHANGE_FREQ.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="اولویت" hint="بین ۰ تا ۱">
          <Input
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={form.priority}
            onChange={(e) => set({ priority: Number(e.target.value) })}
          />
        </Field>
        <Field label="حداقل اقامتگاه" hint="۰ یعنی بدون فیلتر">
          <Input
            type="number"
            min="0"
            value={form.minResidenceCount}
            onChange={(e) => set({ minResidenceCount: Number(e.target.value) })}
          />
        </Field>
        <div className="flex flex-col justify-center gap-y-8">
          <Toggle
            checked={form.includeLastmod}
            onChange={(v) => set({ includeLastmod: v })}
            label="درج lastmod"
          />
          {section.key === "tag-pages" && (
            <Toggle
              checked={form.requireSitemapFlag}
              onChange={(v) => set({ requireSitemapFlag: v })}
              label="فقط صفحات فلگ‌دار اودو"
            />
          )}
        </div>
      </div>

      {section.key === "cities" && (
        <div className="mt-14 pt-14 border-t border-gray-F5F5F5">
          <p className="text-11 leading-20 text-gray-B0AFBC mb-10">
            فایل هر شهر سه نوع آدرس داره. بالا وزن «صفحه‌ی شهر» تنظیم می‌شه؛ این‌جا وزن دو تای
            دیگه — صفحات تگ همون شهر و اقامتگاه‌هاش.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <Field label="اولویت صفحات تگ">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={form.tagPriority}
                onChange={(e) => set({ tagPriority: Number(e.target.value) })}
              />
            </Field>
            <Field label="نرخ تغییر صفحات تگ">
              <Select value={form.tagChangeFreq} onChange={(e) => set({ tagChangeFreq: e.target.value })}>
                {CHANGE_FREQ.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="اولویت اقامتگاه‌ها">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={form.listingPriority}
                onChange={(e) => set({ listingPriority: Number(e.target.value) })}
              />
            </Field>
            <Field label="نرخ تغییر اقامتگاه‌ها">
              <Select
                value={form.listingChangeFreq}
                onChange={(e) => set({ listingChangeFreq: e.target.value })}
              >
                {CHANGE_FREQ.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      )}

      {section.key === "tag-pages" && form.requireSitemapFlag && (
        <p className="text-11 leading-20 text-gray-B0AFBC mt-8">
          اودو فقط ۵۸ صفحه از ۹٬۳۱۲ صفحه رو برای sitemap فلگ کرده بود. اگه این گزینه رو خاموش کنی،
          هر صفحه‌ی تگِ فعال که از حد «حداقل اقامتگاه» بگذره وارد sitemap می‌شه.
        </p>
      )}

      {stat && stat.excluded.length > 0 && (
        <div className="mt-10 text-11 leading-20 text-gray-6C6A7D">
          <span className="font-m text-gray-1E1D28">کنار گذاشته شد: </span>
          {stat.excluded.map((e, i) => (
            <span key={e.reason}>
              {i > 0 && " · "}
              {e.reason} ({faNum(e.count)})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function RobotsCard({
  rules,
  onEdit,
  onCreate,
  onChanged,
}: {
  rules: RobotsRule[];
  onEdit: (r: RobotsRule) => void;
  onCreate: () => void;
  onChanged: () => void;
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-20 py-16 border-b border-gray-EFEFEF flex items-center justify-between">
        <span className="text-14 leading-22 font-m text-gray-1E1D28">قوانین robots.txt</span>
        <Button onClick={onCreate}>افزودن قانون</Button>
      </div>

      {rules.length === 0 ? (
        <EmptyState text="قانونی تعریف نشده — robots.txt همه‌چیز رو مجاز می‌کنه." />
      ) : (
        <div className="divide-y divide-gray-F5F5F5">
          {rules.map((r) => (
            <div key={r.id} className="px-20 py-12 flex flex-wrap items-center gap-x-10 gap-y-4">
              <span dir="ltr" className="text-12 font-mono text-gray-1E1D28">
                {r.userAgent}
              </span>
              <Badge tone={r.directive === "Allow" ? "green" : "gray"}>{r.directive}</Badge>
              <span dir="ltr" className="text-12 font-mono text-gray-6C6A7D">
                {r.path}
              </span>
              {r.note && <span className="text-11 text-gray-B0AFBC">{r.note}</span>}
              {!r.isActive && <Badge tone="red">غیرفعال</Badge>}
              <div className="mr-auto flex gap-x-10">
                <button onClick={() => onEdit(r)} className="text-12 text-primary-main hover:underline">
                  ویرایش
                </button>
                <button
                  onClick={async () => {
                    await apiFetch(`/api/admin/robots-rules/${r.id}`, { method: "DELETE" });
                    onChanged();
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
  );
}

function RobotsRuleModal({
  rule,
  onClose,
  onSaved,
}: {
  rule: RobotsRule | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    userAgent: rule?.userAgent ?? "*",
    directive: rule?.directive ?? "Disallow",
    path: rule?.path ?? "",
    note: rule?.note ?? "",
    isActive: rule?.isActive ?? true,
    sortOrder: rule?.sortOrder ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await apiFetch(rule ? `/api/admin/robots-rules/${rule.id}` : "/api/admin/robots-rules", {
        method: rule ? "PATCH" : "POST",
        body: JSON.stringify({
          userAgent: form.userAgent.trim() || "*",
          directive: form.directive,
          path: form.path.trim(),
          note: form.note.trim() || null,
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
    <Modal open title={rule ? "ویرایش قانون" : "افزودن قانون"} onClose={onClose}>
      <div className="flex flex-col gap-y-14">
        <div className="grid grid-cols-2 gap-14">
          <Field label="User-agent" hint="* یعنی همه‌ی خزنده‌ها">
            <Input
              dir="ltr"
              value={form.userAgent}
              onChange={(e) => setForm({ ...form, userAgent: e.target.value })}
            />
          </Field>
          <Field label="دستور">
            <Select
              value={form.directive}
              onChange={(e) => setForm({ ...form, directive: e.target.value })}
            >
              <option value="Disallow">Disallow</option>
              <option value="Allow">Allow</option>
            </Select>
          </Field>
        </div>

        <Field label="مسیر" hint="مثل /admin یا /api/ — با اسلش شروع بشه.">
          <Input
            dir="ltr"
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            placeholder="/admin"
          />
        </Field>

        <Field label="یادداشت" hint="فقط برای تیم؛ توی فایل نمیاد.">
          <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
        </Field>

        <Toggle
          checked={form.isActive}
          onChange={(v) => setForm({ ...form, isActive: v })}
          label="فعال"
        />

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}

        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={save} disabled={saving || !form.path.trim()}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
