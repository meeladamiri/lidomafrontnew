import { NextRouter } from "next/router";
import { get_URLSearchParamsInitValues_fromNextJsRouterQueryObj } from "./get_URLSearchParamsInitValues_fromNextJsRouterQueryObj";

// NOTE: This function first removes already existing params (specified ones in parametersToRemove)
//       Then appends the params in parametersToAppend
export function removeSomeQueryParameters_Then_AddSomeQueryParameters(
  router: NextRouter,
  parametersToRemove: string[],
  parametersToAppend: [
    string, // param key
    string | number | boolean // param value
  ][],
  customPathname?: string,
  addToHistory = true
) {
  const { pathname, query } = router;

  const url_search_params_init_values =
    get_URLSearchParamsInitValues_fromNextJsRouterQueryObj(query);

  const params = new URLSearchParams(url_search_params_init_values);

  parametersToRemove.forEach((p) => {
    params.delete(p);
  });

  parametersToAppend.forEach((p) => {
    params.append(p[0], p[1].toString());
  });

  if (!!addToHistory) {
    router.push({ pathname: customPathname || pathname, query: params.toString() }, undefined, {
      shallow: true,
      scroll: false,
    });
  } else {
    router.replace({ pathname: customPathname || pathname, query: params.toString() }, undefined, {
      shallow: true,
      scroll: false,
    });
  }
}
