import { removeUserToken } from "@/utilities/cookies";
import { setAxiosToken } from "api";
import { QueryClient } from "@tanstack/react-query";
import { NextRouter } from "next/router";
import { Non_authorization_routes } from "@/constants/Non_authorization_routes";

function doLogoutActions(router: NextRouter, queryClient: QueryClient) {
  // clear session_id
  removeUserToken();
  setAxiosToken("");

  /**
   * Everything the signed-in person's session put in the cache goes with them.
   *
   * Invalidating one key was not enough: `invalidate` only marks a query
   * stale, so every other answer — the profile, reservations, wallet
   * balance, chat threads — stayed in memory and was rendered instantly to
   * whoever signed in next on the same device, until each key refetched. On a
   * shared phone that is one person's bookings shown to another.
   *
   * `clear` is right here rather than `removeQueries` per key: after a logout
   * there is no cached answer worth keeping, and listing the keys to drop is a
   * list that goes stale the moment a screen is added.
   */
  queryClient.clear();

  if (!Non_authorization_routes.includes(router.pathname)) {
    router.push("/");
  }
}

export { doLogoutActions };
