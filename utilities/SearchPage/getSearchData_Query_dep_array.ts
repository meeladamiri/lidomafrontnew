import { ParsedUrlQuery } from "querystring";
// import { determineResidenceTypeFromUrl } from "./determineResidenceTypeFromUrl";

export function getSearchData_Query_dep_array({ query }: { query: ParsedUrlQuery }) {
  return [
    "getSearchData",
    query?.cat_name,
    ...Object.values(query), // add all query parameters as dependencies
  ];
}
