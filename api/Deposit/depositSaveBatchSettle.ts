import { apiBuilder, toEnvelope } from "./_shared";

export interface IDepositSaveBatchSettle {
  order_ids: number[];
  amount: number;
  desc: string;
  reference: string;
}

/**
 * One bank transfer covering several bookings.
 *
 * The server spreads the amount across them oldest first and stops when it
 * runs out, so a transfer that does not cover everything selected settles what
 * it reaches instead of failing — which is what the money did.
 */
const depositSaveBatchSettle = async ({
  order_ids,
  amount,
  desc,
  reference,
}: IDepositSaveBatchSettle) => {
  const res = await apiBuilder
    .setUrl("/api/deposit/batch-settle")
    .setCallMethod("POST")
    .setBody({
      reservationIds: order_ids,
      amount: Number(amount),
      desc: desc || null,
      reference: reference || null,
    })
    .call();

  return toEnvelope(res);
};

export { depositSaveBatchSettle };
