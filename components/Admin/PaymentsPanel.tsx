import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Modal,
  Skeleton,
  faDate,
  faDateTime,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

/**
 * پرداخت‌های مهمان.
 *
 * Not every booking is paid through the gateway, and almost none of the
 * expensive ones are paid in one go: 9,445 of the bookings migrated from Odoo
 * carry more than one payment, up to thirteen. Recording that as a single
 * «مبلغ پرداختی» meant the answer to "how much have they actually sent us"
 * lived in somebody's chat history.
 *
 * A payment is never deleted, only voided with a reason. The row stays and
 * stops counting, because "we thought we had been paid on the 3rd" is the
 * fact a dispute turns on.
 */

const METHODS = [
  { value: "CARD_TRANSFER", label: "کارت به کارت" },
  { value: "BANK_TRANSFER", label: "واریز بانکی" },
  { value: "CASH", label: "نقدی" },
  { value: "GATEWAY", label: "درگاه پرداخت" },
  { value: "WALLET", label: "کیف پول" },
  { value: "OTHER", label: "سایر" },
] as const;

interface Payment {
  id: number;
  amount: number;
  method: string;
  method_label: string;
  paid_at: string;
  reference: string | null;
  note: string | null;
  recorded_by: string | null;
  voided_at: string | null;
  voided_reason: string | null;
}

interface Ledger {
  items: Payment[];
  summary: {
    due: number;
    paid: number;
    remaining: number;
    overpaid: number;
    ledger_started: boolean;
    stored_paid_amount: number;
  };
}

export default function PaymentsPanel({
  reservationId,
  canRecord,
  onChanged,
}: {
  reservationId: number;
  /** Off for cancelled bookings — the backend refuses them anyway. */
  canRecord: boolean;
  onChanged: () => void;
}) {
  const { data, isLoading, mutate } = useSWR<Ledger>(
    `/api/admin/reservations/${reservationId}/payments`,
    (p: string) => apiFetch<Ledger>(p)
  );

  const [adding, setAdding] = useState(false);
  const [voiding, setVoiding] = useState<Payment | null>(null);

  const s = data?.summary;

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between gap-x-12 flex-wrap gap-y-8 mb-14">
        <h3 className="text-16 leading-24 font-m text-black">پرداخت‌های مهمان</h3>
        {canRecord && <Button onClick={() => setAdding(true)}>ثبت پرداخت</Button>}
      </div>

      {isLoading || !s ? (
        <Skeleton className="h-[140px]" />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-10 mb-14">
            <Tile label="مبلغ کل جهت پرداختی" value={faMoney(s.due)} />
            <Tile label="جمع پرداختی" value={faMoney(s.paid)} tone={s.paid > 0 ? "green" : undefined} />
            <Tile
              label={s.overpaid > 0 ? "اضافه‌پرداخت" : "باقی‌مانده"}
              value={faMoney(s.overpaid > 0 ? s.overpaid : s.remaining)}
              tone={s.overpaid > 0 ? "amber" : s.remaining > 0 ? "red" : "green"}
            />
          </div>

          {s.overpaid > 0 && (
            <p className="mb-12 text-12 leading-20 text-[#B26A00]">
              مهمان بیشتر از مبلغ رزرو پرداخت کرده — مابه‌التفاوت باید برگردد.
            </p>
          )}

          {data.items.length === 0 ? (
            <EmptyState
              text={
                s.stored_paid_amount > 0
                  ? `پرداختی ثبت‌شده‌ای در دفتر نیست، ولی ${faMoney(s.stored_paid_amount)} روی این رزرو ثبت است. با اولین ثبت پرداخت، این مبلغ به‌عنوان مانده‌ی اول وارد دفتر می‌شود.`
                  : "پرداختی ثبت نشده"
              }
            />
          ) : (
            <div className="rounded-12 border border-gray-E5E5E6 divide-y divide-gray-F0F0F0">
              {data.items.map((p) => (
                <PaymentRow
                  key={p.id}
                  payment={p}
                  onVoid={canRecord ? () => setVoiding(p) : undefined}
                />
              ))}
            </div>
          )}
        </>
      )}

      <AddPaymentModal
        open={adding}
        reservationId={reservationId}
        suggested={s ? Math.max(s.remaining, 0) : 0}
        onClose={() => setAdding(false)}
        onDone={() => {
          mutate();
          onChanged();
        }}
      />

      <VoidPaymentModal
        payment={voiding}
        onClose={() => setVoiding(null)}
        onDone={() => {
          mutate();
          onChanged();
        }}
      />
    </Card>
  );
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "green" | "red" | "amber";
}) {
  const color =
    tone === "green"
      ? "text-[#2E7D32]"
      : tone === "red"
        ? "text-[#C62828]"
        : tone === "amber"
          ? "text-[#B26A00]"
          : "text-black";

  return (
    <div className="rounded-12 border border-gray-E5E5E6 p-12">
      <span className="block text-11 leading-18 text-gray-9B9BAA mb-4">{label}</span>
      <strong className={`block text-14 leading-22 font-m ${color}`}>{value}</strong>
    </div>
  );
}

