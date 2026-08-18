import apiBuilder from "../apiBuilder";

const checkUserStatus = async () => {
  const url = `/api/user/get_data`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      test_param: "09361323233",
    })
    .call();
};

export { checkUserStatus };
