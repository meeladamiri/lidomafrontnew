import { apiBuilder, toEnvelope } from "./_shared";

export interface IDepositEditBankInfo {
  host_id: number;
  card: string;
  card_owner: string;
  shaba_number: string;
  shaba_owner: string;
}

/**
 * Edits the host's bank details.
 *
 * Writes the same record the host edits from their own wallet page. Finance
 * correcting a mistyped shaba should fix it everywhere, not create a second
 * copy that only the payout desk can see.
 */
const depositEditBankInfo = async ({
  host_id,
  card,
  card_owner,
  shaba_number,
  shaba_owner,
}: IDepositEditBankInfo) => {
  const res = await apiBuilder
    .setUrl(`/api/deposit/hosts/${host_id}/bank`)
    .setCallMethod("PUT")
    .setBody({
      card: card || null,
      cardOwner: card_owner || null,
      shaba: shaba_number || null,
      shabaOwner: shaba_owner || null,
    })
    .call();

  return toEnvelope(res);
};

export { depositEditBankInfo };
