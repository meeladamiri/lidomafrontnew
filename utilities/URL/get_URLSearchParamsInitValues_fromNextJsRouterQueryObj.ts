import { ParsedUrlQuery } from "querystring";

export function get_URLSearchParamsInitValues_fromNextJsRouterQueryObj(query: ParsedUrlQuery) {
  const initial_values = Object.entries(query || {}).map(([k, v]) => {
    const value = v as string | string[];
    return (typeof value === "string" ? [value] : value)?.map((el) => [k, el]);
  });

  const initial_values_flattened = initial_values.flat();

  return initial_values_flattened;
}
