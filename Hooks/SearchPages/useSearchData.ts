import { getSearchData } from "@/api/Search/searchData";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { getSearchData_Query_dep_array } from "@/utilities/SearchPage/getSearchData_Query_dep_array";
import { getSearchResidences_API_params } from "@/utilities/SearchPage/getSearchResidences_API_params";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useSearchData() {
  const router = useRouter();
  const { query } = router;

  const result = useQuery(
    getSearchData_Query_dep_array({
      query: query,
    }),
    () => {
      const params = getSearchResidences_API_params({
        query: query,
      });

      return getSearchData({ cat_name: params?.filters?.cat_name, features: params?.features });
    },
    {
      // keepPreviousData: true,
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
