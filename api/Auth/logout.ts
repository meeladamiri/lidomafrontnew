import apiBuilder from "../apiBuilder";
import { getRefreshToken } from "@/utilities/cookies";

const logout = async () => {
  const url = `/api/auth/logout`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setParams({ refreshToken: getRefreshToken() })
    .call();
};

export { logout };
