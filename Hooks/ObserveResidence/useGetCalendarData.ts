import { getCalendarData } from "@/api/Calendar/Calendar";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import exception from "@/utilities/exception";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface I_useGetCalendarData {
  residenceType: ResidenceTypes_enum;
  residenceOrRoomId: number | undefined;
}

export function useGetCalendarData({ residenceType, residenceOrRoomId }: I_useGetCalendarData) {
  const result = useQuery(
    ["getCalendarData", residenceOrRoomId],
    () => {
      return getCalendarData({
        residenceId: residenceOrRoomId as number,
        residenceType,
      });
    },
    {
      enabled: !!residenceOrRoomId,
    }
  );

  useEffect(() => {
    if (!!result?.data) {
      if (result?.data?.status === "error") {
        exception.message([
          {
            type: EXCEPTIONTYPES.ERROR,
            title: result?.data?.err_msg || "مشکلی در دریافت تقویم اقامتگاه پیش آمد",
          },
        ]);
      }
    }
  }, [result?.data]);

  return result;
}
