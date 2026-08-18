interface IAuth {
  token: string;
  // expireDate?: any;
}

// import { PROJECTNAME } from "configs/info";
import jsCookie from "js-cookie";

export const MizbanToken = "session_id";

export const setUserToken = ({
  token,
}: //  expireDate
{
  token: string;
  // expireDate?: any;
}) => {
  jsCookie.set(MizbanToken, token || "", {
    // secure: process.env.NODE_ENV === "production",
    // expires: new Date(expireDate),
    expires: 14,
  });
};

export const getUserToken = (): string => {
  return jsCookie.get(MizbanToken) || "";
};

export const removeUserToken = () => {
  jsCookie.remove(MizbanToken);
};
