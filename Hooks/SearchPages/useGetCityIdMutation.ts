import { getCityId } from "@/api/Search/getCityId";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { useMutation } from "@tanstack/react-query";

export function useGetCityIdMutation() {
  let onSuccessCbFn: (cityOrProvinceName: string) => void;

  // Why God?? Whyyyy? Why should we call a seperate api to 'only' get the city id!! ://
  // Negotiation failed with backend ://
  // I don't know should i call this a mutation or a queryyyy./..
  const getCityIdMutation = useMutation(
    ({
      cityName,
      onSuccessCb,
    }: {
      cityName: string;
      onSuccessCb: (cityOrProvinceName: string) => void;
    }) => {
      // Just storing a refrence so that we can have access to it inside 'onSuccess' of API call!!
      onSuccessCbFn = onSuccessCb;
      return getCityId(cityName);
    },
    {
      onSuccess: (data) => {
        if (!!data && data?.status === "success") {
          const cityName: string = data?.params?.title_en;

          if (!!onSuccessCbFn) {
            onSuccessCbFn(cityName);
          }
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: "مشکلی در دریافت اطلاعات شهر پیش آمد. لطفا دوباره امتحان کنید.",
            },
          ]);
        }
      },
    }
  );

  return getCityIdMutation;
}
