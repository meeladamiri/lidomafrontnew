import apiBuilder from "../apiBuilder";

export interface IDepositEditBankInfo {
  host_id: number
  card: string;
  card_owner: string;
  shaba_number: string;
  shaba_owner: string;
}

const depositEditBankInfo = async ({
  host_id,
  card,
  card_owner,
  shaba_number,
  shaba_owner,
}: IDepositEditBankInfo) => {
  const url = `/api/internal/save_bank_info`;

  const params = {
    host_id,
    card,
    card_owner,
    shaba_number,
    shaba_owner,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { depositEditBankInfo };
