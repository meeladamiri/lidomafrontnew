import { NextRouter } from "next/router";

export function isOnlyOneItemSelected({ router }: { router: NextRouter }) {
  if (typeof router?.query?.roomId === "string" && !router?.query?.residenceId) {
    return Number(router?.query?.roomId);
  } else if (!router?.query?.roomId && typeof router?.query?.residenceId === "string") {
    return Number(router?.query?.residenceId);
  } else {
    return 0;
  }
}
