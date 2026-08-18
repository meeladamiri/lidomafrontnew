import { ParsedUrlQuery } from "querystring";

export function getResIdFromURL(query: ParsedUrlQuery) {
  return Number((query?.combination as string)?.split("-")?.at(-1));
}
