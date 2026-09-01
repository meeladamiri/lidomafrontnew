import { useQuery } from "@tanstack/react-query";
import { Button, LinkButton } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import { useCallback, useEffect, useMemo, useState } from "react";
import ResidenceCart from "components/Residences/ResidenceCart";
import { ResidenceStates_enum } from "constants/enums/residence_states";
import Tabs from "components/General/core/Tabs";
import UnHappyMessage from "components/General/UnHappyMessage";
import { renderPagination } from "utilities/Pagination";
import { miladiToJalali } from "utilities/dateTools";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import {
  ResidencesList_ActiveTab_KEYWORD,
  ResidencesList_PageN_KEYWORD,
} from "@/constants/session_stores/residences_list";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { TabsSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/TabsSkeleton";
import { ResidenceCartSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/ResidenceCartSkeleton";
import {
  IServerResidence,
  IServerRoom,
  getResidencesList,
} from "@/api/Residences/getResidencesList";

const pageSize = 8;

function ResidencesList() {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  const [residencesList, setResidencesList] = useState<IServerResidence[]>();
  const [roomsList, setRoomsList] = useState<IServerRoom[]>();
  const [page, setPage] = useState<number | null>(null);

  const { isSuccess, isLoading, data } = useQuery(["getResidencesList"], () => getResidencesList());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setResidencesList(data?.params?.residences);
        setRoomsList(data?.params?.rooms);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  // Preserving Tab-index
  useEffect(() => {
    if (!!activeTab || activeTab === 0) {
      sessionStorage.setItem(ResidencesList_ActiveTab_KEYWORD, activeTab.toString());
    }
  }, [activeTab]);

  useEffect(() => {
    const residencesListActiveTab = sessionStorage.getItem(ResidencesList_ActiveTab_KEYWORD);
    setActiveTab(!!residencesListActiveTab ? Number(residencesListActiveTab) : 0);
  }, []);
  // End of Preserving Tab-index

  // Preserving pageN
  useEffect(() => {
    if (!!page) {
      sessionStorage.setItem(ResidencesList_PageN_KEYWORD, page.toString());
    }
  }, [page]);

  useEffect(() => {
    const residencesListPageN = sessionStorage.getItem(ResidencesList_PageN_KEYWORD);
    setPage(!!residencesListPageN ? Number(residencesListPageN) : 1);
  }, []);
  // End of Preserving pageN

  // TODO: Include rooms in below function logic, too;
  const getTheListToRender = useCallback(() => {
    let data;

    if (activeTab === 0) {
      const activeResidences =
        residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) || [];

      // find active rooms of boomgardi
      const activeRoomsList: IServerRoom[] =
        roomsList?.filter((room) => room.state === ResidenceStates_enum.ACTIVE) || [];
      // console.log("roomsList INSIDE", roomsList);
      // roomsList?.forEach((room) => {
      //   const parentNode = residencesList?.find((residence) => residence.id === room.parent_id);
      //   console.log("HERE IS parentNode", parentNode);
      //   if (
      //     !!parentNode &&
      //     parentNode.res_type !== "suit" &&
      //     room?.state === ResidenceStates_enum.ACTIVE
      //   ) {
      //     activeRoomsList.push(room);
      //   }
      // });

      if ((!activeResidences || activeResidences.length === 0) && activeRoomsList.length === 0) {
        return "اقامتگاه یا اتاق فعالی نداری";
      } else {
        data = [...activeResidences, ...activeRoomsList];
      }
    } else if (activeTab === 1) {
      const inActiveResidences =
        residencesList?.filter((r) => r.state === ResidenceStates_enum.DISABLED) || [];

      // find Inactive rooms of boomgardi
      const inActiveRoomsList: IServerRoom[] =
        roomsList?.filter((room) => room.state !== ResidenceStates_enum.ACTIVE) || [];
      // roomsList?.forEach((room) => {
      //   const parentNode = residencesList?.find((residence) => residence.id === room.parent_id);
      //   if (
      //     !!parentNode &&
      //     parentNode.res_type !== "suit" &&
      //     room?.state === ResidenceStates_enum.DISABLED
      //   ) {
      //     inActiveRoomsList.push(room);
      //   }
      // });

      const pendingResidences =
        residencesList?.filter((r) => r.state === ResidenceStates_enum.SUSPENDED) || [];

      // find pending rooms of boomgardi
      // const pendingRoomsList: IServerRoom[] = [];
      // roomsList?.forEach((room) => {
      //   const parentNode = residencesList?.find((residence) => residence.id === room.parent_id);
      //   if (
      //     !!parentNode &&
      //     parentNode.res_type !== "suit" &&
      //     room?.state === ResidenceStates_enum.SUSPENDED
      //   ) {
      //     inActiveRoomsList.push(room);
      //   }
      // });

      if (
        (!inActiveResidences || inActiveResidences.length === 0) &&
        (!pendingResidences || pendingResidences.length === 0) &&
        inActiveRoomsList.length === 0
        // && pendingRoomsList.length === 0
      ) {
        return "اقامتگاه یا اتاق غیرفعال یا معلقی نداری";
      } else {
        data = [
          ...inActiveResidences,
          ...pendingResidences,
          ...inActiveRoomsList,
          // ...pendingRoomsList,
        ];
      }
    } else {
      // activeTab === 2
      const completingResidences =
        residencesList?.filter((r) => r.state === ResidenceStates_enum.COMPLETING) || [];

      // find completing rooms of boomgardi
      // const completingRoomsList: IServerRoom[] = [];
      // roomsList?.forEach((room) => {
      //   const parentNode = residencesList?.find((residence) => residence.id === room.parent_id);
      //   if (
      //     !!parentNode &&
      //     parentNode.res_type !== "suit" &&
      //     room?.state === ResidenceStates_enum.COMPLETING
      //   ) {
      //     completingRoomsList.push(room);
      //   }
      // });

      if (
        !completingResidences ||
        completingResidences.length === 0
        // && completingRoomsList.length === 0
      ) {
        return "اقامتگاه یا اتاق درحال تکمیلی نداری";
      } else {
        data = [
          ...completingResidences,
          // ...completingRoomsList
        ];
      }
    }

    return data?.slice(0, pageSize * (page as number));
  }, [activeTab, residencesList, roomsList, page]);

  const list = getTheListToRender();

  const pageIsNotReady: boolean = useMemo(() => {
    return isLoading || activeTab === null || page === null;
  }, [isLoading, activeTab, page]);

  return (
    <div className="pb-40 ">
      <PageTitle
        title="اقامتگاه ها"
        icon={<i className="icon-Home text-24" />}
        containerClassname="mb-16"
      />

      {pageIsNotReady ? (
        <>
          <div className="mb-24">
            <TabsSkeleton />
          </div>

          {Array.from({ length: pageSize }).map((_, i) => (
            <div className="mb-16 last:mb-0" key={i}>
              <ResidenceCartSkeleton />
            </div>
          ))}
        </>
      ) : residencesList?.length === 0 ? (
        <div className="pt-40">
          <UnHappyMessage
            title={"هنوز اقامتگاهی رو ثبت نکردی !"}
            iconSrc="/assets/No-residance.svg"
            actions={
              <div className="flex justify-center">
                <LinkButton href="/residences/submit">شروع ثبت اقامتگاه</LinkButton>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="mb-24">
            <Tabs
              activeIndex={activeTab as number}
              onChange={(idx: number) => {
                setActiveTab(idx);
              }}
              data={[
                {
                  tabLabel: !!residencesList
                    ? `فعال (${
                        residencesList.filter((r) => r.state === ResidenceStates_enum.ACTIVE)
                          .length +
                        (
                          roomsList?.filter((room) => room.state === ResidenceStates_enum.ACTIVE) ||
                          []
                        ).length
                      })`
                    : `فعال`,
                  tabIndex: 0,
                },
                {
                  tabLabel: !!residencesList
                    ? `غیرفعال (${
                        // Counts what the tab actually renders: DISABLED *and*
                        // SUSPENDED. A listing the host deactivates maps to
                        // SUSPENDED (see mapState), so it appeared in the list
                        // while the badge beside it said (۰).
                        residencesList.filter(
                          (r) =>
                            r.state === ResidenceStates_enum.DISABLED ||
                            r.state === ResidenceStates_enum.SUSPENDED
                        ).length +
                        (
                          roomsList?.filter((room) => room.state !== ResidenceStates_enum.ACTIVE) ||
                          []
                        ).length
                      })`
                    : `غیرفعال`,
                  tabIndex: 1,
                },
                {
                  tabLabel: !!residencesList
                    ? `در حال تکمیل (${
                        residencesList.filter((r) => r.state === ResidenceStates_enum.COMPLETING)
                          .length
                      })`
                    : `در حال تکمیل`,
                  tabIndex: 2,
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-12 sm:gap-x-16 md:gap-x-16 gap-y-16 sm:gap-y-16 md:gap-y-24">
            {typeof list === "string" ? (
              <div className="pt-40 col-span-full">
                <UnHappyMessage title={list} iconSrc="/assets/No-residance.svg" />
              </div>
            ) : (
              list?.map((resiOrRoom, index) => {
                return (
                  <div
                    className="col-span-full sm:col-span-6 md:col-span-6 md:h-full"
                    key={resiOrRoom.id}
                  >
                    <ResidenceCart
                      residenceId={resiOrRoom.id as number}
                      state={resiOrRoom.state as ResidenceStates_enum}
                      step={resiOrRoom.step}
                      completionPercent={resiOrRoom.completion_percent}
                      publicId={(resiOrRoom as any).public_id ?? resiOrRoom.id}
                      resCode={String((resiOrRoom as any).public_id ?? resiOrRoom.id)}
                      resName={resiOrRoom.name}
                      lastUpdate={miladiToJalali(resiOrRoom.last_update_time)}
                      imageUrl={resiOrRoom.image_url}
                      displayType={resiOrRoom.res_type}
                      residenceType={
                        "parent_id" in resiOrRoom
                          ? ResidenceTypes_enum.ROOM
                          : ResidenceTypes_enum.PRODUCT
                      }
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
                ? [
                    ...(residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) ||
                      []),
                    ...(roomsList?.filter((room) => room.state === ResidenceStates_enum.ACTIVE) ||
                      []),
                  ]
                : activeTab === 1
                ? [
                    ...(residencesList?.filter((r) => r.state === ResidenceStates_enum.DISABLED) ||
                      []),
                    ...(roomsList?.filter((room) => room.state !== ResidenceStates_enum.ACTIVE) ||
                      []),
                  ]
                : // activeTab === 2
                  residencesList?.filter((r) => r.state === ResidenceStates_enum.COMPLETING))!
                ?.length
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
export default ResidencesList;
