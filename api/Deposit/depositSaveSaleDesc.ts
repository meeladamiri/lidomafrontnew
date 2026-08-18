import apiBuilder from "../apiBuilder";

export interface IDepositSaveSaleDesc {
  order_id: number;
  desc: string;
}

const depositSaveSaleDesc = async ({ order_id, desc }: IDepositSaveSaleDesc) => {
  const url = `/api/internal/save_sale_desc`;

  const params = {
    order_id,
    desc,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { depositSaveSaleDesc };
