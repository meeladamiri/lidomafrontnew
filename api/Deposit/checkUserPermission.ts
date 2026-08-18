import apiBuilder from "../apiBuilder";

const checkUserPermission = async () => {
  const url = `/api/internal/has_permission`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({})
    .call();
};

export { checkUserPermission };
