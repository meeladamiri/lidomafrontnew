import { useState } from "react";
import useSWR from "swr";
import AdminLayout from "@/components/Admin/Layout";
import { apiFetch } from "@/api/Admin/adminApi";
import DepositsPanel from "@/components/Admin/DepositsPanel";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
  StatTile,
  TabPills,
  faDate,
  faMoney,
  faNum,
} from "@/components/Admin/ui";

/**
 * Settlement queue.
 *
 * The whole job here is deciding on payout requests, so the page is that queue
 * and nothing else. Money has already left the requester's withdrawable
 * balance by the time a row appears — approving records intent to pay, marking
 * paid settles the ledger row, and rejecting refunds it.
 *
 * Rejection demands a reason. A host who cannot tell why their payout was
 * refused opens a support ticket, and the reason is shown to them.
 */

type Tab = "REQUESTED" | "APPROVED" | "PAID" | "REJECTED";

interface SettlementRow {
  id: number;
  amount: number;
  status: Tab;
  card_last4: string | null;
  shaba_number: string | null;
  owner_name: string | null;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
  user: { id: number; name: string | null; phone: string } | null;
  processed_by: string | null;
}

const STATUS_TONE: Record<Tab, "yellow" | "blue" | "green" | "red"> = {
  REQUESTED: "yellow",
  APPROVED: "blue",
  PAID: "green",
  REJECTED: "red",
};

const STATUS_LABEL: Record<Tab, string> = {
  REQUESTED: "در انتظار بررسی",
  APPROVED: "تأیید شده",
  PAID: "پرداخت شده",
  REJECTED: "رد شده",
};

/**
 * Two jobs, kept as two sections rather than one merged list.
 *
 * «درخواست‌های تسویه» is hosts asking to be paid. «واریز به میزبان» is the site
 * paying, booking by booking, whether or not anyone asked. Odoo kept them in
 * separate models for the same reason: merged, one payout gets recorded twice.
 */
type Section = "settlements" | "deposits";

