import { apiBuilder, toEnvelope } from "./_shared";

export interface IDepositSaveSaleDesc {
  order_id: number;
  desc: string;
}

/** توضیحات تیم فروش — an internal note on the booking. */
const depositSaveSaleDesc = async ({ order_id, desc }: IDepositSaveSaleDesc) => {
  const res = await apiBuilder
    .setUrl(`/api/deposit/${order_id}/description`)
    .setCallMethod("PATCH")
    .setBody({ desc })
    .call();

  return toEnvelope(res);
};

export { depositSaveSaleDesc };
