import { getPaymentToken } from "@/api/Payment";
import { Button } from "@/components/General/core/Button";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { useUserProfile } from "@/providers/Profile";
import exception from "@/utilities/exception";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

function UserHasCurrentTrip() {
  const profileData = useUserProfile();
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const timerRef = useRef<any>(null);
  const tokenRef = useRef<string>();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!!profileData && !!profileData.current_trip && !!profileData.current_trip.expiry_date) {
      timerRef.current = setInterval(async () => {
        const { getTimeDiff } = await import("@/utilities/Time");

        const diff = getTimeDiff(
          Date.now(),
          new Date(`${profileData?.current_trip?.expiry_date}Z`).getTime()
        );

        if (diff === 0) {
          // So this reserve's expiryDate has been reached, so let's refetch the reserves list.
          queryClient.invalidateQueries(["getMyTrips"]);
          profileData.profileQueryUtils.refetchProfile();

          // And also clear this reserve's interval
          if (!!timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          setRemainingTime(diff);
        }
      }, 1000);
    }

    return () => {
      if (!!timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData]);

  const getPaymentTokenMutation = useMutation(
    ({ order_id }: { order_id: number }) => {
      return getPaymentToken({ order_id });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          // console.log("getPaymentToken is", data);
          // call 'start pay'
          const token: string = data?.params?.token;
          const return_url = `/my-trips/${profileData.current_trip?.id}`;
          // console.log("getPaymentToken token is", token);
          tokenRef.current = token;
          // startPayMutation.mutate({ token });
          router.push(
            `https://lidomatrip.com/api/payment/start_pay?acquirer_id=11&token=${token}&return_url=${return_url}`
          );
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || defaultError,
            },
          ]);
        }
      },
    }
  );

  return (
    <div className="py-8 px-20 flex items-center justify-between gap-x-12 bg-tertiary">
      <p className="text-14 leading-24 text-white font-m grow OnlyOneLineAndEndWithElipsis">
        {profileData.current_trip?.product_name}
      </p>

      <div className="flex items-center gap-x-8 shrink-0">
        <div className="p-8 bg-[#065575] rounded-8 text-14 leading-24 text-white font-m w-52 flex items-center justify-center">
          {!!remainingTime && `${remainingTime.split(":")[1]}:${remainingTime.split(":")[2]}`}
        </div>
        <div className="w-128">
          <Button
            color="white"
            variant="contained"
            isFullWidth
            onClick={() => {
              getPaymentTokenMutation.mutate({ order_id: profileData.current_trip?.id as number });
            }}
          >
            پرداخت نهایی
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserHasCurrentTrip;
