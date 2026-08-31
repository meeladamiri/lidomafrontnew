import { useState } from "react";
import useSWR from "swr";
import { apiFetch, apiFetchPaginated } from "@/api/Admin/adminApi";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Modal,
  Skeleton,
  TabPills,
  ToolbarPager,
  ToolbarSearch,
  faDate,
  faMoney,
  faNum,
  parseNum,
} from "@/components/Admin/ui";

/**
 * پنل تسویه — what the site owes each host, booking by booking.
 *
 * This is Odoo's `x_clearing` rebuilt. It is deliberately not the same screen
 * as the settlement queue next to it: that one is hosts asking to be paid,
 * this one is the site paying, and most payments here answer no request at
 * all. Keeping them apart is what stops one payout being recorded twice.
 *
 * A booking's row shows the full split, because the number being paid is a
 * subtraction of four others and an admin about to send money should be able
 * to see where it came from without opening anything.
 */

const PAGE_SIZE = 20;

type Filter = "unpaid" | "partial" | "settled" | "all";

interface Payable {
  id: number;
  reference: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  paidAmount: number;
  websiteShare: number | null;
  vatAmount: number | null;
  guestCommission: number | null;
  hostShare: number | null;
  settledAmount: number;
  commissionPercent: number | null;
  remainder: number;
  host: { id: number; name: string | null; phone: string } | null;
  residence: { id: number; name: string } | null;
}

interface Deposit {
  id: number;
  amount: number;
  depositedAt: string;
  txnId: string | null;
  sender: string | null;
  description: string | null;
  host: { id: number; name: string | null; phone: string } | null;
  reservation: { id: number; reference: string } | null;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "unpaid", label: "واریز نشده" },
  { key: "partial", label: "واریز ناقص" },
  { key: "settled", label: "تسویه شده" },
  { key: "all", label: "همه" },
];

