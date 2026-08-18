import { NextRouter } from "next/router";
import { get_URLSearchParamsInitValues_fromNextJsRouterQueryObj } from "./get_URLSearchParamsInitValues_fromNextJsRouterQueryObj";

export const removeQueryParametersWithoutScrolling = (
  router: NextRouter,
  parameters: { paramKey: string; paramValue?: string }[]
) => {
  const { pathname, query } = router;

  const url_search_params_init_values =
    get_URLSearchParamsInitValues_fromNextJsRouterQueryObj(query);

  const params = new URLSearchParams(url_search_params_init_values);

  // const params = new URLSearchParams(query as any);
  parameters.forEach((p) => {
    const paramKey = p.paramKey;
    const paramValue = p.paramValue;

    // To remove a parameter with a specific KEY And a specific VALUE, you SHOULD pass 'paramValue';
    // If you want to delete ALL matching params associated with 'paramKey', then don't pass the 'paramValue';
    if (!paramValue) {
      params.delete(paramKey);
    } else {
      // @ts-ignore
      params.delete(paramKey, paramValue);
    }
  });

  // In Nextjs 13scroll:false is not working so i have to use window.history to prevent scroll behavior
  // router.push({ pathname, query: params.toString() }, undefined, { shallow: true, scroll: false });
  
  window.history.replaceState(null, "", pathname.replace("[id]", router.query.id as any))
};
