export type I_Deposit_Settlement_Method = "deposit" | "remainder" | "host_debit";
export type I_Deposit_Method = "shaba" | "card";

export interface IRemainderInitV {
  amount: number;
  reference: string;
  desc: string;
}

export interface IHostDebitInitVInitV {
  amount: null | number;
}

export interface IDepositInitV {
  amount: number;
  reference: string;
  desc: string;
}

export interface IBatchSettleInitV {
  reference: string;
  desc: string;
}

export interface IHostInfoInitV {
  card: string;
  cardOwner: string;
  shabaNumber: string;
  shabaOwner: string;
}

export interface IUpdateRemainderInitV {
  amount: number;
  desc: string;
}