export default function DepositsPanel() {
  const [filter, setFilter] = useState<Filter>("unpaid");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [paying, setPaying] = useState<Payable | null>(null);

  const query = new URLSearchParams({
    page: String(page),
    pageSize: String(PAGE_SIZE),
    filter,
    ...(q ? { q } : {}),
  });

  const { data, isLoading, mutate } = useSWR(
    `/api/admin/wallet/deposits/payables?${query.toString()}`,
    (p: string) => apiFetchPaginated<Payable>(p)
  );

  const { data: recent, mutate: mutateRecent } = useSWR<Deposit[]>(
    "/api/admin/wallet/deposits?take=10",
    (p: string) => apiFetch<Deposit[]>(p)
  );

  const rows = data?.items ?? [];
  const owed = rows.reduce((sum, r) => sum + Math.max(r.remainder, 0), 0);

  return (
    <div className="flex flex-col gap-y-16">
      <SchedulerCard />

      <Card className="px-16 py-12 flex items-center justify-between gap-x-16 gap-y-12 flex-wrap">
        <div className="flex items-center gap-x-12 flex-wrap gap-y-8">
          <TabPills
            tabs={FILTERS}
            value={filter}
            onChange={(k) => {
              setFilter(k);
              setPage(1);
            }}
          />
          <ToolbarSearch
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
            placeholder="کد رزرو، نام یا موبایل میزبان"
          />
        </div>
        {data && (
          <ToolbarPager
            page={page}
            pageSize={PAGE_SIZE}
            total={data.meta.total}
            pageCount={data.meta.pageCount}
            onPage={setPage}
          />
        )}
      </Card>

      {rows.length > 0 && (
        <p className="text-13 leading-20 text-gray-6C6A7D">
          مانده‌ی این صفحه: <b className="text-black">{faMoney(owed)}</b>
        </p>
      )}

      {isLoading ? (
        <Skeleton className="h-[320px]" />
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState text="رزروی در این وضعیت نیست" />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-right border-collapse">
            <thead>
              <tr className="bg-gray-F5F5F7 text-12 leading-18 text-gray-6C6A7D">
                <th className="px-12 py-12 font-m whitespace-nowrap">کد رزرو</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">میزبان</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">شروع اقامت</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">مبلغ کل اجاره</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">کارمزد سایت</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">ارزش افزوده</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">سهم میزبان</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">واریز شده</th>
                <th className="px-12 py-12 font-m whitespace-nowrap">مانده واریز</th>
                <th className="px-12 py-12 font-m"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-F0F0F0">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-F5F5F7 transition">
                  <td className="px-12 py-12 whitespace-nowrap">
                    <a
                      href={`/admin/reservations/${r.id}`}
                      className="text-14 font-m text-primary-dark"
                      title={r.residence?.name}
                    >
                      {r.reference}
                    </a>
                  </td>
                  <td className="px-12 py-12">
                    <div className="text-14 leading-20 text-black">{r.host?.name || "بدون نام"}</div>
                    <div className="text-12 leading-18 text-gray-6C6A7D" dir="ltr">
                      {r.host?.phone}
                    </div>
                  </td>
                  <td className="px-12 py-12 text-13 whitespace-nowrap">{faDate(r.startDate)}</td>
                  <td className="px-12 py-12 text-14 whitespace-nowrap">{faNum(r.totalAmount)}</td>
                  <td className="px-12 py-12 text-13 whitespace-nowrap text-gray-6C6A7D">
                    {faNum(r.websiteShare ?? 0)}
                    {r.commissionPercent != null && (
                      <span className="text-11 text-gray-9B9BAA"> ({faNum(r.commissionPercent)}٪)</span>
                    )}
                  </td>
                  <td className="px-12 py-12 text-13 whitespace-nowrap text-gray-6C6A7D">
                    {faNum(r.vatAmount ?? 0)}
                  </td>
                  <td className="px-12 py-12 text-14 font-m whitespace-nowrap">
                    {faNum(r.hostShare ?? 0)}
                  </td>
                  <td className="px-12 py-12 text-13 whitespace-nowrap text-gray-6C6A7D">
                    {faNum(r.settledAmount)}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap">
                    {r.remainder > 0 ? (
                      <span className="text-14 font-m text-[#C62828]">{faNum(r.remainder)}</span>
                    ) : (
                      <Badge tone="green">تسویه شده</Badge>
                    )}
                  </td>
                  <td className="px-12 py-12 whitespace-nowrap">
                    {r.remainder > 0 && (
                      <Button onClick={() => setPaying(r)}>ثبت واریز</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!!recent?.length && (
        <Card className="p-20">
          <h3 className="text-15 leading-24 font-m text-black mb-10">آخرین واریزها</h3>
          <div className="flex flex-col gap-y-8">
            {recent.map((d) => (
              <div
                key={d.id}
                className="flex items-baseline justify-between gap-x-12 flex-wrap text-13 leading-20 py-6 border-b border-gray-F0F0F0 last:border-0"
              >
                <span className="text-black">
                  {faMoney(d.amount)}
                  <span className="text-gray-6C6A7D"> به {d.host?.name || d.host?.phone}</span>
                  {d.reservation && (
                    <span className="text-gray-9B9BAA"> · {d.reservation.reference}</span>
                  )}
                </span>
                <span className="text-12 text-gray-6C6A7D">
                  {faDate(d.depositedAt)}
                  {d.txnId && <> · پیگیری {d.txnId}</>}
                  {d.sender && <> · از {d.sender}</>}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <DepositModal
        payable={paying}
        onClose={() => setPaying(null)}
        onDone={() => {
          setPaying(null);
          mutate();
          mutateRecent();
        }}
      />
    </div>
  );
}

/**
 * Recording a payment.
 *
 * The transaction reference is asked for every time. A deposit row without one
 * cannot be checked against a bank statement, which makes it an assertion
 * rather than a record — and the first time that matters is the first time
 * someone disputes it.
 */
function DepositModal({
  payable,
  onClose,
  onDone,
}: {
  payable: Payable | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [sender, setSender] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remounts per booking, so the amount starts at the full remainder.
  const key = payable?.id ?? 0;
  const [seeded, setSeeded] = useState(0);
  if (payable && seeded !== key) {
    setSeeded(key);
    setAmount(String(payable.remainder));
    setTxnId("");
    setSender("");
    setError(null);
  }

  const value = parseNum(amount);
  const tooMuch = !!payable && value > payable.remainder;

  async function submit() {
    if (!payable?.host) return;
    setBusy(true);
    setError(null);
    try {
      await apiFetch("/api/admin/wallet/deposits", {
        method: "POST",
        body: JSON.stringify({
          hostId: payable.host.id,
          reservationId: payable.id,
          amount: value,
          txnId: txnId.trim() || null,
          sender: sender.trim() || null,
        }),
      });
      onDone();
    } catch (e) {
      // The backend's message is the specific one — an insufficient
      // withdrawable balance, usually because the stay has not started yet
      // and the money is still held.
      setError(e instanceof Error ? e.message : "ثبت واریز انجام نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={!!payable}
      onClose={onClose}
      title={payable ? `ثبت واریز — ${payable.reference}` : ""}
    >
      {payable && (
        <>
          <div className="mb-14 p-12 rounded-10 bg-gray-F5F5F7 text-12 leading-22 text-gray-6C6A7D">
            <div className="flex justify-between">
              <span>مبلغ کل اجاره</span>
              <span className="text-black">{faNum(payable.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>کارمزد میزبان وبسایت</span>
              <span>− {faNum(payable.websiteShare ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>ارزش افزوده</span>
              <span>− {faNum(payable.vatAmount ?? 0)}</span>
            </div>
            <div className="flex justify-between pt-6 mt-6 border-t border-dashed border-gray-E5E5E6">
              <span>مقدار اصلی سهم میزبان</span>
              <span className="text-black font-m">{faNum(payable.hostShare ?? 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>واریز شده تا کنون</span>
              <span>{faNum(payable.settledAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>مانده واریز</span>
              <span className="text-black font-m">{faNum(payable.remainder)}</span>
            </div>
          </div>

          <Field label="مبلغ واریز (تومان)">
            <Input
              inputMode="numeric"
              value={value ? value.toLocaleString("fa-IR") : ""}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Field>

          <div className="grid md:grid-cols-2 gap-12 mt-12">
            <Field label="شماره پیگیری تراکنش">
              <Input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="مثلاً ۱۴۰۵۰۶۰۸۱۲۳۴" />
            </Field>
            <Field label="حساب فرستنده">
              <Input value={sender} onChange={(e) => setSender(e.target.value)} placeholder="نام بانک یا شماره حساب" />
            </Field>
          </div>

          <p className="mt-12 text-12 leading-20 text-gray-9B9BAA">
            این مبلغ از موجودی <b>قابل برداشت</b> میزبان کم می‌شود. اگر اقامت هنوز شروع نشده،
            پول مسدود است و واریز رد می‌شود.
          </p>

          {tooMuch && (
            <p className="mt-8 text-13 text-[#C62828]">مبلغ از مانده‌ی این رزرو بیشتر است.</p>
          )}
          {!!error && <p className="mt-8 text-13 text-[#C62828]">{error}</p>}

          <div className="flex justify-end gap-x-10 mt-16">
            <Button variant="secondary" onClick={onClose}>
              انصراف
            </Button>
            <Button disabled={busy || value <= 0 || tooMuch} onClick={submit}>
              {busy ? "در حال ثبت..." : "ثبت واریز"}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}

interface SchedulerJob {
  name: string;
  everyMinutes: number;
  running: boolean;
  runs: number;
  failures: number;
  skipped: number;
  lastRunAt: string | null;
  lastOkAt: string | null;
  lastError: string | null;
  lastResult: { checked?: number; released?: number } | null;
}

interface SchedulerStatus {
  enabled: boolean;
  started: boolean;
  locking: boolean;
  jobs: SchedulerJob[];
}

const JOB_LABELS: Record<string, string> = {
  "release-matured": "آزادسازی سهم میزبان",
};

/**
 * Whether the money is moving on its own.
 *
 * Worth a card rather than a line, because the failure it reports is silent:
 * a scheduler that stopped looks exactly like a week with no matured stays.
 * The last successful run is the number that distinguishes them, so it is the
 * one shown largest.
 */
function SchedulerCard() {
  const { data, mutate } = useSWR<SchedulerStatus>(
    "/api/admin/wallet/scheduler",
    (p: string) => apiFetch<SchedulerStatus>(p),
    { refreshInterval: 60_000 }
  );

  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  if (!data) return null;

  const job = data.jobs.find((j) => j.name === "release-matured");
  const off = !data.enabled || !data.started;

  async function runNow() {
    setBusy(true);
    setNote(null);
    try {
      const r = await apiFetch<{ released?: number; checked?: number }>(
        "/api/admin/wallet/release-matured",
        { method: "POST" }
      );
      setNote(
        r?.released
          ? `${faNum(r.released)} رزرو آزاد شد`
          : "رزروی برای آزادسازی نبود"
      );
      mutate();
    } catch (e) {
      setNote(e instanceof Error ? e.message : "اجرا نشد");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="px-16 py-12 flex items-center justify-between gap-x-16 gap-y-10 flex-wrap">
      <div className="flex items-center gap-x-12 flex-wrap gap-y-6">
        <Badge tone={off ? "red" : "green"}>{off ? "زمان‌بند خاموش" : "زمان‌بند فعال"}</Badge>
        <span className="text-13 leading-20 text-gray-6C6A7D">
          {JOB_LABELS[job?.name ?? ""] ?? job?.name}
          {job && <> · هر {faNum(job.everyMinutes)} دقیقه</>}
          {job?.lastOkAt ? (
            <> · آخرین اجرای موفق {faDate(job.lastOkAt)}</>
          ) : (
            <> · هنوز اجرا نشده</>
          )}
        </span>
        {job?.running && <Badge tone="blue">در حال اجرا</Badge>}
        {!!job?.failures && <Badge tone="red">{faNum(job.failures)} خطا</Badge>}
      </div>

      <div className="flex items-center gap-x-10">
        {note && <span className="text-12 text-gray-6C6A7D">{note}</span>}
        <Button variant="secondary" disabled={busy} onClick={runNow}>
          {busy ? "در حال اجرا..." : "اجرای دستی"}
        </Button>
      </div>
    </Card>
  );
}

