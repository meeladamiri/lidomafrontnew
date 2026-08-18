import apiBuilder from "../apiBuilder";

const changeResidencesStatusGetObserveResidence = async ({ product_id }: { product_id: number }) => {
  const url = `/api/residence/get_images`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id,
    })
    .call();
};

export {changeResidencesStatusGetObserveResidence}
