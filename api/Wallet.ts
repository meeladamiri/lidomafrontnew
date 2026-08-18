//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

interface IServerTransaction {
  amount: number;
  date: string; // ex: "2023-01-07"
  destination: string;
  reserve_code: string;
  status: "success" | string;
  // payment_reference?: string;
  // payment_time: string;
  // reserve_reference: string;
  // state: string;
}

export interface IWalletData {
  blocked_balance: number;
  credit_balance: number;
  gift_balance: number;
  transactions: IServerTransaction[];
  bank_account: {
    credit_number?: string; // TODO: bebin tuye api string miad ya number? yeskish bayad bashe.
    credit_owner?: string;
    shaba_number?: string; // TODO: bebin tuye api string miad ya number? yeskish bayad bashe.
    shaba_owner?: string;
  };
}

export interface IUpdateBankInfo {
  cartNumber: string;
  cartOwnerName: string;
  shabaNumber: string;
  shabaOwnerName: string;
}

const updateBankInfo = async ({
  cartNumber,
  cartOwnerName,
  shabaNumber,
  shabaOwnerName,
}: IUpdateBankInfo) => {
  const url = `/api/users/save_bank_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      credit_card: cartNumber,
      credit_owner: cartOwnerName,
      shaba: shabaNumber,
      shaba_owner: shabaOwnerName,
    })
    .call();
};

const getWalletAndTransactions = async () => {
  const url = `/api/users/panel/wallet`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const submitTasfieRequest = async () => {
  const url = `/api/submit_clearing_req`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { updateBankInfo, getWalletAndTransactions, submitTasfieRequest };
