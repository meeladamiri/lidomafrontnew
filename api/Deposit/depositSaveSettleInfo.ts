import apiBuilder from "../apiBuilder";

export interface IDepositSaveSettleInfo {
  order_id: number;
  amount: number;
  type: string;
  desc: string;
  reference: string;
  pay_with: string;
}

const depositSaveSettleInfo = async ({
  order_id,
  amount,
  type,
  desc,
  reference,
  pay_with,
}: IDepositSaveSettleInfo) => {
  const url = `/api/internal/save_settle_info`;

  const params = {
    order_id,
    amount,
    type,
    desc,
    reference,
    pay_with,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { depositSaveSettleInfo };
