import apiBuilder from "./apiBuilder";

/**
 * Wallet.
 *
 * What this replaces called three Odoo endpoints the new backend never
 * implemented — `users/panel/wallet`, `users/save_bank_info` and
 * `submit_clearing_req` — so the page's only real behaviour was an error toast.
 */

export type WalletTransactionKind =
  | "BOOKING_INCOME"
  | "BOOKING_REFUND"
  | "SETTLEMENT"
  | "GIFT"
  | "ADJUSTMENT";

export type WalletTransactionStatus = "PENDING" | "DONE" | "FAILED";

export type SettlementStatus = "REQUESTED" | "APPROVED" | "PAID" | "REJECTED";

export interface IWalletTransaction {
  id: number;
  kind: WalletTransactionKind;
  status: WalletTransactionStatus;
  /** Signed: positive is money in, negative is money out. */
  amount: number;
  balance_after: number;
  description: string;
  failure_reason: string | null;
  reserve_code: string | null;
  created_at: string;
}

export interface IBankAccount {
  credit_number: string | null;
  credit_owner: string | null;
  shaba_number: string | null;
  shaba_owner: string | null;
}

export interface IWalletSummary {
  credit_balance: number;
  blocked_balance: number;
  gift_balance: number;
  bank_account: IBankAccount;
  /** The server-side floor for a payout request. */
  min_settlement: number;
}

export interface ISettlement {
  id: number;
  amount: number;
  status: SettlementStatus;
  card_last4: string | null;
  shaba_number: string | null;
  owner_name: string | null;
  admin_note: string | null;
  processed_at: string | null;
  created_at: string;
}

const unwrap = (res: any) => res?.data;

export async function getWallet(): Promise<IWalletSummary | null> {
  const res = await apiBuilder.setUrl("/api/wallet").setCallMethod("GET").call();
  return unwrap(res) ?? null;
}

export async function getWalletTransactions(params: { cursor?: number; take?: number } = {}) {
  const res = await apiBuilder
    .setUrl("/api/wallet/transactions")
    .setCallMethod("GET")
    .setParams({
      ...(params.cursor ? { cursor: params.cursor } : {}),
      ...(params.take ? { take: params.take } : {}),
    })
    .call();

  return (unwrap(res) ?? { items: [], next_cursor: null }) as {
    items: IWalletTransaction[];
    next_cursor: number | null;
  };
}

export interface IUpdateBankInfo {
  cartNumber: string;
  cartOwnerName: string;
  shabaNumber: string;
  shabaOwnerName: string;
}

export async function updateBankInfo(input: IUpdateBankInfo): Promise<IBankAccount | null> {
  const res = await apiBuilder
    .setUrl("/api/wallet/bank-account")
    .setCallMethod("PUT")
    .setBody({
      // Empty strings mean "cleared", which the backend stores as null rather
      // than as an empty card number.
      credit_card: input.cartNumber || null,
      credit_owner: input.cartOwnerName || null,
      shaba: input.shabaNumber || null,
      shaba_owner: input.shabaOwnerName || null,
    })
    .call();

  return unwrap(res) ?? null;
}

export async function getSettlements(params: { cursor?: number; take?: number } = {}) {
  const res = await apiBuilder
    .setUrl("/api/wallet/settlements")
    .setCallMethod("GET")
    .setParams({
      ...(params.cursor ? { cursor: params.cursor } : {}),
      ...(params.take ? { take: params.take } : {}),
    })
    .call();

  return (unwrap(res) ?? { items: [], next_cursor: null }) as {
    items: ISettlement[];
    next_cursor: number | null;
  };
}

/** Returns the created request, or throws the backend's message. */
export async function requestSettlement(amount: number) {
  const res = await apiBuilder
    .setUrl("/api/wallet/settlements")
    .setCallMethod("POST")
    .setBody({ amount })
    .call();

  if (res?.status === "error") {
    throw new Error(res?.message || "درخواست تسویه ثبت نشد");
  }
  return unwrap(res);
}
