import { NextRouter } from "next/router";

export function isResOrRoomChecked({
  resOrRoomId,
  parameterKey,
  router,
}: {
  resOrRoomId: number;
  parameterKey: string;
  router: NextRouter;
}) {
  return !router?.query?.[parameterKey]
    ? false
    : Array.isArray(router?.query?.[parameterKey])
    ? router?.query?.[parameterKey]?.includes(resOrRoomId.toString())
    : // 'router?.query?.[parameterKey]' is a string
      router?.query?.[parameterKey] === resOrRoomId.toString();
}
