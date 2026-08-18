import apiBuilder from "../apiBuilder";

const changePassword = async ({
  //   oldPassword,
  newPassword,
  newPasswordRepeat,
}: {
  //   oldPassword: string;
  newPassword: string;
  newPasswordRepeat: string;
}) => {
  const url = `/api/user/change_password`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      //   old_pass: oldPassword,
      pass: newPassword,
      pass_repeat: newPasswordRepeat,
    })
    .call();
};

export { changePassword };
