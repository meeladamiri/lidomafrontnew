import apiBuilder from "../apiBuilder";

const getAllowedValues = async ({ step }: { step: number }) => {
  const url = `/api/residence/get_allowed_values`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      step,
    })
    .call();
};

export { getAllowedValues };
