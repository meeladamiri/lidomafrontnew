// import { PROJECTNAME } from "configs/info";
import jsCookie from "js-cookie";

export const MizbanToken = "session_id"; // holds the JWT access token
export const MizbanRefreshToken = "refresh_token";

export const setUserToken = ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}) => {
  jsCookie.set(MizbanToken, accessToken || "", {
    // secure: process.env.NODE_ENV === "production",
    expires: 14,
  });
  if (refreshToken) {
    jsCookie.set(MizbanRefreshToken, refreshToken, {
      expires: 30,
    });
  }
};

export const getUserToken = (): string => {
  return jsCookie.get(MizbanToken) || "";
};

export const getRefreshToken = (): string => {
  return jsCookie.get(MizbanRefreshToken) || "";
};

export const removeUserToken = () => {
  jsCookie.remove(MizbanToken);
  jsCookie.remove(MizbanRefreshToken);
};
