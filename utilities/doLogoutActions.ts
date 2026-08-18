import { removeUserToken } from "@/utilities/cookies";
import { QueryClient } from "@tanstack/react-query";
import { NextRouter } from "next/router";
import { Non_authorization_routes } from "@/constants/Non_authorization_routes";

function doLogoutActions(router: NextRouter, queryClient: QueryClient) {
  // clear session_id
  removeUserToken();

  queryClient.invalidateQueries(["checkUserStatus"]);
  // queryClient.invalidateQueries(["getAccountInfo"]);

  if (!Non_authorization_routes.includes(router.pathname)) {
    router.push("/");
  }
}

export { doLogoutActions };
