import { useEffect, useMemo, useState } from "react";
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

// "تگ‌های سئو" — a tag is one or more residence features combined into a
// filtered, separately-indexed page.
//
//   /search?pool=1            the "تگ مادر": every استخردار listing, nationwide
//   /search/shiraz?pool=1     the same tag narrowed to one location
//
// These exist as their own pages (rather than letting users filter freely)
// because each one targets a real search query and carries its own H1, meta
// and body text.
//
// A definition is groups of conditions: conditions inside a group are OR-ed,
// groups are AND-ed. That is exactly Odoo's domain shape, e.g. village =
// خانه روستایی AND (روستایی OR حومه شهر).

interface Condition {
  id?: number;
  groupIndex: number;
  amenityKey: string | null;
  ruleKey: string | null;
  valueName: string | null;
}

interface SeoTag {
  id: number;
  key: string;
  name: string;
  shortLabel: string | null;
  description: string | null;
  residenceType: "SUIT" | "BOOMGARDI" | "HOTEL" | null;
  priceMin: number | null;
  priceMax: number | null;
  matchIsFast: boolean;
  contentTitle: string | null;
  contentHtml: string | null;
  isActive: boolean;
  isSuggested: boolean;
  showInHomepage: boolean;
  showInShomal: boolean;
  sortOrder: number;
  conditions: Condition[];
  pageCount: number;
}

interface Options {
  amenities: {
    id: number;
    key: string;
    name: string;
    category: string | null;
    usageCount: number;
    options: string[];
  }[];
  rules: { id: number; key: string; name: string }[];
}

const RESIDENCE_TYPES = [
  { value: "", label: "همه‌ی انواع" },
  { value: "SUIT", label: "سوئیت / ویلا" },
  { value: "BOOMGARDI", label: "بوم‌گردی" },
  { value: "HOTEL", label: "هتل" },
] as const;

