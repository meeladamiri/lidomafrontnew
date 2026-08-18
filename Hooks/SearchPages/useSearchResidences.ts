import { searchResidences } from "@/api/Search/search";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { getSearchResidences_API_params } from "@/utilities/SearchPage/getSearchResidences_API_params";
import { getSearchResidences_Query_dep_array } from "@/utilities/SearchPage/getSearchResidences_Query_dep_array";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useSearchResidences() {
  const router = useRouter();
  const { query } = router;

  const result = useQuery(
    getSearchResidences_Query_dep_array({
      query: query,
    }),
    () => {
      const params = getSearchResidences_API_params({
        query: query,
      });

      return searchResidences(params);
    },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (!!result?.data) {
      if (result?.data?.status === "error") {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: result?.data?.err_msg || defaultError },
        ]);
      } else {
        //
      }
    }
  }, [result?.data]);

  return result;
}
