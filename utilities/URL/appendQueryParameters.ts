import { NextRouter } from "next/router";
import { get_URLSearchParamsInitValues_fromNextJsRouterQueryObj } from "./get_URLSearchParamsInitValues_fromNextJsRouterQueryObj";

export const appendQueryParameters = (
  router: NextRouter,
  parameters: [
    string, // param key
    string | number | boolean // param value
  ][]
) => {
  const { pathname, query } = router;

  const url_search_params_init_values =
    get_URLSearchParamsInitValues_fromNextJsRouterQueryObj(query);

  const params = new URLSearchParams(url_search_params_init_values);

  parameters.forEach((p) => {
    const paramKey = p[0];
    const paramValue = p[1]?.toString();

    params.append(paramKey, paramValue);
  });

  router.push({ pathname, query: params.toString() }, undefined, { shallow: true });
};