export default function AdminWalletPage() {
  const [section, setSection] = useState<Section>("settlements");
  const [tab, setTab] = useState<Tab>("REQUESTED");
  const [rejecting, setRejecting] = useState<SettlementRow | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useSWR<{ items: SettlementRow[] }>(
    `/api/admin/wallet/settlements?status=${tab}&take=50`,
    apiFetch
  );

  const rows = data?.items ?? [];
  const pendingTotal = rows.reduce((sum, r) => sum + r.amount, 0);

  async function act(id: number, action: "approve" | "paid" | "reject", body?: unknown) {
    setBusy(id);
    try {
      await apiFetch(`/api/admin/wallet/settlements/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
      });
      await mutate();
      setRejecting(null);
      setReason("");
    } catch (e: any) {
      // The backend's message names the actual problem — a status that no
      // longer allows the transition, usually because someone else acted first.
      alert(e?.message || "انجام نشد");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminLayout title="کیف پول و تسویه">
      <div className="mb-16">
        <TabPills
          tabs={[
            { key: "settlements", label: "درخواست‌های تسویه" },
            { key: "deposits", label: "واریز به میزبان" },
          ]}
          value={section}
          onChange={(k) => setSection(k as Section)}
        />
      </div>

      {section === "deposits" ? (
        <DepositsPanel />
      ) : (
        <SettlementQueue
          tab={tab}
          setTab={setTab}
          rows={rows}
          pendingTotal={pendingTotal}
          isLoading={isLoading}
          error={error}
          busy={busy}
          act={act}
          rejecting={rejecting}
          setRejecting={setRejecting}
          reason={reason}
          setReason={setReason}
        />
      )}
    </AdminLayout>
  );
}

function SettlementQueue({
  tab,
  setTab,
  rows,
  pendingTotal,
  isLoading,
  error,
  busy,
  act,
  rejecting,
  setRejecting,
  reason,
  setReason,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  rows: SettlementRow[];
  pendingTotal: number;
  isLoading: boolean;
  error: unknown;
  busy: number | null;
  act: (id: number, action: "approve" | "paid" | "reject", body?: unknown) => Promise<void>;
  rejecting: SettlementRow | null;
  setRejecting: (r: SettlementRow | null) => void;
  reason: string;
  setReason: (r: string) => void;
}) {
  return (
    <>
      <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2">
        <StatTile label={`تعداد در «${STATUS_LABEL[tab]}»`} value={faNum(rows.length)} />
        <StatTile label="مجموع مبلغ نمایش‌داده‌شده" value={faMoney(pendingTotal)} />
      </div>

      <TabPills
        tabs={(Object.keys(STATUS_LABEL) as Tab[]).map((k) => ({
          key: k,
          label: STATUS_LABEL[k],
        }))}
        value={tab}
        onChange={(k) => setTab(k as Tab)}
      />

      {isLoading ? (
        <Skeleton className="mt-16 h-[320px]" />
      ) : error ? (
        <EmptyState text="دریافت فهرست ممکن نشد" />
      ) : rows.length === 0 ? (
        <EmptyState text={`درخواستی در وضعیت «${STATUS_LABEL[tab]}» نیست`} />
      ) : (
        <div className="mt-16 overflow-x-auto rounded-12 border-1 border-solid border-gray-200 bg-white">
          <table className="w-full min-w-[860px] text-right">
            <thead className="bg-gray-50 text-12 text-gray-500">
              <tr>
                <th className="p-12 font-r">کاربر</th>
                <th className="p-12 font-r">مبلغ</th>
                <th className="p-12 font-r">مقصد</th>
                <th className="p-12 font-r">تاریخ درخواست</th>
                <th className="p-12 font-r">وضعیت</th>
                <th className="p-12 font-r">اقدام</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t-1 border-solid border-gray-100 text-14">
                  <td className="p-12">
                    <div className="font-m text-black">{r.user?.name || "—"}</div>
                    <div className="text-12 text-gray-500">{r.user?.phone}</div>
                  </td>
                  <td className="p-12 font-m">{faMoney(r.amount)}</td>
                  <td className="p-12 text-12 text-gray-600">
                    {/* Only the last four digits. The full number is in the
                        record for whoever makes the transfer, not in a list
                        that sits open on a shared screen. */}
                    {r.shaba_number ? (
                      <div>شبا: {r.shaba_number}</div>
                    ) : r.card_last4 ? (
                      <div>کارت: •••• {r.card_last4}</div>
                    ) : (
                      "—"
                    )}
                    {r.owner_name && <div className="text-gray-500">{r.owner_name}</div>}
                  </td>
                  <td className="p-12 text-12 text-gray-600">{faDate(r.created_at)}</td>
                  <td className="p-12">
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    {r.admin_note && (
                      <div className="mt-4 max-w-[220px] text-11 text-gray-500">{r.admin_note}</div>
                    )}
                  </td>
                  <td className="p-12">
                    <div className="flex flex-wrap gap-8">
                      {r.status === "REQUESTED" && (
                        <Button
                          disabled={busy === r.id}
                          onClick={() => act(r.id, "approve")}
                        >
                          تأیید
                        </Button>
                      )}
                      {r.status === "APPROVED" && (
                        <Button disabled={busy === r.id} onClick={() => act(r.id, "paid")}>
                          پرداخت شد
                        </Button>
                      )}
                      {(r.status === "REQUESTED" || r.status === "APPROVED") && (
                        <Button
                          variant="ghost"
                          disabled={busy === r.id}
                          onClick={() => {
                            setRejecting(r);
                            setReason("");
                          }}
                        >
                          رد
                        </Button>
                      )}
                      {r.processed_by && (
                        <span className="self-center text-11 text-gray-500">
                          توسط {r.processed_by}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!rejecting}
        onClose={() => setRejecting(null)}
        title={`رد درخواست تسویه${rejecting ? ` — ${faMoney(rejecting.amount)}` : ""}`}
      >
        <p className="mb-12 text-13 leading-22 text-gray-600">
          مبلغ به موجودی قابل برداشت کاربر برمی‌گردد و دلیل زیر به او نمایش داده می‌شود.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="دلیل رد درخواست"
          className="mb-12 w-full rounded-8 border-1 border-solid border-gray-200 p-12 text-14 outline-none focus:border-primary-main"
        />
        <div className="flex justify-end gap-8">
          <Button variant="ghost" onClick={() => setRejecting(null)}>
            انصراف
          </Button>
          <Button
            disabled={reason.trim().length < 3 || busy === rejecting?.id}
            onClick={() => rejecting && act(rejecting.id, "reject", { reason: reason.trim() })}
          >
            رد و بازگشت مبلغ
          </Button>
        </div>
      </Modal>
    </>
  );
}
