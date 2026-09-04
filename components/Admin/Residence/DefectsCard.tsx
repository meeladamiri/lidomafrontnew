import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, EmptyState, Field, Modal, Select, faDate } from "@/components/Admin/ui";

type Section =
  | "DETAILS"
  | "SPECS"
  | "LOCATION"
  | "CAPACITY"
  | "AMENITIES"
  | "PRICING"
  | "GALLERY"
  | "DOCUMENTS"
  | "RULES"
  | "OTHER";

interface Defect {
  id: number;
  section: Section;
  severity: "MANDATORY" | "SUGGESTED";
  description: string;
  createdAt: string;
  reviewRequestedAt: string | null;
  resolvedAt: string | null;
}

const SECTION_LABEL: Record<Section, string> = {
  DETAILS: "نوع و منطقه اقامتگاه",
  SPECS: "نام و توضیحات",
  LOCATION: "آدرس و محل دقیق",
  CAPACITY: "ظرفیت و اتاق‌ها",
  AMENITIES: "امکانات",
  PRICING: "نرخ‌گذاری",
  GALLERY: "گالری تصاویر",
  DOCUMENTS: "مدارک",
  RULES: "قوانین و شرایط",
  OTHER: "سایر",
};

/**
 * «رفع نقص» — itemized issues an admin raises against a listing, new or
 * already published. A MANDATORY one forces `published` false (see the
 * backend's `syncPublishedFlag`) until an admin resolves it; a SUGGESTED one
 * is just shown to the host. Only an admin closes one — the host's own
 * «درخواست بررسی مجدد» (in the wizard) just flags it ready for another look.
 */
export default function DefectsCard({
  residenceId,
  defects,
  onSaved,
}: {
  residenceId: number;
  defects: Defect[];
  onSaved: () => void;
}) {
  const [showReport, setShowReport] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = defects.filter((d) => !d.resolvedAt);
  const resolved = defects.filter((d) => !!d.resolvedAt);

  async function resolve(id: number) {
    setBusyId(id);
    setError(null);
    try {
      await apiFetch(`/api/admin/defects/${id}/resolve`, { method: "POST" });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-16 leading-24 font-m text-black">نقص‌ها</h3>
        <Button variant="secondary" onClick={() => setShowReport(true)}>
          + ثبت نقص
        </Button>
      </div>

      {defects.length === 0 ? (
        <EmptyState text="نقصی برای این اقامتگاه ثبت نشده" />
      ) : (
        <div className="flex flex-col gap-y-10">
          {open.map((d) => (
            <div key={d.id} className="rounded-10 border border-gray-E5E5E6 p-12">
              <div className="flex items-center gap-x-8 flex-wrap gap-y-4 mb-6">
                <Badge tone={d.severity === "MANDATORY" ? "red" : "yellow"}>
                  {d.severity === "MANDATORY" ? "اجباری" : "پیشنهادی"}
                </Badge>
                <span className="text-13 font-m text-black">{SECTION_LABEL[d.section]}</span>
                {d.reviewRequestedAt && <Badge tone="blue">میزبان درخواست بررسی مجدد داده</Badge>}
                <span className="text-11 text-gray-9B9BAA mr-auto">{faDate(d.createdAt)}</span>
              </div>
              <p className="text-13 leading-22 text-gray-6C6A7D mb-10">{d.description}</p>
              <Button
                variant="secondary"
                disabled={busyId === d.id}
                onClick={() => resolve(d.id)}
              >
                {busyId === d.id ? "در حال ثبت..." : "برطرف‌شده ثبت کن"}
              </Button>
            </div>
          ))}

          {resolved.length > 0 && (
            <details className="mt-4">
              <summary className="text-12 text-gray-6C6A7D cursor-pointer">
                {resolved.length} نقص برطرف‌شده
              </summary>
              <div className="flex flex-col gap-y-8 mt-8">
                {resolved.map((d) => (
                  <div key={d.id} className="rounded-10 bg-gray-F7F7F7 p-12">
                    <div className="flex items-center gap-x-8 mb-4">
                      <Badge tone="green">برطرف‌شده</Badge>
                      <span className="text-12 font-m text-black">{SECTION_LABEL[d.section]}</span>
                    </div>
                    <p className="text-12 leading-20 text-gray-6C6A7D">{d.description}</p>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <ReportDefectModal
        open={showReport}
        residenceId={residenceId}
        onClose={() => setShowReport(false)}
        onDone={() => {
          setShowReport(false);
          onSaved();
        }}
      />
    </Card>
  );
}

function ReportDefectModal({
  open,
  residenceId,
  onClose,
  onDone,
}: {
  open: boolean;
  residenceId: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [section, setSection] = useState<Section>("SPECS");
  const [severity, setSeverity] = useState<"MANDATORY" | "SUGGESTED">("SUGGESTED");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = description.trim().length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/defects`, {
        method: "POST",
        body: JSON.stringify({ section, severity, description: description.trim() }),
      });
      setDescription("");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ثبت نقص" width="max-w-[480px]">
      <form onSubmit={submit} className="flex flex-col gap-y-14">
        <Field label="بخش دارای نقص">
          <Select
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
            className="w-full"
          >
            {(Object.keys(SECTION_LABEL) as Section[]).map((s) => (
              <option key={s} value={s}>
                {SECTION_LABEL[s]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="نوع نقص">
          <div className="flex gap-x-16">
            <label className="flex items-center gap-x-6 text-13">
              <input
                type="radio"
                checked={severity === "SUGGESTED"}
                onChange={() => setSeverity("SUGGESTED")}
              />
              پیشنهادی — اقامتگاه فعال می‌ماند
            </label>
            <label className="flex items-center gap-x-6 text-13">
              <input
                type="radio"
                checked={severity === "MANDATORY"}
                onChange={() => setSeverity("MANDATORY")}
              />
              اجباری — اقامتگاه غیرفعال می‌شود
            </label>
          </div>
        </Field>

        <Field label="توضیحات و راهنمای رفع ایراد">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            placeholder="مثلاً: عکس اصلی اقامتگاه واضح نیست، لطفاً یک عکس با نور بهتر جایگزین کنید"
          />
        </Field>

        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}

        <div className="flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" disabled={!valid || saving}>
            {saving ? "در حال ثبت..." : "ثبت نقص"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
