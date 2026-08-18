import apiBuilder from "../apiBuilder";

const getHolidays = async ({
  year,
}: {
  year: number; // ex: 1401
}) => {
  const url = `/api/get_holidays`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      year,
    })
    .call();
};

export { getHolidays };
