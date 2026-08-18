import apiBuilder from "../apiBuilder";

const logout = async () => {
  const url = `/api/logout`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { logout };
