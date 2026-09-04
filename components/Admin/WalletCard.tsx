import { useEffect, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { apiFetch } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Skeleton,
  StatTile,
  Toggle,
  Tone,
  faDate,
  faMoney,
} from "@/components/Admin/ui";

type Kind = "BOOKING_INCOME" | "BOOKING_REFUND" | "BOOKING_PAYMENT" | "SETTLEMENT" | "GIFT" | "ADJUSTMENT";
type Status = "PENDING" | "DONE" | "FAILED";

interface WalletTxRow {
  id: number;
  kind: Kind;
  status: Status;
  amount: number;
  balance_after: number;
  description: string;
  failure_reason: string | null;
  reserve_code: string | null;
  reservation_id: number | null;
  created_at: string;
}

interface WalletData {
  credit_balance: number;
  blocked_balance: number;
  gift_balance: number;
  bank_account: {
    credit_number: string | null;
    credit_owner: string | null;
    shaba_number: string | null;
    shaba_owner: string | null;
  };
  min_settlement: number;
  transactions: WalletTxRow[];
  next_cursor: number | null;
}

const KIND_LABEL: Record<Kind, string> = {
  BOOKING_INCOME: "درآمد میزبانی",
  BOOKING_REFUND: "بازگشت وجه به مهمان",
  BOOKING_PAYMENT: "پرداخت رزرو از کیف پول",
  SETTLEMENT: "برداشت (تسویه)",
  GIFT: "هدیه",
  ADJUSTMENT: "اصلاح دستی ادمین",
};

const KIND_TONE: Record<Kind, Tone> = {
  BOOKING_INCOME: "green",
  BOOKING_REFUND: "blue",
  BOOKING_PAYMENT: "purple",
  SETTLEMENT: "yellow",
  GIFT: "purple",
  ADJUSTMENT: "gray",
};

const STATUS_LABEL: Record<Status, string> = {
  PENDING: "در حال انجام",
  DONE: "انجام‌شده",
  FAILED: "ناموفق",
};

const STATUS_TONE: Record<Status, Tone> = {
  PENDING: "yellow",
  DONE: "green",
  FAILED: "red",
};

/**
 * A user's wallet, embedded in their admin profile page.
 *
 * Reads from the same ledger-backed endpoints the guest-facing `/wallet` page
 * and the settlement queue use — nothing here computes a balance on its own.
 * The only write is `adjust`, which always lands as an ADJUSTMENT ledger row
 * (see `wallet.routes.ts`): there is no path that edits a balance directly.
 */
