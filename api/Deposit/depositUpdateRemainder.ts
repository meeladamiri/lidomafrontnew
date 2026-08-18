import apiBuilder from "../apiBuilder";

export interface IDepositUpdateRemainder {
  order_id: number;
  amount: number;
  desc: string;
}

const depositUpdateRemainder = async ({ order_id, amount, desc }: IDepositUpdateRemainder) => {
  const url = `/api/internal/update_remainder`;

  const params = {
    order_id,
    amount,
    desc,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { depositUpdateRemainder };
