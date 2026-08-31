import { useEffect, useState } from "react";
import { apiFetch } from "@/api/Admin/adminApi";
import { Badge, Button, Modal, faMoney, faNum } from "@/components/Admin/ui";

/**
 * ویرایش کارمزد، مالیات و کارمزد مهمان.
 *
 * These are ordinarily derived from settings, but a booking is sometimes
 * agreed on different terms — a waived guest fee, a negotiated commission —
 * and until now the only way to record that was to edit the rent, which made
 * the invoice say something untrue about the nightly rate.
 *
 * Amounts are typed and the percentages follow, so a later reprice reproduces
 * the same deal instead of quietly restoring the default. The preview is the
 * server's own dry run rather than arithmetic done here, so what is confirmed
 * is what will be written.
 */

interface Terms {
  totalAmount: number;
  websiteShare: number | null;
  vatAmount: number | null;
  guestCommission: number | null;
  hostShare: number | null;
}

interface Preview {
  before: { website_share: number; vat_amount: number; guest_commission: number; host_share: number };
  after: { website_share: number; vat_amount: number; guest_commission: number; host_share: number };
  difference: { host_share: number; guest_due: number };
  warnings: string[];
}

export default function EditTermsModal({
  open,
  onClose,
  reservationId,
  terms,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  reservationId: number;
  terms: Terms;
  onSaved: () => void;
}) {
  const [websiteShare, setWebsiteShare] = useState("");
  const [vatAmount, setVatAmount] = useState("");
  const [guestCommission, setGuestCommission] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setWebsiteShare(String(Math.round(terms.websiteShare ?? 0)));
    setVatAmount(String(Math.round(terms.vatAmount ?? 0)));
    setGuestCommission(String(Math.round(terms.guestCommission ?? 0)));
    setNote("");
    setPreview(null);
    setError(null);
  }, [open, terms.websiteShare, terms.vatAmount, terms.guestCommission]);

  const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;
  const body = {
    websiteShare: num(websiteShare),
    vatAmount: num(vatAmount),
    guestCommission: num(guestCommission),
  };

  const changed =
    body.websiteShare !== Math.round(terms.websiteShare ?? 0) ||
    body.vatAmount !== Math.round(terms.vatAmount ?? 0) ||
    body.guestCommission !== Math.round(terms.guestCommission ?? 0);

  async function check() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch<Preview>(`/api/admin/reservations/${reservationId}/terms`, {
        method: "PATCH",
        body: JSON.stringify({ ...body, dryRun: true }),
      });
      setPreview(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "محاسبه نشد");
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/reservations/${reservationId}/terms`, {
        method: "PATCH",
        body: JSON.stringify({ ...body, note: note.trim() }),
      });
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ذخیره نشد");
    } finally {
      setBusy(false);
    }
  }

  /** The rent is fixed here — it is the nightly rates' business, not this. */
  const hostShare = Math.max(terms.totalAmount - body.websiteShare - body.vatAmount, 0);
  const percent = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

  return (
    <Modal open={open} onClose={onClose} title="ویرایش کارمزد و مالیات" width="max-w-[560px]">
      <p className="text-12 leading-20 text-gray-9B9BAA mb-14">
        مبلغ کل اجاره ({faMoney(terms.totalAmount)}) از نرخ شب‌ها می‌آید و اینجا تغییر نمی‌کند —
        برای آن از «ویرایش قیمت رزرو» استفاده کنید.
      </p>

      <Amount
        label="کارمزد میزبان وبسایت"
        hint={`${faNum(Math.round(percent(body.websiteShare, terms.totalAmount) * 10) / 10)}٪ از اجاره`}
        value={websiteShare}
        onChange={(v) => {
          setWebsiteShare(v);
          setPreview(null);
        }}
      />
      <Amount
        label="ارزش افزوده"
        hint={`${faNum(Math.round(percent(body.vatAmount, body.websiteShare) * 10) / 10)}٪ از کارمزد`}
        value={vatAmount}
        onChange={(v) => {
          setVatAmount(v);
          setPreview(null);
        }}
      />
      <Amount
        label="کارمزد مهمان وبسایت"
        hint={`${faNum(Math.round(percent(body.guestCommission, terms.totalAmount) * 10) / 10)}٪، افزوده به پرداختی مهمان`}
        value={guestCommission}
        onChange={(v) => {
          setGuestCommission(v);
          setPreview(null);
        }}
      />

      <div className="rounded-10 bg-gray-F5F5F7 p-12 mt-4 mb-14">
        <Line label="سهم میزبان پس از کسر" value={faMoney(hostShare)} strong />
        <Line
          label="مبلغ کل جهت پرداختی مهمان"
          value={faMoney(terms.totalAmount + body.guestCommission)}
        />
      </div>

      {preview && (
        <div className="rounded-10 border border-gray-E5E5E6 p-12 mb-14">
          <p className="text-12 leading-20 text-gray-6C6A7D mb-8">پس از ذخیره</p>
          <Delta label="سهم میزبان" a={preview.before.host_share} b={preview.after.host_share} />
          <Delta label="کارمزد سایت" a={preview.before.website_share} b={preview.after.website_share} />
          <Delta label="ارزش افزوده" a={preview.before.vat_amount} b={preview.after.vat_amount} />
          <Delta
            label="کارمزد مهمان"
            a={preview.before.guest_commission}
            b={preview.after.guest_commission}
          />
          {preview.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-x-8 mt-8">
              <Badge tone="yellow">توجه</Badge>
              <span className="text-11 leading-18 text-gray-6C6A7D">{w}</span>
            </div>
          ))}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="توضیح — چرا این مبالغ عوض می‌شود؟"
        className="w-full rounded-10 border border-gray-E5E5E6 p-12 text-13 leading-22 outline-none focus:border-primary-main"
      />
      <p className="mt-4 text-11 leading-18 text-gray-9B9BAA">
        با نام شما در تاریخچه‌ی رزرو ثبت می‌شود.
      </p>

      {error && <p className="mt-10 text-13 text-[#C62828]">{error}</p>}

      <div className="flex justify-end gap-x-8 mt-16">
        <Button variant="secondary" onClick={onClose}>
          انصراف
        </Button>
        {!preview ? (
          <Button disabled={busy || !changed} onClick={check}>
            {busy ? "..." : "محاسبه‌ی تغییر"}
          </Button>
        ) : (
          <Button disabled={busy || note.trim().length < 3} onClick={apply}>
            {busy ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        )}
      </div>
    </Modal>
  );
}

function Amount({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const n = Number(value.replace(/[^\d]/g, "")) || 0;
  return (
    <label className="grid grid-cols-[1fr_auto] gap-x-10 items-center mb-10">
      <span className="min-w-0">
        <span className="block text-13 leading-20 text-black">{label}</span>
        <span className="block text-11 leading-18 text-gray-9B9BAA">{hint}</span>
      </span>
      <input
        inputMode="numeric"
        value={n ? n.toLocaleString("fa-IR") : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="۰"
        className="w-[150px] px-12 py-8 rounded-10 border border-gray-E5E5E6 text-13 leading-20 text-center outline-none focus:border-primary-main"
      />
    </label>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-x-12 py-2">
      <span className="text-12 leading-20 text-gray-6C6A7D">{label}</span>
      <span className={`text-13 leading-20 whitespace-nowrap ${strong ? "font-m text-black" : "text-gray-6C6A7D"}`}>
        {value}
      </span>
    </div>
  );
}

function Delta({ label, a, b }: { label: string; a: number; b: number }) {
  const moved = Math.abs(a - b) >= 1;
  return (
    <div className="flex items-baseline justify-between gap-x-10 py-2 text-12 leading-20">
      <span className="text-gray-6C6A7D">{label}</span>
      <span className="whitespace-nowrap">
        <span className="text-gray-9B9BAA">{faNum(Math.round(a))}</span>
        {" → "}
        <b className={`font-m ${moved ? (b > a ? "text-[#2E7D32]" : "text-[#C62828]") : "text-gray-9B9BAA"}`}>
          {faNum(Math.round(b))}
        </b>
      </span>
    </div>
  );
}
