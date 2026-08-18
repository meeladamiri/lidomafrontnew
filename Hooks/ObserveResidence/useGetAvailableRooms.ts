import { getAvailableRooms } from "@/api/Boomgardi";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
// import { getResIdFromURL } from "@/utilities/PropertyPage/getResIdFromURL";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect } from "react";

export function useGetAvailableRooms() {
  const { selectedRanges } = useBoomgardiPropertyPageData();
  const { query } = useRouter();
  const boomgardiResId = query?.id;

  const result = useQuery(
    ["getAvailableRooms", boomgardiResId, selectedRanges?.[0]?.[0], selectedRanges?.[0]?.[1]],
    () => {
      return getAvailableRooms({
        residenceId: Number(boomgardiResId),
        startDate: selectedRanges?.[0]?.[0].format("jYYYY/jMM/jDD"),
        endDate: (selectedRanges?.[0]?.[1] as moment.Moment)?.format("jYYYY/jMM/jDD"),
      });
    },
    {
      enabled:
        !!boomgardiResId &&
        (selectedRanges.length === 0 || (!!selectedRanges[0][0] && !!selectedRanges[0][1])),
    }
  );

  useEffect(() => {
    if (!!result?.data) {
      if (result?.data?.status === "error") {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: result?.data?.err_msg || "مشکلی در دریافت اطلاعات اتاق ها پیش آمد",
          },
        ]);
      }
    }
  }, [result?.data]);

  return result;
}
