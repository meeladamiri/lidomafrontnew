//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const chargeWallet = async ({ amount }: { amount: number }) => {
  const url = `/api/users/charge_wallet`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      amount,
    })
    .call();
};

const getPaymentToken = async ({ order_id }: { order_id: number }) => {
  const url = `/api/payment/get_token`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ order_id })
    .call();
};

const startPay = async ({ token, return_url }: { token: string; return_url: string }) => {
  const url = `/api/payment/start_pay?acquirer_id=11&token=${token}&return_url=${return_url}`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({})
    .setBody({
      acquirer_id: 11, // static for now
      token,
      return_url,
    })
    .call();
};

export { chargeWallet, getPaymentToken, startPay };
