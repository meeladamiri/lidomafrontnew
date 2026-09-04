import { getTimeDiff } from "@/utilities/Time";
import { useQueryClient } from "@tanstack/react-query";
import { LinkButton } from "components/General/core/Button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export interface IPendingRequest {
  title: string;
  from: string;
  to: string;
  reserveId: number;
  image: string;
  expiry_date: string; // ex: "2023-02-22 07:30:00"
}

function PendingRequest({ title, from, to, reserveId, image, expiry_date }: IPendingRequest) {
  const timerRef = useRef<any>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!!expiry_date) {
      timerRef.current = setInterval(() => {
        // Already a "...Z"-terminated ISO string — see MyTripDetails/index.tsx
        // for why appending a second one breaks the parse.
        const diff = getTimeDiff(Date.now(), new Date(expiry_date || "").getTime());

        if (diff === 0) {
          // So this reserve's expiry_date has been reached, so let's refetch the reserves list.
          queryClient.invalidateQueries([
            "getReserves",
            "getDashboardData", // bcz we have pending requests in dashboard page.
          ]);

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
  }, []);

  return (
    <div className="rounded-12 border-gray-C4CAD3 border-1 border-solid flex mb-12 last-of-type:mb-0">
      <div className="w-72 relative shrink-0">
        <Image
          src={image}
          alt=""
          className="rounded-tr-10 rounded-br-10"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="pl-12 p-10 gap-y-4 flex w-[calc(100%-72px)]">
        <div className="flex flex-col gap-y-12 w-[calc(100%-72px)] gap-x-4">
          <p className="text-14 leading-24 w-full text-black OnlyOneLineAndEndWithElipsis">
            {title}
          </p>

          <p className="flex w-full items-center gap-x-2 sm:gap-x-10 text-12 leading-21 text-black grow shrink">
            <span>{from}</span>
            <i className="icon-CalendarFlash text-24 text-black inline align-middle" />
            <span>{to}</span>
          </p>
        </div>

        <div className="w-72 flex-col flex">
          <span className="text-center text-14 leading-24 text-black font-l w-72 shrink-0">
            {remainingTime}
          </span>
          <LinkButton href={`/reservations/${reserveId}`} isFullWidth>
            مشاهده
          </LinkButton>
        </div>

        {/* <div className="flex items-center">
          <p className="text-14 leading-24 max-w-[calc(100%-72px)] shrink text-black OnlyOneLineAndEndWithElipsis">
            {title}
          </p>
          <span className="text-center text-14 leading-24 text-black font-l w-72 shrink-0">
            {time}
          </span>
        </div>

        <div className="items-center flex mt-4">
          <p className="flex items-center gap-x-4 sm:gap-x-10 text-12 leading-21 text-black grow shrink">
            <span>{from}</span>
            <span>{"-->"}</span>
            <span>{to}</span>
          </p>
          <div className="w-72 shrink-0">
            <LinkButton href="/reservations/30" isFullWidth>
              مشاهده
            </LinkButton>
          </div>
        </div> */}
      </div>
    </div>
  );
}
export default PendingRequest;
{
  /* TODO: Change this arrow to an icomoon class */
}
