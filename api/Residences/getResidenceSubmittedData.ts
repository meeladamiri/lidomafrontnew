import apiBuilder from "../apiBuilder";

const getResidenceSubmittedData = async ({
  step,
  productId,
}: {
  step: number;
  productId: number;
}) => {
  const url = `/api/new_residence/get_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id: productId,
      step,
    })
    .call();
};

export { getResidenceSubmittedData };
