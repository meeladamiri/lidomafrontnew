import { NextRouter } from "next/router";

export function preserveNonGeneralFiltersQueryParams(
  paramsObj: URLSearchParams,
  router: NextRouter
): URLSearchParams {
  // Start of preserving filters which can be applied from outside of this Modal;
  // NOTE: Some filters can be applied both from inside of this modal and from ouside of this modal.
  //       Do Not preserve them bcz this modal can mutate them.
  //       Only preserve the filters which can 'only' be applied from outside this modal;
  if (!!router?.query?.start && !!router?.query?.end) {
    paramsObj.append("start", router?.query?.start as string);
    paramsObj.append("end", router?.query?.end as string);
  }
  if (!!router?.query?.guests_count) {
    paramsObj.append("guests_count", router?.query?.guests_count as string);
  }
  if (!!router?.query?.order) {
    paramsObj.append("order", router?.query?.order as string);
  }
  // End of preserving filters which can be applied from outside of this Modal;

  return paramsObj;
}
