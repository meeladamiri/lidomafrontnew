import { NextRouter } from "next/router";
import { removeQueryParameters } from "../URL/removeQueryParameters";

function resetPageNumberQueryParam(router: NextRouter) {
  removeQueryParameters(router, [{ paramKey: "page" }]);
}

export default resetPageNumberQueryParam;
