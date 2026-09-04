import { useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Card, Field, Modal, faDate } from "@/components/Admin/ui";

/**
 * Admin suspension — independent of the host's own فعال/غیرفعال toggle and
 * of `state` itself. A suspended listing's `state` stays PUBLISHED; this
 * only hides it (forces `published` false, see the backend's
 * `syncPublishedFlag`) until lifted.
 */
export default function SuspensionCard({
  residenceId,
  suspendedAt,
  suspensionReason,
  onSaved,
}: {
  residenceId: number;
  suspendedAt: string | null;
  suspensionReason: string | null;
  onSaved: () => void;
}) {
  const [showSuspend, setShowSuspend] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unsuspend() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/unsuspend`, { method: "POST" });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "رفع تعلیق انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-16 leading-24 font-m text-black">تعلیق</h3>
        {suspendedAt ? <Badge tone="red">معلق</Badge> : <Badge tone="gray">معلق نیست</Badge>}
      </div>
      <p className="text-11 leading-18 text-gray-9B9BAA mb-14">
        مستقل از فعال/غیرفعال‌سازی خود میزبان — اقامتگاه معلق حتی اگر میزبان آن را فعال نگه داشته
        باشد، در سایت نمایش داده نمی‌شود.
      </p>

      {suspendedAt ? (
        <>
          <p className="text-13 leading-22 text-black mb-4">
            از {faDate(suspendedAt)} معلق است.
          </p>
          {!!suspensionReason && (
            <p className="text-12 leading-20 text-gray-6C6A7D mb-14">
              دلیل نمایش‌داده‌شده به میزبان: {suspensionReason}
            </p>
          )}
          <Button variant="secondary" disabled={busy} onClick={unsuspend}>
            {busy ? "در حال ثبت..." : "رفع تعلیق"}
          </Button>
        </>
      ) : (
        <Button variant="danger" onClick={() => setShowSuspend(true)}>
          تعلیق اقامتگاه
        </Button>
      )}

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <SuspendModal
        open={showSuspend}
        residenceId={residenceId}
        onClose={() => setShowSuspend(false)}
        onDone={() => {
          setShowSuspend(false);
          onSaved();
        }}
      />
    </Card>
  );
}

function SuspendModal({
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
  const [internalNote, setInternalNote] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = internalNote.trim().length >= 3 && reason.trim().length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/suspend`, {
        method: "POST",
        body: JSON.stringify({ internalNote: internalNote.trim(), reason: reason.trim() }),
      });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="تعلیق اقامتگاه" width="max-w-[520px]">
      <form onSubmit={submit} className="flex flex-col gap-y-14">
        <Field
          label="توضیحات داخلی (فقط برای تیم پشتیبانی)"
          hint="روی سایت یا برای میزبان نمایش داده نمی‌شود."
        >
          <textarea
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            rows={3}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            placeholder="مثلاً: گزارش کلاهبرداری در حال بررسی توسط تیم حقوقی"
          />
        </Field>
        <Field label="دلیل نمایشی (به میزبان نشان داده می‌شود)">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main transition"
            placeholder="مثلاً: در حال بررسی گزارش‌های ثبت‌شده در مورد این اقامتگاه هستیم"
          />
        </Field>

        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}

        <div className="flex items-center gap-x-10 justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button type="submit" variant="danger" disabled={!valid || saving}>
            {saving ? "در حال ثبت..." : "تعلیق کن"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
