import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { adminImageUrl, Badge, Button, Card, Modal, faDate } from "@/components/Admin/ui";

const STEP_LABEL: Record<string, string> = {
  specs: "نام و توضیحات",
  amenities: "امکانات",
  rules: "قوانین و شرایط",
  pricing: "نرخ‌گذاری",
  capacity: "ظرفیت و اتاق‌ها",
  gallery: "تصاویر",
  documents: "مدارک",
};

const FIELD_LABEL: Record<string, string> = {
  name: "نام",
  description: "توضیحات",
  floor: "طبقه",
  totalArea: "متراژ کل",
  foundationArea: "زیربنا",
  weekPrice: "نرخ روزهای عادی",
  weekendPrice: "نرخ آخر هفته",
  peakPrice: "نرخ ایام پیک",
  extraGuestsPrice: "نرخ نفر اضافه",
  weeklyDiscount: "تخفیف هفتگی",
  monthlyDiscount: "تخفیف ماهانه",
  capacity: "ظرفیت استاندارد",
  maxCapacity: "حداکثر ظرفیت",
  checkinFrom: "ورود از",
  checkinTo: "ورود تا",
  checkout: "خروج",
  minReservableDays: "حداقل شب رزرو",
  cancellationPolicy: "قانون لغو",
  other: "سایر امکانات (متن آزاد)",
  documentUrl: "سند اقامتگاه",
  hostNationalCardUrl: "کارت ملی میزبان",
  ownerNationalCardUrl: "کارت ملی مالک",
};

/**
 * The gallery can't use the field table: a photo is not a value to read in a
 * cell, and «الان روی سایت» for images means the whole live gallery. So the
 * proposal is shown as what it is — thumbnails to be added, and which of the
 * current ones would go.
 */
function GalleryDiff({
  proposal,
  liveImages,
}: {
  proposal: { add?: { url: string; title?: string | null }[]; removeIds?: number[]; main?: unknown };
  liveImages: { id: number; url: string }[];
}) {
  const added = proposal.add ?? [];
  const removed = liveImages.filter((image) => (proposal.removeIds ?? []).includes(image.id));

  return (
    <div className="flex flex-col gap-y-12">
      {added.length > 0 && (
        <div>
          <p className="text-12 text-gray-6C6A7D mb-6">
            تصاویر پیشنهادی برای افزودن ({added.length})
          </p>
          <div className="flex flex-wrap gap-8">
            {added.map((image, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${image.url}-${index}`}
                src={adminImageUrl(image.url, 240)}
                alt=""
                className="w-[96px] h-[72px] object-cover rounded-8 border border-gray-E5E5E6"
              />
            ))}
          </div>
        </div>
      )}

      {removed.length > 0 && (
        <div>
          <p className="text-12 text-gray-6C6A7D mb-6">
            تصاویری که حذف می‌شوند ({removed.length})
          </p>
          <div className="flex flex-wrap gap-8">
            {removed.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={adminImageUrl(image.url, 240)}
                alt=""
                className="w-[96px] h-[72px] object-cover rounded-8 border-2 border-[#C62828] opacity-60"
              />
            ))}
          </div>
        </div>
      )}

      {proposal.main !== undefined && proposal.main !== null && (
        <p className="text-12 text-gray-6C6A7D">میزبان تصویر اصلی را عوض کرده است.</p>
      )}

      {added.length === 0 && removed.length === 0 && proposal.main == null && (
        <p className="text-12 text-gray-9B9BAA">فقط ترتیب تصاویر تغییر کرده است.</p>
      )}
    </div>
  );
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return `${v.length} مورد`;
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/**
 * A host-submitted edit to an already-published listing, waiting on an
 * admin. `pendingChanges` is keyed by wizard step (`specs`, `pricing`, …) —
 * see the backend's `queuePendingChange`/`residencePendingChanges.service.ts`.
 * The live columns on `residence` are untouched until this is approved, so
 * every row here is genuinely "what a guest sees now" vs "what the host is
 * proposing".
 */
export default function PendingChangesCard({
  residenceId,
  residence,
  pendingChanges,
  submittedAt,
  onSaved,
}: {
  residenceId: number;
  residence: Record<string, any>;
  pendingChanges: Record<string, any>;
  submittedAt: string | null;
  onSaved: () => void;
}) {
  const [showReject, setShowReject] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = Object.keys(pendingChanges);
  if (steps.length === 0) return null;

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/pending-changes/approve`, {
        method: "POST",
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تأیید انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-20 border-2 border-blue-main/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-16 leading-24 font-m text-black">ویرایش در انتظار بررسی</h3>
        <Badge tone="blue">{submittedAt ? faDate(submittedAt) : ""}</Badge>
      </div>
      <p className="text-11 leading-18 text-gray-9B9BAA mb-14">
        تا زمان تأیید یا رد، نسخه‌ی فعلی (ستون «الان روی سایت») همچنان برای مهمان‌ها نمایش داده
        می‌شود.
      </p>

      <div className="flex flex-col gap-y-16 mb-16">
        {steps.map((stepKey) => {
          const payload = pendingChanges[stepKey] ?? {};
          const entries = Object.entries(payload).filter(([k]) => k !== "step" && k !== "scopeIds");
          if (stepKey === "gallery") {
            return (
              <div key={stepKey}>
                <h4 className="text-13 font-m text-black mb-8">{STEP_LABEL[stepKey]}</h4>
                <GalleryDiff proposal={payload} liveImages={residence.images ?? []} />
              </div>
            );
          }

          return (
            <div key={stepKey}>
              <h4 className="text-13 font-m text-black mb-8">{STEP_LABEL[stepKey] ?? stepKey}</h4>
              <div className="overflow-x-auto rounded-10 border border-gray-E5E5E6">
                <table className="w-full min-w-[480px] text-right text-12">
                  <thead className="bg-gray-F7F7F7 text-gray-6C6A7D">
                    <tr>
                      <th className="p-8 font-r">فیلد</th>
                      <th className="p-8 font-r">الان روی سایت</th>
                      <th className="p-8 font-r">پیشنهاد میزبان</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map(([field, proposed]) => (
                      <tr key={field} className="border-t border-gray-F0F0F0">
                        <td className="p-8 text-gray-6C6A7D">{FIELD_LABEL[field] ?? field}</td>
                        <td className="p-8 text-gray-9B9BAA">{fmt(residence[field])}</td>
                        <td className="p-8 font-m text-black">{fmt(proposed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {!!error && <p className="mb-10 text-13 text-[#C62828]">{error}</p>}

      <div className="flex items-center gap-x-10">
        <Button disabled={busy} onClick={approve}>
          {busy ? "در حال ثبت..." : "تأیید و اعمال روی سایت"}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => setShowReject(true)}>
          رد با ذکر دلیل
        </Button>
      </div>

      <RejectModal
        open={showReject}
        residenceId={residenceId}
        onClose={() => setShowReject(false)}
        onDone={() => {
          setShowReject(false);
          onSaved();
        }}
      />
    </Card>
  );
}

function RejectModal({
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
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (reason.trim().length < 3) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/pending-changes/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="رد تغییرات پیشنهادی" width="max-w-[460px]">
      <form onSubmit={submit} className="flex flex-col gap-y-12">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="دلیل رد تغییرات را بنویسید..."
          className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
        />
        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}
        <div className="flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" variant="danger" disabled={reason.trim().length < 3 || saving}>
            {saving ? "در حال ثبت..." : "رد کن"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
