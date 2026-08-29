import { useEffect, useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Field, Input, Skeleton, faNum } from "@/components/Admin/ui";

/**
 * The submission wizard's content.
 *
 * Fourteen step headings and the tiles for the first three steps used to live
 * in the front's bundle — a heading could not be reworded, a step could not be
 * explained, a region could not be added, and every tile shared one
 * placeholder image. Odoo had this configurable; the migration off it did not
 * carry the surface across. This is that surface.
 *
 * Saving is per row rather than one big form: an admin fixing a typo in step 7
 * should not have to think about the other thirteen.
 */

interface WizardStep {
  id: number;
  step: number;
  title: string;
  description: string | null;
  helpText: string | null;
  iconUrl: string | null;
  isEnabled: boolean;
}

interface WizardOption {
  id: number;
  kind: "RES_TYPE" | "REGION" | "RENT_TYPE";
  name: string;
  description: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const KIND_LABEL: Record<WizardOption["kind"], string> = {
  RES_TYPE: "نوع اقامتگاه (مرحله ۱)",
  REGION: "منطقه (مرحله ۲)",
  RENT_TYPE: "نحوه اجاره (مرحله ۳)",
};

const KINDS = Object.keys(KIND_LABEL) as WizardOption["kind"][];

function StepRow({ step, onSaved }: { step: WizardStep; onSaved: () => void }) {
  const [form, setForm] = useState(step);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // A refetch after someone else's edit should not sit on top of what this
  // admin is currently typing, so the local copy only re-syncs when the row
  // itself changes identity.
  useEffect(() => setForm(step), [step.id, step.step]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty =
    form.title !== step.title ||
    (form.description || "") !== (step.description || "") ||
    (form.helpText || "") !== (step.helpText || "") ||
    (form.iconUrl || "") !== (step.iconUrl || "") ||
    form.isEnabled !== step.isEnabled;

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/wizard/steps/${step.step}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          helpText: form.helpText || null,
          iconUrl: form.iconUrl || null,
          isEnabled: form.isEnabled,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-b border-gray-F0F0F0 py-16 last:border-b-0">
      <div className="flex items-center justify-between gap-x-8">
        <span className="flex items-center gap-x-8">
          <Badge tone="gray">مرحله {faNum(step.step)}</Badge>
          {!form.isEnabled && <Badge tone="red">غیرفعال</Badge>}
        </span>
        <span className="flex items-center gap-x-8">
          {saved && <span className="text-12 text-[#1B8A4B]">ذخیره شد</span>}
          <Button variant="secondary" onClick={() => setForm({ ...form, isEnabled: !form.isEnabled })}>
            {form.isEnabled ? "غیرفعال کن" : "فعال کن"}
          </Button>
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "در حال ذخیره…" : "ذخیره"}
          </Button>
        </span>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        <Field label="عنوان (تیتری که میزبان می‌بیند)">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </Field>
        <Field label="توضیح کوتاه — زیر عنوان" hint="خالی بگذارید تا نمایش داده نشود">
          <Input
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="مثلاً: ویلا، آپارتمان، سوئیت یا اقامتگاه بوم‌گردی"
          />
        </Field>
        <Field label="متن راهنما — پشت دکمه‌ی «؟»">
          <Input
            value={form.helpText || ""}
            onChange={(e) => setForm({ ...form, helpText: e.target.value })}
          />
        </Field>
        <Field label="آدرس آیکون" hint="اختیاری">
          <Input
            value={form.iconUrl || ""}
            onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
            placeholder="/assets/..."
          />
        </Field>
      </div>
    </div>
  );
}

