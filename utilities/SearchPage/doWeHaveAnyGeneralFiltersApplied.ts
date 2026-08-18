import { ParsedUrlQuery } from "querystring";

export function doWeHaveAnyGeneralFiltersApplied(query: ParsedUrlQuery): boolean {
  return Object.keys(query).some((key) => {
    if (
      key === "guests_count" ||
      key === "start" ||
      key === "end" ||
      key === "id" ||
      key === "order" ||
      key === "page"
    )
      return false;
    return true;
  });
}
