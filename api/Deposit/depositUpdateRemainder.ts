import { apiBuilder, toEnvelope } from "./_shared";

export interface IDepositUpdateRemainder {
  order_id: number;
  amount: number;
  desc: string;
}

/**
 * Overrides «مانده واریز» for one booking.
 *
 * The amount is the new remaining figure, not a delta — that is what the form
 * asks for. The reason is required, and the change is logged as a correction
 * so the booking's history still shows what it was before.
 */
const depositUpdateRemainder = async ({ order_id, amount, desc }: IDepositUpdateRemainder) => {
  const res = await apiBuilder
    .setUrl(`/api/deposit/${order_id}/remainder`)
    .setCallMethod("PATCH")
    .setBody({ amount: Number(amount), desc })
    .call();

  return toEnvelope(res);
};

export { depositUpdateRemainder };