function PaymentRow({ payment, onVoid }: { payment: Payment; onVoid?: () => void }) {
  const voided = !!payment.voided_at;

  return (
    <div className={`flex items-start justify-between gap-x-12 px-14 py-10 ${voided ? "opacity-55" : ""}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-x-8 flex-wrap gap-y-4">
          <b className={`text-14 leading-22 font-m ${voided ? "line-through text-gray-9B9BAA" : "text-black"}`}>
            {faMoney(payment.amount)}
          </b>
          <Badge tone="gray">{payment.method_label}</Badge>
          {voided && <Badge tone="red">باطل شده</Badge>}
        </div>
        <p className="text-11 leading-18 text-gray-9B9BAA mt-2">
          {faDate(payment.paid_at)} ساعت {faDateTime(payment.paid_at)[1]}
          {payment.reference ? ` · پیگیری ${payment.reference}` : ""}
          {payment.recorded_by ? ` · ثبت ${payment.recorded_by}` : ""}
        </p>
        {payment.note && (
          <p className="text-12 leading-20 text-gray-6C6A7D mt-2 break-words">{payment.note}</p>
        )}
        {voided && payment.voided_reason && (
          <p className="text-11 leading-18 text-[#C62828] mt-2">دلیل ابطال: {payment.voided_reason}</p>
        )}
      </div>

      {!voided && onVoid && (
        <button
          type="button"
          onClick={onVoid}
          className="shrink-0 text-11 leading-18 text-gray-9B9BAA hover:text-[#C62828] transition"
        >
          ابطال
        </button>
      )}
    </div>
  );
}

function AddPaymentModal({
  open,
  reservationId,
  suggested,
  onClose,
  onDone,
}: {
  open: boolean;
  reservationId: number;
  suggested: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<string>("CARD_TRANSFER");
  const [paidAt, setPaidAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = Number(amount.replace(/[^\d]/g, "")) || 0;

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: value,
          method,
          paidAt: new Date(paidAt).toISOString(),
          reference: reference.trim() || null,
          note: note.trim() || null,
        }),
      });
      setAmount("");
      setReference("");
      setNote("");
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ثبت نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="ثبت پرداخت مهمان" width="max-w-[520px]">
      <label className="block mb-12">
        <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">مبلغ (تومان)</span>
        <input
          inputMode="numeric"
          value={value ? value.toLocaleString("fa-IR") : ""}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مبلغ این واریز"
          className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
        />
        {suggested > 0 && (
          <button
            type="button"
            onClick={() => setAmount(String(suggested))}
            className="mt-6 text-11 leading-18 text-primary-dark hover:underline"
          >
            کل باقی‌مانده: {faNum(suggested)} تومان
          </button>
        )}
      </label>

      <div className="grid md:grid-cols-2 gap-12 mb-12">
        <label className="block">
          <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">روش پرداخت</span>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 bg-white outline-none focus:border-primary-main"
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          {/* When the money moved, not when this was typed — they differ on
              every payment recorded the morning after. */}
          <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
            تاریخ و ساعت واریز
          </span>
          <input
            type="datetime-local"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 outline-none focus:border-primary-main"
          />
          <span className="block mt-4 text-11 leading-18 text-gray-9B9BAA">
            {paidAt ? faDate(paidAt) : ""}
          </span>
        </label>
      </div>

      <label className="block mb-12">
        <span className="block mb-6 text-12 leading-18 text-gray-6C6A7D font-m">
          شماره پیگیری / فیش (اختیاری)
        </span>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          dir="ltr"
          className="w-full px-14 py-10 rounded-10 border border-gray-E5E5E6 text-14 leading-22 text-right outline-none focus:border-primary-main"
        />
      </label>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="توضیح (اختیاری)"
        className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
      />

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-8 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button disabled={busy || value <= 0 || !paidAt} onClick={submit}>
          {busy ? "در حال ثبت..." : "ثبت پرداخت"}
        </Button>
      </div>
    </Modal>
  );
}

function VoidPaymentModal({
  payment,
  onClose,
  onDone,
}: {
  payment: Payment | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!payment) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/payments/${payment.id}/void`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      setReason("");
      onDone();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ابطال نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!payment} onClose={onClose} title="ابطال پرداخت" width="max-w-[460px]">
      <p className="text-13 leading-22 text-gray-6C6A7D mb-10">
        پرداخت <b className="text-black">{payment && faMoney(payment.amount)}</b> از جمع پرداختی
        کسر می‌شود. ردیف پاک نمی‌شود و با دلیل شما در دفتر می‌ماند.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="چرا این پرداخت باطل می‌شود؟"
        className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
      />
      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}
      <div className="flex justify-end gap-x-8 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        <Button variant="danger" disabled={busy || reason.trim().length < 3} onClick={submit}>
          {busy ? "در حال ابطال..." : "ابطال پرداخت"}
        </Button>
      </div>
    </Modal>
  );
}