function OptionRow({ option, onSaved }: { option: WizardOption; onSaved: () => void }) {
  const [form, setForm] = useState(option);
  const [saving, setSaving] = useState(false);

  useEffect(() => setForm(option), [option.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty =
    form.name !== option.name ||
    (form.description || "") !== (option.description || "") ||
    (form.imageUrl || "") !== (option.imageUrl || "") ||
    form.sortOrder !== option.sortOrder;

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/wizard/options/${option.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          imageUrl: form.imageUrl || null,
          sortOrder: form.sortOrder,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    await apiFetch(`/api/admin/wizard/options/${option.id}/toggle`, { method: "POST" });
    onSaved();
  };

  return (
    <div
      className={`rounded-10 border p-12 ${
        option.isActive ? "border-gray-E5E5E6 bg-white" : "border-dashed border-gray-CACFD3 bg-gray-F7F7F7"
      }`}
    >
      <div className="flex items-start gap-x-12">
        <div className="h-56 w-56 shrink-0 overflow-hidden rounded-8 bg-gray-F0F0F0">
          {form.imageUrl ? (
            // A user-supplied URL on a storage host, so not next/image.
            <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>

        <div className="grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="نام گزینه"
          />
          <Input
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="توضیح (اختیاری)"
          />
          <Input
            value={form.imageUrl || ""}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="آدرس تصویر"
          />
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            placeholder="ترتیب"
          />
        </div>

        <div className="flex shrink-0 flex-col gap-y-6">
          <Button onClick={save} disabled={!dirty || saving}>
            {saving ? "…" : "ذخیره"}
          </Button>
          <Button variant="secondary" onClick={toggle}>
            {option.isActive ? "پنهان" : "نمایش"}
          </Button>
        </div>
      </div>

      {/* Renaming is not retroactive, and the panel should say so before
          someone assumes it is. */}
      {form.name !== option.name && (
        <p className="mt-8 text-11 leading-18 text-[#B07D1A]">
          تغییر نام فقط روی ثبت‌های جدید اثر دارد؛ اقامتگاه‌هایی که قبلاً این گزینه را انتخاب کرده‌اند نام قبلی را نگه می‌دارند.
        </p>
      )}
    </div>
  );
}

function NewOption({ kind, onSaved }: { kind: WizardOption["kind"]; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await apiFetch("/api/admin/wizard/options", {
        method: "POST",
        body: JSON.stringify({ kind, name: name.trim(), sortOrder: 99 }),
      });
      setName("");
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-12 flex items-center gap-x-8">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="افزودن گزینه‌ی جدید…"
        className="max-w-[320px]"
      />
      <Button variant="secondary" onClick={add} disabled={!name.trim() || saving}>
        افزودن
      </Button>
    </div>
  );
}

function WizardSettingsPage() {
  const [tab, setTab] = useState<"steps" | "options">("steps");

  const { data, isLoading, mutate } = useSWR<{ steps: WizardStep[]; options: WizardOption[] }>(
    "/api/admin/wizard",
    (url: string) => apiFetch<any>(url).then((r) => r.data ?? r)
  );

  return (
    <AdminLayout title="محتوای ثبت اقامتگاه" breadcrumb="تنظیمات">
      <Card>
        <p className="text-13 leading-22 text-gray-6C6A7D">
          عنوان و توضیح هر مرحله‌ی ثبت اقامتگاه، و گزینه‌هایی که میزبان در سه مرحله‌ی اول انتخاب
          می‌کند. تغییرات بلافاصله روی ویزارد اعمال می‌شوند.
        </p>

        <div className="mt-16 flex items-center gap-x-6">
          {(["steps", "options"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`rounded-10 px-12 py-6 text-13 leading-20 font-m transition ${
                tab === t ? "bg-primary-main text-white" : "text-gray-6C6A7D hover:bg-gray-F0F0F0"
              }`}
            >
              {t === "steps" ? "مراحل" : "گزینه‌ها"}
            </button>
          ))}
        </div>
      </Card>

      <div className="mt-16">
        {isLoading ? (
          <Card>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="mb-12 h-80 w-full rounded-10" />
            ))}
          </Card>
        ) : tab === "steps" ? (
          <Card>
            {(data?.steps ?? []).map((step) => (
              <StepRow key={step.step} step={step} onSaved={() => mutate()} />
            ))}
          </Card>
        ) : (
          <div className="space-y-16">
            {KINDS.map((kind) => {
              const options = (data?.options ?? []).filter((o) => o.kind === kind);
              return (
                <Card key={kind}>
                  <h3 className="text-14 leading-22 font-m text-black">{KIND_LABEL[kind]}</h3>
                  <div className="mt-12 space-y-8">
                    {options.map((option) => (
                      <OptionRow key={option.id} option={option} onSaved={() => mutate()} />
                    ))}
                  </div>
                  <NewOption kind={kind} onSaved={() => mutate()} />
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default WizardSettingsPage;
