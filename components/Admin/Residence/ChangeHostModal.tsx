import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetchPaginated, apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, Skeleton } from "@/components/Admin/ui";

/**
 * تغییر میزبان اقامتگاه.
 *
 * A listing changes hands, or was registered under the wrong account, and the
 * only fix used to be editing the database.
 *
 * Two steps on purpose. Choosing the account is a search; handing the listing
 * over is a decision, and it gets its own screen with the server's own list of
 * what will *not* move — the bookings already made, and any money still owed
 * on them. Those stay with the old host, because a reservation records who was
 * paid and rewriting that would make the wallet disagree with the invoice.
 */

interface Candidate {
  id: number;
  name: string | null;
  phone: string;
  isHost: boolean;
  isActive: boolean;
}

interface Preview {
  residence: { id: number; name: string };
  from: { id: number; name: string | null; phone: string } | null;
  to: { id: number; name: string | null; phone: string };
  warnings: string[];
}

export default function ChangeHostModal({
  open,
  onClose,
  residenceId,
  currentHostId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  residenceId: number;
  currentHostId: number | null;
  onSaved: () => void;
}) {
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setPicked(null);
    setPreview(null);
    setNote("");
    setError(null);
  }, [open]);

  // Searching every user, not only hosts: the account a listing should belong
  // to is often a guest account the owner already had.
  const { data, isLoading } = useSWR(
    open && q.trim().length >= 3
      ? `/api/admin/users?q=${encodeURIComponent(q.trim())}&pageSize=8`
      : null,
    (p: string) => apiFetchPaginated<Candidate>(p)
  );

  async function check(candidate: Candidate) {
    setPicked(candidate);
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<Preview>(`/api/admin/residences/${residenceId}/host`, {
        method: "PATCH",
        body: JSON.stringify({ hostId: candidate.id, dryRun: true }),
      });
      setPreview(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "بررسی نشد");
      setPicked(null);
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    if (!picked) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/residences/${residenceId}/host`, {
        method: "PATCH",
        body: JSON.stringify({ hostId: picked.id, note: note.trim() }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  const results = (data?.items ?? []).filter((u) => u.id !== currentHostId);

  return (
    <Modal open={open} onClose={onClose} title="تغییر میزبان اقامتگاه" width="max-w-[560px]">
      {!preview ? (
        <>
          <label className="block mb-12">
            <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
              جستجوی کاربر
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="نام، شماره موبایل یا ایمیل — حداقل ۳ حرف"
              className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
            />
          </label>

          {q.trim().length < 3 ? (
            <p className="py-24 text-center text-13 text-gray-9B9BAA">
              برای پیدا کردن کاربر، حداقل سه حرف بنویسید.
            </p>
          ) : isLoading ? (
            <Skeleton className="h-[160px]" />
          ) : results.length === 0 ? (
            <p className="py-24 text-center text-13 text-gray-9B9BAA">کاربری پیدا نشد.</p>
          ) : (
            <div className="rounded-12 border border-gray-E5E5E6 divide-y divide-gray-F0F0F0 max-h-[280px] overflow-y-auto">
              {results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  disabled={busy || !u.isActive}
                  onClick={() => check(u)}
                  className="w-full flex items-center gap-x-10 px-12 py-10 text-right hover:bg-gray-F7F7F7 transition disabled:opacity-45"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-13 leading-20 text-black truncate">
                      {u.name || "بدون نام"}
                    </span>
                    <span className="block text-12 leading-18 text-gray-6C6A7D" dir="ltr">
                      {u.phone}
                    </span>
                  </span>
                  {u.isHost && <Badge tone="green">میزبان</Badge>}
                  {!u.isActive && <Badge tone="red">غیرفعال</Badge>}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
        </>
      ) : (
        <>
          <div className="rounded-12 border border-gray-E5E5E6 p-14 mb-14">
            <p className="text-12 leading-20 text-gray-9B9BAA mb-6">اقامتگاه</p>
            <p className="text-14 leading-22 font-m text-black mb-10">{preview.residence.name}</p>

            <div className="flex items-center gap-x-10 text-13 leading-22">
              <span className="text-gray-6C6A7D">
                {preview.from?.name || preview.from?.phone || "—"}
              </span>
              <span className="text-gray-9B9BAA">←</span>
              <b className="font-m text-black">{preview.to.name || preview.to.phone}</b>
            </div>
          </div>

          {preview.warnings.length > 0 && (
            <div className="flex flex-col gap-y-8 mb-14">
              {preview.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-x-8">
                  <Badge tone="yellow">توجه</Badge>
                  <span className="text-12 leading-20 text-gray-6C6A7D">{w}</span>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="توضیح — چرا میزبان عوض می‌شود؟"
            className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
          />
          <p className="mt-4 text-11 leading-18 text-gray-9B9BAA">
            با نام شما در تاریخچه‌ی اقامتگاه ثبت می‌شود.
          </p>

          {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
        </>
      )}

      <div className="flex justify-end gap-x-8 mt-16">
        <Button
          variant="secondary"
          onClick={() => (preview ? (setPreview(null), setPicked(null)) : onClose())}
        >
          {preview ? "بازگشت" : "انصراف"}
        </Button>
        {preview && (
          <Button disabled={busy || note.trim().length < 3} onClick={apply}>
            {busy ? "در حال ثبت..." : "تغییر میزبان"}
          </Button>
        )}
      </div>
    </Modal>
  );
}
