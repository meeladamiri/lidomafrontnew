import { getObserveResidence } from "@/api/observe";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
// import { getResIdFromURL } from "@/utilities/PropertyPage/getResIdFromURL";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useGetObserveResidence() {
  const { query } = useRouter();
  const resId = query?.id;

  const result = useQuery(
    ["getObserveResidence", resId],
    () =>
      getObserveResidence({
        product_id: Number(resId),
      }),
    {
      enabled: !!resId, 
    }
  );

  useEffect(() => {
    if (!!result?.data) {
      if (result?.data?.status === "error") {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: result?.data?.err_msg || "مشکلی در دریافت اطلاعات اقامتگاه پیش آمد",
          },
        ]);
      }
    }
  }, [result?.data]);

  return result;
}
