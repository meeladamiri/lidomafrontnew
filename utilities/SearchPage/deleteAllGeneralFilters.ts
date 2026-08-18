import { NextRouter } from "next/router";
import { preserveNonGeneralFiltersQueryParams } from "./preserveNonGeneralFiltersQueryParams";
import { preservingURLRouteParameters } from "./preservingURLRouteParameters";

export function deleteAllGeneralFilters(router: NextRouter) {
  let newParams = new URLSearchParams();

  newParams = preserveNonGeneralFiltersQueryParams(newParams, router);
  newParams = preservingURLRouteParameters(newParams, router);

  router.push({ pathname: router?.pathname, query: newParams.toString() }, undefined, {
    shallow: true,
  });
}
