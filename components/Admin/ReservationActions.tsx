import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Button } from "@/components/Admin/ui";

/**
 * «ارسال پیام» — Odoo's send buttons, in the page header.
 *
 * They were a card at the bottom of a column, which put the six things an
 * agent sends during a call below everything they were reading during it.
 * Now they live beside the other header actions.
 *
 * A menu rather than six more buttons: the header already carries print, the
 * calendar and cancel, and nine buttons in a row stop being a toolbar and
 * become a wall. Each item still says what it sends and to whom, so nothing
 * is hidden behind a word like "actions".
 *
 * ⚠️ Sending is in-app notification only for now — `lib/sms.ts` is a stub. The
 * recipient, the text and the log entry are real; the transport is pending.
 */

const SEND_ACTIONS = [
  { kind: "HOST_INFO_TO_GUEST", label: "اطلاعات میزبان به مهمان" },
  { kind: "GUEST_INFO_TO_HOST", label: "اطلاعات مهمان به میزبان" },
  { kind: "RESIDENCE_LINK_TO_GUEST", label: "لینک اقامتگاه" },
  { kind: "VOUCHER_TO_HOST", label: "وچر به میزبان" },
  { kind: "CARD_NUMBER_TO_GUEST", label: "شماره کارت" },
  { kind: "REVIEW_LINK_TO_GUEST", label: "لینک نظرسنجی" },
] as const;

export default function ReservationActions({
  reservationId,
  onActed,
}: {
  reservationId: number;
  onActed: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);

  // A menu that stays open after the pointer has moved on is a menu covering
  // the thing the reader went back to look at.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  async function send(kind: string, label: string) {
    setBusy(kind);
    setError(null);
    setDone(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/actions`, {
        method: "POST",
        body: JSON.stringify({ kind }),
      });
      setDone(`${label} ارسال شد`);
      setOpen(false);
      onActed();
      setTimeout(() => setDone(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "ارسال نشد");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div ref={wrapper} className="relative">
      <Button variant="secondary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <i className="icon-SendMessage text-16" /> ارسال پیام
        <i className={`icon-FlashDown text-14 transition ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute z-3 mt-6 left-0 w-[248px] bg-white rounded-12 border border-gray-E5E5E6 shadow-[0_6px_16px_0px_rgba(8,19,56,0.12)] p-6">
          <p className="px-10 py-6 text-11 leading-18 text-gray-9B9BAA">
            هر ارسال در تاریخچه ثبت می‌شود
          </p>
          {SEND_ACTIONS.map((a) => (
            <button
              key={a.kind}
              type="button"
              disabled={busy === a.kind}
              onClick={() => send(a.kind, a.label)}
              className="w-full text-right px-10 py-8 rounded-10 text-13 leading-20 text-gray-6C6A7D hover:bg-gray-F7F7F7 hover:text-black transition disabled:opacity-50"
            >
              {busy === a.kind ? "در حال ارسال..." : a.label}
            </button>
          ))}
          {error && <p className="px-10 py-6 text-12 text-[#C62828]">{error}</p>}
        </div>
      )}

      {done && (
        <span className="absolute top-full right-0 mt-6 whitespace-nowrap rounded-8 bg-[#03D6BB14] text-[#015046] text-12 leading-20 px-10 py-4">
          {done}
        </span>
      )}
    </div>
  );
}
