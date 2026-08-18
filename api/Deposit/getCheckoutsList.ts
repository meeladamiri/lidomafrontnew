import apiBuilder from "../apiBuilder";

export interface ISearchKeywordResultsData {
  count: number;
}

const getCheckoutsList = async ({
  start_date,
  till_date,
}: {
  start_date: string;
  till_date: string;
}) => {
  const url = `/api/internal/get_checkouts`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      start_date,
      till_date,
    })
    .call();
};

export { getCheckoutsList };
