import { useEffect, useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button, Field, Modal, faNum } from "@/components/Admin/ui";

/**
 * تغییر وضعیت اقامتگاه — با توضیحات اجباری.
 *
 * Deactivating used to be a one-click action on the list page and a
 * yes/no confirm on the detail page, and neither recorded why. The reason is
 * the only thing anyone needs months later ("چرا این غیرفعاله؟"), so the note
 * is required by the server, not just asked for here.
 *
 * The panel also states what deactivating now *does*, because the behaviour
 * changed and the old sentence ("از صفحات جستجو حذف می‌شه") was only half of
 * it: the listing leaves search, but its page stays up with the booking box
 * closed. An admin who thinks they are taking the page down would otherwise
 * be surprised to find it still reachable.
 */

const CONSEQUENCE: Record<string, { tone: string; lines: string[] }> = {
  DEACTIVATED: {
    tone: "bg-[#FEF2F2] border-[#FECACA]",
    lines: [
      "از نتایج جستجو، صفحه‌های شهر و «اقامتگاه‌های مشابه» حذف می‌شود.",
      "صفحه‌ی اقامتگاه باز می‌ماند و همه‌ی اطلاعات، تصاویر و نظرات دیده می‌شوند.",
      "باکس رزرو بسته می‌شود و روی صفحه نوشته می‌شود که فعلاً پذیرای مهمان نیست.",
      "رزروهای ثبت‌شده‌ی قبلی دست نمی‌خورند.",
    ],
  },
  PUBLISHED: {
    tone: "bg-[#F0FDF4] border-[#BBF7D0]",
    lines: [
      "اقامتگاه به نتایج جستجو برمی‌گردد.",
      "باکس رزرو دوباره باز می‌شود.",
      "توضیح غیرفعال‌سازی قبلی پاک می‌شود (در تاریخچه می‌ماند).",
    ],
  },
  REJECTED: {
    tone: "bg-[#FEF2F2] border-[#FECACA]",
    lines: ["به میزبان اطلاع داده می‌شود که آگهی رد شده است."],
  },
};

const LABEL: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PENDING: "در انتظار بررسی",
  PUBLISHED: "منتشرشده",
  REJECTED: "رد شده",
  DEACTIVATED: "غیرفعال",
  DELETED: "حذف‌شده",
};

/** Reasons the ops team actually gives, so the common case is one click. */
const PRESETS: Record<string, string[]> = {
  DEACTIVATED: [
    "میزبان درخواست غیرفعال‌سازی موقت داد",
    "اقامتگاه در دست تعمیر است",
    "میزبان پاسخگو نیست",
    "اطلاعات یا تصاویر آگهی با واقعیت نمی‌خواند",
    "اختلاف مالی با میزبان",
  ],
  PUBLISHED: ["مشکل برطرف شد", "میزبان درخواست فعال‌سازی داد", "بررسی آگهی تایید شد"],
};

export default function StateChangeModal({
  open,
  onClose,
  ids,
  state,
  currentState,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** One id from the detail page, or the whole selection from the list. */
  ids: number[];
  state: string;
  /** Only known when acting on a single listing. */
  currentState?: string;
  onSaved: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNote("");
    setError(null);
    setBusy(false);
  }, [open, state]);

  const many = ids.length > 1;
  const info = CONSEQUENCE[state];
  const presets = PRESETS[state] ?? [];

  async function submit() {
    const trimmed = note.trim();
    if (!trimmed) {
      setError("ثبت توضیحات برای تغییر وضعیت الزامی است");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      if (many) {
        await apiFetch("/api/admin/residences/bulk/state", {
          method: "POST",
          body: JSON.stringify({ ids, state, note: trimmed }),
        });
      } else {
        await apiFetch(`/api/admin/residences/${ids[0]}/state`, {
          method: "PATCH",
          body: JSON.stringify({ state, note: trimmed }),
        });
      }
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "تغییر وضعیت انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={many ? `تغییر وضعیت ${faNum(ids.length)} اقامتگاه` : "تغییر وضعیت اقامتگاه"}
      width="max-w-[520px]"
    >
      <div className="mb-16 flex items-center gap-x-8 text-14 leading-24">
        {!many && currentState && (
          <>
            <span className="text-gray-6C6A7D">{LABEL[currentState] ?? currentState}</span>
            <span className="text-gray-9B9BAA">←</span>
          </>
        )}
        <span className="font-b text-black">{LABEL[state] ?? state}</span>
      </div>

      {!!info && (
        <ul className={`mb-16 rounded-8 border px-14 py-12 ${info.tone}`}>
          {info.lines.map((line) => (
            <li key={line} className="text-13 leading-22 text-black flex gap-x-8">
              <span className="text-gray-9B9BAA shrink-0">•</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      <Field label="توضیحات (الزامی)">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="چرا وضعیت این اقامتگاه عوض می‌شود؟"
          className="w-full rounded-8 border border-gray-E3E3E8 px-12 py-10 text-14 leading-24 outline-none focus:border-primary resize-none"
        />
      </Field>

      {!!presets.length && (
        <div className="mt-8 flex flex-wrap gap-6">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setNote((n) => (n.trim() ? `${n.trim()} ${preset}` : preset))}
              className="rounded-full border border-gray-E3E3E8 px-10 py-4 text-12 leading-20 text-gray-6C6A7D hover:border-primary hover:text-primary"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      <p className="mt-10 text-12 leading-20 text-gray-9B9BAA">
        این توضیح در تاریخچه‌ی اقامتگاه ثبت می‌شود و برای مهمان نمایش داده نمی‌شود.
      </p>

      {!!error && <p className="mt-12 text-13 leading-22 text-red-500">{error}</p>}

      <div className="mt-20 flex items-center justify-end gap-x-10">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          انصراف
        </Button>
        <Button
          variant={state === "PUBLISHED" ? "primary" : "danger"}
          onClick={submit}
          disabled={busy || !note.trim()}
        >
          {busy ? "در حال ثبت…" : "ثبت تغییر وضعیت"}
        </Button>
      </div>
    </Modal>
  );
}
