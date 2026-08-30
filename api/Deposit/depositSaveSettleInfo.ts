import { apiBuilder, toEnvelope } from "./_shared";

export interface IDepositSaveSettleInfo {
  order_id: number;
  amount: number;
  type: string;
  desc: string;
  reference: string;
  pay_with: string;
}

/**
 * Records one payment against one booking.
 *
 * `type` is the settlement method the panel's dropdown offers — مانده واریز,
 * واریز بیعانه, or کسر بدهی میزبان — and the backend keeps them apart rather
 * than treating all three as "money out": the last one moves no money at all.
 */
const depositSaveSettleInfo = async ({
  order_id,
  amount,
  type,
  desc,
  reference,
  pay_with,
}: IDepositSaveSettleInfo) => {
  const res = await apiBuilder
    .setUrl("/api/deposit/settle")
    .setCallMethod("POST")
    .setBody({
      reservationId: order_id,
      amount: Number(amount),
      type,
      desc: desc || null,
      reference: reference || null,
      payWith: pay_with || null,
    })
    .call();

  return toEnvelope(res);
};

export { depositSaveSettleInfo };
