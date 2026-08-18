import apiBuilder from "../apiBuilder";

export interface IDepositSaveBatchSettle {
  order_ids: number[];
  amount: number;
  desc: string;
  reference: string;
}

const depositSaveBatchSettle = async ({
  order_ids,
  amount,
  desc,
  reference,
}: IDepositSaveBatchSettle) => {
  const url = `/api/internal/save_batch_settle`;

  const params = {
    order_ids,
    amount,
    desc,
    reference,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { depositSaveBatchSettle };