export default function WalletCard({ userId }: { userId: number }) {
  const [adjustDirection, setAdjustDirection] = useState<"credit" | "debit" | null>(null);
  const [rows, setRows] = useState<WalletTxRow[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, isLoading, mutate } = useSWR<WalletData>(
    `/api/admin/wallet/users/${userId}?take=20`,
    apiFetch
  );

  // Re-synced whenever the first page reloads (e.g. right after an adjust) so
  // the accumulated "load more" pages don't drift from a stale first page.
  useEffect(() => {
    if (data) {
      setRows(data.transactions);
      setCursor(data.next_cursor);
    }
  }, [data]);

  async function loadMore() {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await apiFetch<WalletData>(
        `/api/admin/wallet/users/${userId}?take=20&cursor=${cursor}`
      );
      setRows((r) => [...r, ...page.transactions]);
      setCursor(page.next_cursor);
    } finally {
      setLoadingMore(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="p-20">
        <Skeleton className="h-[120px] mb-16" />
        <Skeleton className="h-[220px]" />
      </Card>
    );
  }

  if (!data) return null;

  const hasBank = !!(data.bank_account.credit_number || data.bank_account.shaba_number);

  return (
    <Card className="p-20">
      <div className="flex items-center justify-between flex-wrap gap-y-10 mb-16">
        <h3 className="text-16 leading-24 font-m text-black flex items-center gap-x-8">
          <i className="icon-WalletFill text-20 text-primary-main" />
          کیف پول
        </h3>
        <div className="flex items-center gap-x-8">
          <Button variant="secondary" onClick={() => setAdjustDirection("debit")}>
            <i className="icon-Negative text-14" /> کسر از موجودی
          </Button>
          <Button onClick={() => setAdjustDirection("credit")}>
            <i className="icon-Plus text-14" /> افزایش موجودی
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
        <StatTile
          tone="green"
          label="موجودی قابل برداشت"
          value={faMoney(data.credit_balance)}
          icon={<i className="icon-WalletFill text-18" />}
        />
        <StatTile
          tone="orange"
          label="موجودی مسدود"
          value={faMoney(data.blocked_balance)}
          hint="تا پایان دوره‌ی بازگشت رزرو، قابل برداشت نیست"
          icon={<i className="icon-Timer text-18" />}
        />
        <StatTile
          tone="purple"
          label="موجودی هدیه"
          value={faMoney(data.gift_balance)}
          icon={<i className="icon-GiftFill text-18" />}
        />
      </div>

      {hasBank && (
        <div className="flex flex-wrap items-center gap-x-20 gap-y-6 mb-16 px-14 py-10 rounded-10 bg-gray-F7F7F7 text-12 leading-20 text-gray-6C6A7D">
          <i className="icon-CardBank text-16" />
          {data.bank_account.credit_number && <span>کارت: {data.bank_account.credit_number}</span>}
          {data.bank_account.shaba_number && <span>شبا: {data.bank_account.shaba_number}</span>}
          {data.bank_account.credit_owner && <span>صاحب حساب: {data.bank_account.credit_owner}</span>}
        </div>
      )}

      <h4 className="text-13 leading-20 font-m text-gray-6C6A7D mb-8">تراکنش‌ها</h4>

      {rows.length === 0 ? (
        <EmptyState text="هنوز تراکنشی در کیف پول ثبت نشده" />
      ) : (
        <div className="overflow-x-auto rounded-12 border border-gray-E5E5E6">
          <table className="w-full min-w-[720px] text-right">
            <thead className="bg-gray-F7F7F7 text-12 text-gray-6C6A7D">
              <tr>
                <th className="p-10 font-r">نوع</th>
                <th className="p-10 font-r">مبلغ</th>
                <th className="p-10 font-r">موجودی پس از تراکنش</th>
                <th className="p-10 font-r">توضیح</th>
                <th className="p-10 font-r">رزرو</th>
                <th className="p-10 font-r">تاریخ</th>
                <th className="p-10 font-r">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id} className="border-t border-gray-F0F0F0 text-13 align-top">
                  <td className="p-10">
                    <Badge tone={KIND_TONE[t.kind]}>{KIND_LABEL[t.kind]}</Badge>
                  </td>
                  <td
                    className={`p-10 font-m whitespace-nowrap ${
                      t.amount < 0 ? "text-[#C62828]" : "text-[#015046]"
                    }`}
                  >
                    {t.amount < 0 ? "−" : "+"}
                    {faMoney(Math.abs(t.amount))}
                  </td>
                  <td className="p-10 text-gray-6C6A7D whitespace-nowrap">{faMoney(t.balance_after)}</td>
                  <td className="p-10 text-gray-6C6A7D max-w-[260px]">
                    {t.description}
                    {t.status === "FAILED" && t.failure_reason && (
                      <div className="mt-2 text-[#C62828] text-11">{t.failure_reason}</div>
                    )}
                  </td>
                  <td className="p-10 whitespace-nowrap">
                    {t.reservation_id ? (
                      <Link
                        href={`/admin/reservations/${t.reservation_id}`}
                        className="text-primary-dark font-m"
                      >
                        {t.reserve_code}
                      </Link>
                    ) : (
                      <span className="text-gray-9B9BAA">—</span>
                    )}
                  </td>
                  <td className="p-10 text-gray-6C6A7D whitespace-nowrap">{faDate(t.created_at)}</td>
                  <td className="p-10">
                    <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!!cursor && (
        <div className="flex justify-center mt-14">
          <Button variant="secondary" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? "در حال بارگذاری..." : "نمایش تراکنش‌های قدیمی‌تر"}
          </Button>
        </div>
      )}

      {!!adjustDirection && (
        <AdjustWalletModal
          userId={userId}
          direction={adjustDirection}
          onClose={() => setAdjustDirection(null)}
          onDone={() => {
            setAdjustDirection(null);
            mutate();
          }}
        />
      )}
    </Card>
  );
}

function AdjustWalletModal({
  userId,
  direction,
  onClose,
  onDone,
}: {
  userId: number;
  direction: "credit" | "debit";
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = Number(amount.replace(/[^\d]/g, ""));
  const validAmount = Number.isFinite(parsed) && parsed > 0;
  const validReason = description.trim().length >= 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validAmount || !validReason) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/wallet/users/${userId}/adjust`, {
        method: "POST",
        body: JSON.stringify({
          amount: direction === "credit" ? parsed : -parsed,
          description: description.trim(),
          blocked,
        }),
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={direction === "credit" ? "افزایش موجودی کیف پول" : "کسر از موجودی کیف پول"}
      width="max-w-[460px]"
    >
      <form onSubmit={submit} className="flex flex-col gap-y-14">
        <Field label="مبلغ (تومان)">
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </Field>
        <Field
          label="توضیح / دلیل (حداقل ۳ کاراکتر)"
          hint="این متن با شماره‌ی حساب ادمین شما در دفتر تراکنش‌ها ثبت می‌شود."
        >
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={
              direction === "credit" ? "مثلاً: جبران خسارت لغو رزرو" : "مثلاً: اصلاح خطای واریز قبلی"
            }
          />
        </Field>
        <Toggle
          checked={blocked}
          onChange={setBlocked}
          label={
            direction === "credit"
              ? "به موجودی مسدود اضافه شود (نه قابل‌برداشت فوری)"
              : "از موجودی مسدود کسر شود (نه از موجودی قابل‌برداشت)"
          }
        />

        {!!error && <p className="text-13 text-[#C62828]">{error}</p>}

        <div className="flex items-center gap-x-10 justify-end mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            انصراف
          </Button>
          <Button
            type="submit"
            variant={direction === "debit" ? "danger" : "primary"}
            disabled={!validAmount || !validReason || saving}
          >
            {saving ? "در حال ثبت..." : direction === "credit" ? "افزایش موجودی" : "کسر از موجودی"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
