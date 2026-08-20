import apiBuilder from "../apiBuilder";

const changePassword = async ({
  newPassword,
}: {
  newPassword: string;
  newPasswordRepeat?: string;
}) => {
  const url = `/api/auth/password`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setParams({
      password: newPassword,
    })
    .call();
};

export { changePassword };
