import { Button } from "components/General/core/Button";
import Tabs from "components/General/core/Tabs";
import PageTitle from "components/General/PageTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reserve_cancel_values } from "api/Reserves";
import { renderPagination } from "utilities/Pagination";
import UnHappyMessage from "components/General/UnHappyMessage";
import { miladiToJalali } from "utilities/dateTools";

import { TabsSkeleton } from "../General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { ReserveCartSkeleton } from "../General/Skeletons/FrequentlyUsed/ReserveCartSkeleton";
import { getMyTrips, IMyTrip } from "@/api/MyTrips";
import MyTripCart from "./MyTripCart";
import {
  MyTripsList_ActiveTab_KEYWORD,
  MyTripsList_PageN_KEYWORD,
} from "@/constants/session_stores/mytrips_list";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function MyTrips() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [page, setPage] = useState<number | null>(null);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const pageSize = useMemo(() => {
    if (isDesktop) {
      return 15;
    } else {
      return 8;
    }
  }, [isDesktop]);

  const [myTrips, setMyTrips] = useState<{
    all_reserves: IMyTrip[];
    current_reserves: IMyTrip[];
    past_reserves: IMyTrip[];
  }>();

  const { isLoading, isSuccess, data } = useQuery(["getMyTrips"], () => getMyTrips(), {
    staleTime: 0,
  });

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setMyTrips(data?.params);
      }
    }
  }, [data]);

  const getTheListToRender = useCallback(() => {
    let data;

    if (activeTab === 0) {
      if (myTrips?.current_reserves.length === 0) {
        return "سفر جاری نداری !";
      } else {
        data = myTrips?.current_reserves;
      }
    } else if (activeTab === 1) {
      if (myTrips?.past_reserves.length === 0) {
        return "سفر پایان یافته ای نداری !";
      } else {
        data = myTrips?.past_reserves;
      }
    } else {
      // activeTab === 2
      if (myTrips?.all_reserves.length === 0) {
        return "سفری نداشتی !";
      } else {
        data = myTrips?.all_reserves;
      }
    }

    return data?.slice(0, pageSize * (page as number));
  }, [activeTab, myTrips, pageSize, page]);

  const list = getTheListToRender();

  // Preserving Tab-index
  useEffect(() => {
    if (!!activeTab || activeTab === 0) {
      sessionStorage.setItem(MyTripsList_ActiveTab_KEYWORD, activeTab.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    const mytripsListActiveTab = sessionStorage.getItem(MyTripsList_ActiveTab_KEYWORD);
    // console.log("mytripsListActiveTab", mytripsListActiveTab);
    setActiveTab(!!mytripsListActiveTab ? Number(mytripsListActiveTab) : 0);
  }, []);
  // End of Preserving Tab-index

  // Preserving pageN
  useEffect(() => {
    if (!!page) {
      sessionStorage.setItem(MyTripsList_PageN_KEYWORD, page.toString());
    }
  }, [page]);

  useEffect(() => {
    const mytripsListPageN = sessionStorage.getItem(MyTripsList_PageN_KEYWORD);
    setPage(!!mytripsListPageN ? Number(mytripsListPageN) : 1);
  }, []);
  // End of Preserving pageN

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || activeTab === null || page === null;
  }, [isLoading, activeTab, page]);

  return (
    <div className="pb-40 md:pb-80 ">
      <PageTitle
        title="سفرهای من"
        icon={<i className="icon-Trips text-24" />}
        containerClassname="mb-16"
      />

      {pageIsNotReady ? (
        <>
          <div className="mb-16">
            <TabsSkeleton />
          </div>

          {Array.from({ length: pageSize }).map((_, i) => (
            <div className="mb-16 last:mb-0" key={i}>
              <ReserveCartSkeleton />
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="mb-16 md:mb-24">
            <Tabs
              activeIndex={activeTab as number}
              onChange={(idx: number) => {
                setActiveTab(idx);
              }}
              data={[
                {
                  tabLabel: !!myTrips ? `جاری (${myTrips.current_reserves.length})` : `جاری`,
                  tabIndex: 0,
                },
                {
                  tabLabel: !!myTrips
                    ? `پایان یافته (${myTrips.past_reserves.length})`
                    : `پایان یافته`,
                  tabIndex: 1,
                },
                {
                  tabLabel: !!myTrips ? `همه (${myTrips.all_reserves.length})` : `همه`,
                  tabIndex: 2,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-12 sm:gap-x-16 md:gap-x-16 gap-y-16 sm:gap-y-16 md:gap-y-24">
            {typeof list === "string" ? (
              <div className="pt-40 col-span-full">
                <UnHappyMessage title={list} iconSrc="/assets/No-reserve.svg" />
              </div>
            ) : (
              list?.map((item) => {
                // item.sta;
                return (
                  <div
                    className="col-span-full sm:col-span-6 md:col-span-4 md:h-full"
                    key={item.id}
                  >
                    <MyTripCart
                      state={item.state as any}
                      residenceName={item.product.name}
                      reserveCode={item.reference}
                      reservePrice={item.total_amount}
                      startDate={miladiToJalali(item.start_date)}
                      endDate={miladiToJalali(item.end_date)}
                      mainGuestsN={item.guests_count}
                      extraGuestsN={item.extra_guests_count}
                      mytripId={item.id}
                      residenceId={item.product.id}
                      residenceImage={`${item.product.image_url}`}
                      expiryDate={item.expiry_date}
                      cancelledBy={
                        "cancelled_by" in item && !!item?.cancelled_by
                          ? (item?.cancelled_by as reserve_cancel_values)
                          : undefined
                      }
                      residenceCity={item.product.city}
                      displayType={item.product.display_type}
                    />
                  </div>
                );
              })
            )}
          </div>

          {!!page &&
            !!renderPagination(
              page,
              pageSize,
              (activeTab === 0
                ? myTrips?.current_reserves
                : activeTab === 1
                ? myTrips?.past_reserves
                : // activeTab === 2
                  myTrips?.all_reserves)!?.length
            ) && (
              <div className="mt-16 md:mt-24 md:w-[280px] md:mx-auto">
                <Button
                  variant="outlined"
                  color="black"
                  isFullWidth
                  onClick={() => setPage((prev) => (prev as number) + 1)}
                  rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
                >
                  نمایش بیشتر
                </Button>
              </div>
            )}
        </>
      )}
    </div>
  );
}

// TODO: list haye empty in safha ro dorost kon;
{
  // <div className="">
  //   <UnHappyMessage
  //     title="هنوز درخواست رزروی برات نیومده !"
  //     iconSrc="/assets/No-reserve.svg"
  //     subTitle={`  هر اقامتگاهی که ازش خوشت میاد رو با کلیک بر روی به این لیست اضافه کن، تا وقتی تخفیف
  //   میخوره خبرت کنیم .`}
  //     actions={
  //       <div className="w-full flex justify-center">
  //         <Button>جستجوی اقامتگاه ها</Button>
  //       </div>
  //     }
  //   />
  // </div>;
}

export default MyTrips;
