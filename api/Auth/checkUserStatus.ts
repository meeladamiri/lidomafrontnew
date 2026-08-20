import apiBuilder from "../apiBuilder";

const checkUserStatus = async () => {
  const url = `/api/auth/me`;

  return apiBuilder.setUrl(url).setCallMethod("GET").call();
};

export { checkUserStatus };
