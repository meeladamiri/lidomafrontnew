import { Button } from "components/General/core/Button";
import Tabs from "components/General/core/Tabs";
import PageTitle from "components/General/PageTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReserveCart from "components/Reservations/ReserveCart";
import { useQuery } from "@tanstack/react-query";
import { getReserves, IReserve, reserve_cancel_values } from "api/Reserves";
import { renderPagination } from "utilities/Pagination";
import UnHappyMessage from "components/General/UnHappyMessage";
import { miladiToJalali } from "utilities/dateTools";
import {
  ReservesList_ActiveTab_KEYWORD,
  ReservesList_PageN_KEYWORD,
} from "@/constants/session_stores/reserves_list";
import { TabsSkeleton } from "../General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { ReserveCartSkeleton } from "../General/Skeletons/FrequentlyUsed/ReserveCartSkeleton";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function ReservationsList() {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [page, setPage] = useState<number | null>(null);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const [reserves, setReserves] = useState<{
    current_reserves: IReserve[];
    failed_reserves: IReserve[];
    succeed_reserves: IReserve[];
  }>();

  const pageSize = useMemo(() => {
    if (isDesktop) {
      return 15;
    } else {
      return 8;
    }
  }, [isDesktop]);

  const { isLoading, isSuccess, data } = useQuery(["getReserves"], () => getReserves(), {
    staleTime: 0,
  });

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setReserves(data?.params);
      }
    }
  }, [data]);

  const getTheListToRender = useCallback(() => {
    let data;

    if (activeTab === 0) {
      if (reserves?.current_reserves.length === 0) {
        return "درخواست رزرو جاری نداری !";
      } else {
        data = reserves?.current_reserves;
      }
    } else if (activeTab === 1) {
      if (reserves?.succeed_reserves.length === 0) {
        return "درخواست رزرو موفق نداری !";
      } else {
        data = reserves?.succeed_reserves;
      }
    } else {
      // activeTab === 2
      if (reserves?.failed_reserves.length === 0) {
        return "درخواست رزرو ناموفق نداری !";
      } else {
        data = reserves?.failed_reserves;
      }
    }

    return data?.slice(0, pageSize * (page as number));
  }, [activeTab, reserves, page, pageSize]);

  const list = getTheListToRender();

  // Preserving Tab-index
  useEffect(() => {
    if (!!activeTab || activeTab === 0) {
      sessionStorage.setItem(ReservesList_ActiveTab_KEYWORD, activeTab.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    const reservesListActiveTab = sessionStorage.getItem(ReservesList_ActiveTab_KEYWORD);
    setActiveTab(!!reservesListActiveTab ? Number(reservesListActiveTab) : 0);
  }, []);
  // End of Preserving Tab-index

  // Preserving pageN
  useEffect(() => {
    if (!!page) {
      sessionStorage.setItem(ReservesList_PageN_KEYWORD, page.toString());
    }
  }, [page]);

  useEffect(() => {
    const reservesListPageN = sessionStorage.getItem(ReservesList_PageN_KEYWORD);
    setPage(!!reservesListPageN ? Number(reservesListPageN) : 1);
  }, []);
  // End of Preserving pageN

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || activeTab === null || page === null;
  }, [isLoading, activeTab, page]);

  return (
    <div className="pb-40 md:pb-80 ">
      <PageTitle
        title="رزرو ها"
        icon={<i className="icon-Reserve text-24" />}
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
                  tabLabel: !!reserves ? `جاری (${reserves.current_reserves.length})` : `جاری`,
                  tabIndex: 0,
                },
                {
                  tabLabel: !!reserves ? `موفق (${reserves.succeed_reserves.length})` : `موفق`,
                  tabIndex: 1,
                },
                {
                  tabLabel: !!reserves ? `ناموفق (${reserves.failed_reserves.length})` : `ناموفق`,
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
                    <ReserveCart
                      isFromDetailsPage={false}
                      state={item.state}
                      residenceName={item.product.name}
                      reserveCode={item.reference}
                      hostIncome={item.host_share}
                      startDate={miladiToJalali(item.start_date)}
                      endDate={miladiToJalali(item.end_date)}
                      mainGuestsN={item.guests_count}
                      extraGuestsN={item.extra_guests_count}
                      reserveId={item.id}
                      residenceId={item.product.id}
                      residenceImage={`${item.product.image_url}`}
                      expiryDate={item.expiry_date}
                      cancelledBy={
                        "cancelled_by" in item && !!item?.cancelled_by
                          ? (item?.cancelled_by as reserve_cancel_values)
                          : undefined
                      }
                      residenceCity={item.product.city}
                      // residenceType={item.type} // TODO
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
                ? reserves?.current_reserves
                : activeTab === 1
                ? reserves?.succeed_reserves
                : // activeTab === 2
                  reserves?.failed_reserves)!?.length
            ) && (
              <div className="mt-16 md:mt-24 md:w-[280px] md:mx-auto">
                <Button
                  variant="outlined"
                  color="black"
                  isFullWidth
                  onClick={() => setPage((prev) => (prev as number) + 1)}
                  rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
                >
                  مشاهده نتایج بیشتر
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

export default ReservationsList;