export default function AdminTagsPage() {
  const [editing, setEditing] = useState<SeoTag | null>(null);
  const [creating, setCreating] = useState(false);

  const { data, isLoading, mutate } = useSWR<SeoTag[]>("/api/admin/seo-tags", (p: string) =>
    apiFetch<SeoTag[]>(p)
  );
  const { data: options } = useSWR<Options>("/api/admin/seo-tags/options", (p: string) =>
    apiFetch<Options>(p)
  );

  const tags = data ?? [];
  const broken = tags.filter((t) => !t.isActive && t.conditions.length === 0);

  return (
    <AdminLayout
      title="تگ‌های سئو"
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
          <span className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap bg-primary-main text-white">
            تگ‌های سئو
          </span>
          <Link
            href="/admin/settings/sitemap"
            className="px-14 py-8 rounded-10 text-13 leading-20 font-m whitespace-nowrap text-gray-6C6A7D hover:bg-gray-F0F0F0"
          >
            sitemap و robots
          </Link>
        </Card>
      }
    >
      <div className="flex flex-col gap-y-16">
        <Card className="px-20 py-16">
          <p className="text-12 leading-22 text-gray-6C6A7D">
            هر تگ یک یا چند ویژگی اقامتگاه رو با هم ترکیب می‌کنه و یک صفحه‌ی مستقل می‌سازه. تگ بدون
            شهر «تگ مادر»ه (<span dir="ltr" className="font-m">/search?pool=1</span>) و با شهر ترکیب
            می‌شه تا صفحه‌ی همون شهر ساخته بشه (
            <span dir="ltr" className="font-m">/search/shiraz?pool=1</span>).
          </p>
        </Card>

        {broken.length > 0 && (
          <Card className="px-20 py-16 border-r-4 border-r-[#F59E0B]">
            <div className="text-13 leading-22 font-m text-gray-1E1D28 mb-6">
              {faNum(broken.length)} تگ غیرفعال و بدون شرط
            </div>
            <p className="text-12 leading-22 text-gray-6C6A7D">
              {broken.map((t) => t.name).join("، ")} — توی اودو به ویژگی‌هایی وصل بودن که بعداً حذف
              شدن، برای همین اون‌جا هم نتیجه‌ای نمی‌دادن. عمداً غیرفعال وارد شدن تا اشتباهاً همه‌ی
              اقامتگاه‌ها رو نشون ندن. برای زنده‌کردنشون شرط درست رو تعریف کن و فعالشون کن.
            </p>
          </Card>
        )}

        <Card className="p-0 overflow-hidden">
          <div className="px-20 py-16 flex items-center justify-between border-b border-gray-EFEFEF">
            <span className="text-13 leading-22 font-m text-gray-1E1D28">
              {faNum(tags.length)} تگ
            </span>
            <Button onClick={() => setCreating(true)}>افزودن تگ</Button>
          </div>

          {isLoading ? (
            <div className="p-20 flex flex-col gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : tags.length === 0 ? (
            <EmptyState text="هنوز تگی تعریف نشده." />
          ) : (
            <div className="divide-y divide-gray-F5F5F5">
              {tags.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditing(t)}
                  className="w-full text-right px-20 py-14 hover:bg-gray-FAFAFA transition flex flex-wrap items-center gap-x-10 gap-y-6"
                >
                  <span className="text-13 leading-22 font-m text-gray-1E1D28">{t.name}</span>
                  <span dir="ltr" className="text-11 text-gray-B0AFBC">
                    ?{t.key}=1
                  </span>
                  {t.isActive ? (
                    <Badge tone="green">فعال</Badge>
                  ) : (
                    <Badge tone="red">غیرفعال</Badge>
                  )}
                  {t.isSuggested && <Badge tone="blue">جستجوی مرتبط</Badge>}
                  <span className="text-11 text-gray-6C6A7D mr-auto">
                    {faNum(t.conditions.length)} شرط · {faNum(t.pageCount)} صفحه
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {(editing || creating) && options && (
        <TagEditor
          tag={editing}
          options={options}
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

function TagEditor({
  tag,
  options,
  onClose,
  onSaved,
}: {
  tag: SeoTag | null;
  options: Options;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    key: tag?.key ?? "",
    name: tag?.name ?? "",
    shortLabel: tag?.shortLabel ?? "",
    description: tag?.description ?? "",
    residenceType: tag?.residenceType ?? "",
    priceMin: tag?.priceMin ?? "",
    priceMax: tag?.priceMax ?? "",
    matchIsFast: tag?.matchIsFast ?? false,
    contentTitle: tag?.contentTitle ?? "",
    contentHtml: tag?.contentHtml ?? "",
    isActive: tag?.isActive ?? true,
    isSuggested: tag?.isSuggested ?? false,
    showInHomepage: tag?.showInHomepage ?? false,
    sortOrder: tag?.sortOrder ?? 0,
  });
  const [conditions, setConditions] = useState<Condition[]>(tag?.conditions ?? []);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<{ total: number } | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const groups = useMemo(() => {
    const m = new Map<number, Condition[]>();
    conditions.forEach((c) => {
      if (!m.has(c.groupIndex)) m.set(c.groupIndex, []);
      m.get(c.groupIndex)!.push(c);
    });
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [conditions]);

  // Live count so the effect of a definition is visible before it is saved —
  // an over-broad tag would otherwise quietly list everything.
  useEffect(() => {
    let cancelled = false;
    setPreviewing(true);
    const t = setTimeout(async () => {
      try {
        const res = await apiFetch<{ total: number }>("/api/admin/seo-tags/preview", {
          method: "POST",
          body: JSON.stringify({
            conditions,
            residenceType: form.residenceType || null,
            priceMin: form.priceMin === "" ? null : Number(form.priceMin),
            priceMax: form.priceMax === "" ? null : Number(form.priceMax),
            matchIsFast: form.matchIsFast,
          }),
        });
        if (!cancelled) setPreview(res);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setPreviewing(false);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [conditions, form.residenceType, form.priceMin, form.priceMax, form.matchIsFast]);

  const addGroup = () =>
    setConditions([
      ...conditions,
      { groupIndex: groups.length ? Math.max(...groups.map((g) => g[0])) + 1 : 0, amenityKey: null, ruleKey: null, valueName: null },
    ]);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        key: form.key.trim(),
        name: form.name.trim(),
        shortLabel: form.shortLabel.trim() || null,
        description: form.description.trim() || null,
        residenceType: form.residenceType || null,
        priceMin: form.priceMin === "" ? null : Number(form.priceMin),
        priceMax: form.priceMax === "" ? null : Number(form.priceMax),
        matchIsFast: form.matchIsFast,
        contentTitle: form.contentTitle.trim() || null,
        contentHtml: form.contentHtml.trim() || null,
        isActive: form.isActive,
        isSuggested: form.isSuggested,
        showInHomepage: form.showInHomepage,
        sortOrder: Number(form.sortOrder) || 0,
        conditions: conditions.filter((c) => c.amenityKey || c.ruleKey),
      };
      await apiFetch(tag ? `/api/admin/seo-tags/${tag.id}` : "/api/admin/seo-tags", {
        method: tag ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      onSaved();
    } catch (e: any) {
      setError(e?.message ?? "ذخیره نشد.");
    } finally {
      setSaving(false);
    }
  };

  const noConditions = conditions.filter((c) => c.amenityKey || c.ruleKey).length === 0;
  const unfiltered =
    noConditions && !form.residenceType && !form.matchIsFast && form.priceMin === "" && form.priceMax === "";

  return (
    <Modal
      open
      title={tag ? `ویرایش تگ «${tag.name}»` : "افزودن تگ"}
      onClose={onClose}
      width="max-w-[880px]"
    >
      <div className="flex flex-col gap-y-16">
        <div className="grid md:grid-cols-2 gap-14">
          <Field
            label="کلید (پارامتر آدرس)"
            hint={
              tag
                ? "تغییرش آدرس‌های ایندکس‌شده رو می‌شکنه — دست نزن مگر لازم باشه."
                : "توی آدرس این‌طوری میاد: /search/shiraz?<کلید>=1"
            }
          >
            <Input
              dir="ltr"
              value={form.key}
              onChange={(e) => setForm({ ...form, key: e.target.value })}
              placeholder="pool"
            />
          </Field>
          <Field label="نام نمایشی" hint="توی عنوان صفحه می‌شینه: «<نام> در شیراز»">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="برچسب کوتاه" hint="برای چیپس فیلترها، مثل «استخردار»">
            <Input
              value={form.shortLabel}
              onChange={(e) => setForm({ ...form, shortLabel: e.target.value })}
            />
          </Field>
          <Field label="ترتیب نمایش">
            <Input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
        </div>

        {/* ---- condition builder ---- */}
        <div className="rounded-12 border border-gray-EFEFEF overflow-hidden">
          <div className="px-16 py-12 bg-gray-FAFAFA flex items-center justify-between">
            <span className="text-13 leading-22 font-m text-gray-1E1D28">شرط‌های تگ</span>
            <span className="text-11 text-gray-6C6A7D">
              داخل هر گروه «یا» · بین گروه‌ها «و»
            </span>
          </div>

          <div className="p-16 flex flex-col gap-y-12">
            {groups.length === 0 && (
              <p className="text-12 leading-22 text-gray-6C6A7D">
                هنوز شرطی نداره. بدون شرط، این تگ همه‌ی اقامتگاه‌ها رو نشون می‌ده.
              </p>
            )}

            {groups.map(([gi, conds], idx) => (
              <div key={gi}>
                {idx > 0 && (
                  <div className="text-11 font-m text-gray-B0AFBC my-6 text-center">و</div>
                )}
                <div className="rounded-10 border border-gray-EFEFEF p-12 flex flex-col gap-y-8">
                  {conds.map((c, ci) => (
                    <div key={ci}>
                      {ci > 0 && (
                        <div className="text-11 text-gray-B0AFBC my-4">یا</div>
                      )}
                      <ConditionRow
                        condition={c}
                        options={options}
                        onChange={(next) =>
                          setConditions(conditions.map((x) => (x === c ? next : x)))
                        }
                        onRemove={() => setConditions(conditions.filter((x) => x !== c))}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setConditions([
                        ...conditions,
                        { groupIndex: gi, amenityKey: null, ruleKey: null, valueName: null },
                      ])
                    }
                    className="text-11 text-primary-main hover:underline self-start"
                  >
                    + افزودن گزینه‌ی «یا» به این گروه
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addGroup}
              className="text-12 text-primary-main hover:underline self-start"
            >
              + افزودن گروه شرط جدید («و»)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-14">
          <Field label="نوع اقامتگاه">
            <Select
              value={form.residenceType}
              onChange={(e) => setForm({ ...form, residenceType: e.target.value as any })}
            >
              {RESIDENCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="حداقل قیمت وسط هفته" hint="خالی یعنی بدون کف قیمت">
            <Input
              type="number"
              value={form.priceMin}
              onChange={(e) => setForm({ ...form, priceMin: e.target.value as any })}
            />
          </Field>
          <Field label="حداکثر قیمت وسط هفته" hint="خالی یعنی بدون سقف قیمت">
            <Input
              type="number"
              value={form.priceMax}
              onChange={(e) => setForm({ ...form, priceMax: e.target.value as any })}
            />
          </Field>
        </div>

        {/* ---- live preview ---- */}
        <div
          className={`rounded-10 px-16 py-12 text-12 leading-22 ${
            unfiltered ? "bg-[#FEF3C7] text-[#92400E]" : "bg-gray-FAFAFA text-gray-6C6A7D"
          }`}
        >
          {previewing ? (
            "در حال محاسبه…"
          ) : unfiltered ? (
            <>
              این تعریف هیچ فیلتری نداره و <span className="font-m">همه‌ی اقامتگاه‌ها</span> رو نشون
              می‌ده — که برای یک صفحه‌ی سئویی تقریباً همیشه اشتباهه.
            </>
          ) : preview ? (
            <>
              با این تعریف <span className="font-m text-gray-1E1D28">{faNum(preview.total)}</span>{" "}
              اقامتگاه منتشرشده نمایش داده می‌شه.
              {preview.total === 0 && " — یعنی صفحه خالی می‌مونه."}
            </>
          ) : (
            "پیش‌نمایش در دسترس نیست."
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-14">
          <Field label="عنوان متن صفحه">
            <Input
              value={form.contentTitle}
              onChange={(e) => setForm({ ...form, contentTitle: e.target.value })}
            />
          </Field>
          <Field label="یادداشت داخلی" hint="فقط برای تیم، جایی نمایش داده نمی‌شه.">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
        </div>

        <Field label="متن صفحه" hint="HTML مجازه.">
          <textarea
            value={form.contentHtml}
            onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
            rows={5}
            className="w-full rounded-10 border border-gray-EFEFEF px-14 py-10 text-13 leading-22 outline-none focus:border-primary-main font-mono"
          />
        </Field>

        <div className="flex flex-wrap gap-x-24 gap-y-10">
          <Toggle checked={form.isActive} onChange={(v) => setForm({ ...form, isActive: v })} label="فعال" />
          <Toggle
            checked={form.isSuggested}
            onChange={(v) => setForm({ ...form, isSuggested: v })}
            label="نمایش در «جستجوهای مرتبط»"
          />
          <Toggle
            checked={form.matchIsFast}
            onChange={(v) => setForm({ ...form, matchIsFast: v })}
            label="فقط رزرو آنی"
          />
          <Toggle
            checked={form.showInHomepage}
            onChange={(v) => setForm({ ...form, showInHomepage: v })}
            label="نمایش در صفحه‌ی اصلی"
          />
        </div>

        {tag && tag.pageCount > 0 && (
          <p className="text-11 leading-20 text-gray-B0AFBC">
            {faNum(tag.pageCount)} صفحه‌ی سئویی به این تگ وصله. غیرفعال‌کردن، اون‌ها رو از دسترس خارج
            می‌کنه ولی پاک نمی‌کنه.
          </p>
        )}

        {error && <p className="text-12 leading-20 text-[#DC2626]">{error}</p>}

        <div className="flex gap-x-8 justify-end">
          <Button variant="ghost" onClick={onClose}>
            انصراف
          </Button>
          <Button onClick={save} disabled={saving || !form.key.trim() || !form.name.trim()}>
            {saving ? "در حال ذخیره…" : "ذخیره تگ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ConditionRow({
  condition,
  options,
  onChange,
  onRemove,
}: {
  condition: Condition;
  options: Options;
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  const selectedKey = condition.amenityKey ?? (condition.ruleKey ? `rule:${condition.ruleKey}` : "");
  const amenity = options.amenities.find((a) => a.key === condition.amenityKey);

  return (
    <div className="flex flex-wrap items-center gap-8">
      <Select
        value={selectedKey}
        onChange={(e) => {
          const v = e.target.value;
          if (v.startsWith("rule:")) {
            onChange({ ...condition, amenityKey: null, ruleKey: v.slice(5), valueName: null });
          } else {
            onChange({ ...condition, amenityKey: v || null, ruleKey: null, valueName: null });
          }
        }}
        className="min-w-[200px] flex-1"
      >
        <option value="">— ویژگی را انتخاب کن —</option>
        <optgroup label="امکانات">
          {options.amenities.map((a) => (
            <option key={a.key} value={a.key}>
              {a.name}
            </option>
          ))}
        </optgroup>
        <optgroup label="قوانین">
          {options.rules.map((r) => (
            <option key={r.key} value={`rule:${r.key}`}>
              {r.name}
            </option>
          ))}
        </optgroup>
      </Select>

      {amenity && (amenity.options.length > 0 || condition.valueName) ? (
        <Select
          value={condition.valueName ?? ""}
          onChange={(e) => onChange({ ...condition, valueName: e.target.value || null })}
          className="min-w-[180px] flex-1"
        >
          <option value="">هر مقداری (فقط داشتن)</option>
          {/* The saved value is always selectable, even if it is no longer in
              the catalog — otherwise opening the tag would silently drop it. */}
          {[...new Set([...(condition.valueName ? [condition.valueName] : []), ...amenity.options])].map(
            (o) => (
              <option key={o} value={o}>
                {o}
              </option>
            )
          )}
        </Select>
      ) : (
        <span className="text-11 text-gray-B0AFBC flex-1">
          {condition.ruleKey ? "باید «بله» باشه" : "فقط داشتن این امکان"}
        </span>
      )}

      <button
        onClick={onRemove}
        className="text-11 text-[#DC2626] hover:underline shrink-0"
        aria-label="حذف شرط"
      >
        حذف
      </button>
    </div>
  );
}
