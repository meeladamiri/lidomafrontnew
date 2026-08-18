import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "../General/core/Button";
import { TextField } from "../General/core/TextField";
import moment, { Moment } from "moment-jalaali";
import Calendar from "../Calendar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkUserPermission } from "@/api/Deposit/checkUserPermission";
import { Switch } from "../General/core/Switch";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import DropDown from "../General/core/DropDown";
import Image from "next/image";
import Cart from "components/General/core/DropDown/DropdownCart";
import { Checkbox } from "../General/core/Checkbox";
import {
  IResidence,
  getSearchKeywordResults,
} from "@/api/ChangeResidencesStatus/getSearchKeywordResults";
import { search_type } from "@/constants/search_type";

import { NextRouter, useRouter } from "next/router";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { TinyLoader } from "../General/Loader/TinyLoader";
import {
  I_Change_Residence_Search_type,
  I_Change_Residence_Status_display_type_payload,
} from "@/interfaces/ChangeResidencesStatus";
import { residences_types_list } from "@/constants/residence_types_list";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  changeResidencesStatusUpdateCalendar,
  changeResidencesStatusUpdateCalendar_TEnable,
  changeResidencesStatusUpdateCalendar_TFast,
} from "@/api/ChangeResidencesStatus/changeResidencesStatusUpdateCalendar";
import { getAllUniqueSelectedDays_Array } from "@/utilities/calendar/getAllUniqueSelectedDays_Array";
import UpdateCalendarForm from "./UpdateCalendarForm";
import { Radio } from "../General/core/Radio";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { getUserToken } from "@/utilities/cookies";
import ResidenceCart from "./ResidenceCart";
import { renderPagination } from "@/utilities/Pagination";
// import ChangeResidenceStatusGeneralPricingModal from "./ChangeResidenceStatusGeneralPricingModal";
import { momentToJalali } from "@/utilities/dateTools";
import { IServerCalendarData, getCalendarData } from "@/api/Calendar/Calendar";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";
import { appendResesAndRoomsToUrl } from "./appendResesAndRoomsToUrl";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import Inaccessibility from "../General/Inaccessibility";
import Loader from "../General/Loader";
import { changeResidencesStatusResetCalendar } from "@/api/ChangeResidencesStatus/changeResidencesStatusResetCalendar";

const ChangeResidenceStatusGeneralPricingModal = dynamic(
  () => import("@/components/ChangeResidencesStatus/ChangeResidenceStatusGeneralPricingModal"),
  {
    ssr: true,
  }
);

const calendarPriceAndDiscount_UpdateCalendar_YupSchema = {
  "selected-days-price_UpdateCalendar": Yup.number().nullable(),
  // .typeError(VALIDATION_MESSAGES.REQUIRED),
  // .required(VALIDATION_MESSAGES.REQUIRED),
  "selected-days-discount_UpdateCalendar": Yup.string()
    .test("valid-discount", "میزان تخفیف را به درصد وارد کنید. (حداکثر 99 درصد)", (value) => {
      if (value === "nochange" || !value) return true; // Allow null or empty string
      const numericValue = parseFloat(value);
      return numericValue >= 0 && numericValue <= 99;
    })
    .nullable(),
};
interface ICalendarPriceAndDiscount_UpdateCalendar_V {
  "selected-days-price_UpdateCalendar": number | null;
  "selected-days-discount_UpdateCalendar": string;
}

const calendarPriceAndDiscount_UpdateCalendar_InitV: ICalendarPriceAndDiscount_UpdateCalendar_V = {
  "selected-days-price_UpdateCalendar": null,
  "selected-days-discount_UpdateCalendar": "nochange",
};

const pageSize: number = 6;

function ChangeResidencesStatus() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [calendarPriceAndDiscount_UpdateCalendar_V, setCalendarPriceAndDiscount_UpdateCalendar_V] =
    useState<ICalendarPriceAndDiscount_UpdateCalendar_V>(
      calendarPriceAndDiscount_UpdateCalendar_InitV
    );
  const [dateToWorkWith, setDateToWorkWith] = useState<Moment>(moment(new Date()));
  const [filterCalendarDateToWorkWith, setFilterCalendarDateToWorkWith] = useState<Moment>(
    moment(new Date())
  );
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRangeEnabled, setIsRangeEnabled] = useState<boolean>(false);
  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [selectedIndividualDays, setSelectedIndividualDays] = useState<moment.Moment[]>([]);
  // const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [filterCalendarSelectedRanges, setFilterCalendarSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [showFilterCalendar, setShowFilterCalendar] = useState<boolean>(false);
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
  const [selectedResidenceType, setSelectedResidenceType] =
    useState<I_Change_Residence_Status_display_type_payload>("all");
  const [searchType, setSearchType] = useState<I_Change_Residence_Search_type>();
  const [searchText, setSearchText] = useState<string>("");
  const [finalSearchText, setFinalSearchText] = useState<string>("");
  const [showResidenceGeneralPricingModal, setShowResidenceGeneralPricingModal] =
    useState<boolean>(false);
  const [calendarStatus, setCalendarStatus] =
    useState<changeResidencesStatusUpdateCalendar_TEnable>("nochange");
  const [fastReservationStatus, setFastReservationStatus] =
    useState<changeResidencesStatusUpdateCalendar_TFast>("nochange");
  const [checkedAll, setCheckedAll] = useState(false);
  const [residencesList, setResidencesList] = useState<IResidence[]>([]);
  const [generalPricingButtonActivation, setGeneralPricingButtonActivation] =
    useState<boolean>(true);
  const [calendarData, setCalendarData] = useState<IServerCalendarData>();
  const [calendarKeyState, setCalendarKeyState] = useState(new Date());
  const [checkedAllResidences, setCheckedAllResidences] = useState(false);
  const [permissionIsLoading, setIsPermissionIsLoading] = useState(true);
  const searchTextFieldRef = useRef<any>(null);
  // const selectedDateTextFieldRef = useRef<any>(null);
  const filteredDatesTextFieldRef = useRef<any>(null);
  const [fillFromUrl, setFillFromUrl] = useState<boolean>(false);
  const [urlResidenceIds, setUrlResidenceIds] = useState<string>("");

  function isOnlyOneItemSelected({ router }: { router: NextRouter }) {
    if (typeof router?.query?.roomId === "string" && !router?.query?.residenceId) {
      return Number(router?.query?.roomId);
    } else if (!router?.query?.roomId && typeof router?.query?.residenceId === "string") {
      return Number(router?.query?.residenceId);
    } else {
      return 0;
    }
  }

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    isFetching: calendarDataIsFetching,
    refetch: refetchCalendarData,
    data: dataOfCalendar,
  } = useQuery(
    ["getCalendarData", router?.query?.roomId, router?.query?.residenceId],
    () => {
      return getCalendarData({
        residenceId: Number(router?.query?.roomId) || Number(router?.query?.residenceId),
        // TODO: Waiting for backend reply for 'what value should be sent when "all" is selected'
        residenceType: router?.query?.residenceId
          ? ResidenceTypes_enum.PRODUCT
          : ResidenceTypes_enum.ROOM,
      });
    },
    {
      enabled: !!isOnlyOneItemSelected({ router }),
    }
  );

  useEffect(() => {
    if (!!dataOfCalendar) {
      if (dataOfCalendar?.status === "error") {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: dataOfCalendar?.err_msg || defaultError },
        ]);
      } else {
        const serverCalendarData: IServerCalendarData = dataOfCalendar?.params;
        setCalendarData(serverCalendarData);
        setCalendarKeyState(new Date());
      }
    }
  }, [dataOfCalendar]);

  const updateCalendarMutation = useMutation(
    ({
      residences,
      rooms,
      dates,
      discount_amount,
      special_price,
      enable,
      fast,
      keyword,
      res_type,
      search_type,
    }: {
      residences: number[];
      rooms: number[];
      dates: string[];
      enable: changeResidencesStatusUpdateCalendar_TEnable;
      fast: changeResidencesStatusUpdateCalendar_TFast;
      special_price: number;
      discount_amount: string;
      keyword?: string;
      res_type?: I_Change_Residence_Status_display_type_payload;
      search_type?: string;
    }) => {
      return changeResidencesStatusUpdateCalendar({
        residences,
        rooms,
        dates,
        discount_amount,
        special_price,
        enable,
        fast,
        keyword,
        res_type,
        search_type,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "بروزرسانی با موفقیت انجام شد." },
          ]);
          if (!!data?.params?.room_errors?.length || !!data?.params?.res_errors?.length) {
            exception.message([
              {
                type: EXCEPTIONTYPES.ERROR,
                title: `اقامتگاه های ${data?.params?.res_errors.join(
                  " و "
                )},${data?.params?.room_errors.join(" و ")} آپدیت نشدند`,
              },
            ]);
          }
          if (!!isOnlyOneItemSelected({ router })) {
            refetchCalendarData();
          } else {
            queryClient.removeQueries({ queryKey: ["getCalendarData"], exact: false });
          }
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const resetCalendarMutation = useMutation(
    ({
      reset,
      residences,
      rooms,
      dates,
      keyword,
      res_type,
      search_type,
    }: {
      reset: boolean;
      residences: number[];
      rooms: number[];
      dates: string[];
      keyword?: string;
      res_type?: I_Change_Residence_Status_display_type_payload;
      search_type?: string;
    }) => {
      return changeResidencesStatusResetCalendar({
        reset,
        residences,
        rooms,
        dates,
        keyword,
        res_type,
        search_type,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([{ type: EXCEPTIONTYPES.SUCCESS, title: "با موفقیت بازگردانی شد." }]);
          if (!!data?.params?.room_errors?.length || !!data?.params?.res_errors?.length) {
            exception.message([
              {
                type: EXCEPTIONTYPES.ERROR,
                title: `اقامتگاه های ${data?.params?.res_errors.join(
                  " و "
                )},${data?.params?.room_errors.join(" و ")} بازگردانی نشدند`,
              },
            ]);
          }
          if (!!isOnlyOneItemSelected({ router })) {
            refetchCalendarData();
          } else {
            queryClient.removeQueries({ queryKey: ["getCalendarData"], exact: false });
          }
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const formik = useFormik({
    initialValues: calendarPriceAndDiscount_UpdateCalendar_V,
    validationSchema: Yup.object(calendarPriceAndDiscount_UpdateCalendar_YupSchema),
    onSubmit: async (values) => {
      try {
        updateCalendarMutation.mutate({
          residences:
            typeof router?.query?.residenceId === "string"
              ? [Number(router?.query?.residenceId)]
              : router?.query?.residenceId?.map((resId) => Number(resId)) || [],
          rooms:
            typeof router?.query?.roomId === "string"
              ? [Number(router?.query?.roomId)]
              : router?.query?.roomId?.map((roomId) => Number(roomId)) || [],
          dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
          enable: calendarStatus,
          special_price: values["selected-days-price_UpdateCalendar"] || 0,
          discount_amount: values["selected-days-discount_UpdateCalendar"] || "nochange",
          fast: fastReservationStatus,
          ...(checkedAllResidences && {
            keyword: finalSearchText,
            res_type: selectedResidenceType,
            search_type: searchType as string,
            residences: [],
            rooms: [],
          }),
        });
        resetAllSelectedDays();
        // setCalendarPriceAndDiscount_UpdateCalendar_V({
        //   "selected-days-price_UpdateCalendar": null,
        //   "selected-days-discount_UpdateCalendar": null,
        // });
        formik.resetForm();
        setFastReservationStatus("nochange");
        setCalendarStatus("nochange");
      } catch (e: any) {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: e?.err_msg || defaultError }]);
      }
    },
    // enableReinitialize: true,
  });

  const handleResetCalendar = () => {
    resetCalendarMutation.mutate({
      reset: true,
      residences:
        typeof router?.query?.residenceId === "string"
          ? [Number(router?.query?.residenceId)]
          : router?.query?.residenceId?.map((resId) => Number(resId)) || [],
      rooms:
        typeof router?.query?.roomId === "string"
          ? [Number(router?.query?.roomId)]
          : router?.query?.roomId?.map((roomId) => Number(roomId)) || [],
      dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
      ...(checkedAllResidences && {
        keyword: finalSearchText,
        res_type: selectedResidenceType,
        search_type: searchType as string,
        residences: [],
        rooms: [],
      }),
    });
    resetAllSelectedDays();
    formik.resetForm();
    setFastReservationStatus("nochange");
    setCalendarStatus("nochange");
  };

  const {
    data: checkUserPermissionData,
    isLoading: checkUserPermissionDataIsLoading,
    isFetching: checkUserPermissionDataIsFetching,
    refetch: refetchCheckUserPermission,
  } = useQuery(["changeResidencesStatusCheckUserPermission"], () => checkUserPermission(), {
    enabled: !!getUserToken(),
  });

  const {
    data: searchKeywordResultsData,
    // isSuccess: searchKeywordResultsIsSuccess,
    isLoading: searchKeywordResultsIsLoading,
    isFetching: searchKeywordResultsIsFetching,
    refetch: searchKeywordResultsRefetch,
  } = useQuery(
    [
      "getSearchKeywordResidences",
      selectedResidenceType,
      searchType,
      finalSearchText,
      router?.query?.page || 1,
      filterCalendarSelectedRanges?.[0]?.[1],
    ],
    () => {
      return getSearchKeywordResults({
        keyword: finalSearchText,
        res_type: selectedResidenceType,
        search_type: searchType as string,
        page: !!router?.query?.page ? Number(router?.query?.page as string) : 1,
        page_size: pageSize,
        start_date: filterCalendarSelectedRanges.length
          ? momentToJalali(filterCalendarSelectedRanges[0][0])
          : "",
        end_date:
          filterCalendarSelectedRanges.length && filterCalendarSelectedRanges[0][1]
            ? momentToJalali(filterCalendarSelectedRanges[0][1])
            : "",
      });
    },
    {
      staleTime: 0,
      enabled: !!selectedResidenceType && !!searchType && !!finalSearchText,
      keepPreviousData: true,
      onSuccess: () => {},
    }
  );

  useEffect(() => {
    if (!!searchKeywordResultsData) {
      if (searchKeywordResultsData?.status === "success") {
        setResidencesList((prev) => {
          return [...prev, ...searchKeywordResultsData?.params?.residences];
        });
        if (checkedAllResidences) {
          appendResesAndRoomsToUrl({
            residencesList: searchKeywordResultsData?.params?.residences,
            router,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKeywordResultsData]);

  // console.log(residencesList);
  // console.log("routerrrrrr", router);

  function resetAllSelectedDays() {
    setSelectedIndividualDays([]);
    setSelectedRanges([]);
  }

  function resetFilterCalendar() {
    setFilterCalendarSelectedRanges([]);
  }

  useEffect(() => {
    if (!!checkUserPermissionData) {
      if (checkUserPermissionData?.status === "success") {
        setHasPermission(checkUserPermissionData?.params?.has_permission);
        setIsPermissionIsLoading(false);
      } else {
        // refetchCheckUserPermission();
        setIsPermissionIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkUserPermissionData]);

  useEffect(() => {
    if (!!router?.query?.code && !!router?.query?.searchType && !!router?.query?.resType) {
      setSearchText(router?.query?.code as string);
      setFinalSearchText(router?.query?.code as string);
      setSearchType(router?.query?.searchType as I_Change_Residence_Search_type);
      setSelectedResidenceType(
        router?.query?.resType as I_Change_Residence_Status_display_type_payload
      );
      setFillFromUrl(true);
    }
    if (!!router?.query?.residenceId) {
      setUrlResidenceIds(router?.query?.residenceId as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.city, router?.query?.searchType, router?.query?.resType]);

  useEffect(() => {
    if (fillFromUrl == false) {
      if (!urlResidenceIds) {
        removeQueryParameters(router, [
          { paramKey: "page" },
          { paramKey: "residenceId" },
          { paramKey: "roomId" },
          { paramKey: "code" },
          { paramKey: "searchType" },
          { paramKey: "resType" },
        ]);
      } else {
        removeQueryParameters(router, [{ paramKey: "page" }, { paramKey: "roomId" }]);
        setUrlResidenceIds("");
      }
    }
    // router.replace("", undefined, { shallow: true });

    // setCalendarPriceAndDiscount_UpdateCalendar_V({
    //   "selected-days-price_UpdateCalendar": null,
    //   "selected-days-discount_UpdateCalendar": null,
    // });
    if (fillFromUrl === true) {
      setFillFromUrl(false);
    }

    setCalendarStatus("nochange");
    setFastReservationStatus("nochange");
    setSelectedRanges([]);
    setSelectedIndividualDays([]);
    // setResidencesList([]);
    // searchKeywordResultsRefetch()
    // setResidencesList((prev) => {
    //   return [...prev, ...searchKeywordResultsData?.params?.residences];
    // });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedResidenceType, finalSearchText, fillFromUrl]);

  useEffect(() => {
    if (!!isOnlyOneItemSelected({ router })) {
      setGeneralPricingButtonActivation(false);
    } else {
      setGeneralPricingButtonActivation(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.residenceId, router?.query?.roomId]);

  // console.log("fillfrom urllll", fillFromUrl);

  return (
    <>
      <Loader isShowing={permissionIsLoading} />
      {hasPermission && !permissionIsLoading && (
        <div className="CustomContainer pt-[85px] !max-w-[1450px]">
          <div className="flex items-center gap-x-12">
            <DropDown
              wrapperClassname="!h-[44px]"
              dropDownItemsWrapperClassName="z-2"
              currntValue={selectedResidenceType}
              onChange={(e, value, allChildProps) => {
                if (selectedResidenceType !== allChildProps?.value) {
                  setSelectedResidenceType(allChildProps?.value);
                  setResidencesList([]);
                }
              }}
            >
              {residences_types_list.map((type: any, index: number) => {
                return (
                  <Cart
                    key={index}
                    value={type?.value}
                    title={type?.name}
                    subText=""
                    type={type?.value}
                    wrapperClassname="cursor-pointer"
                    imageWrapperClassname="!hidden"
                    textWrapperClassname="flex items-center gap-x-40"
                  />
                );
              })}
            </DropDown>
            <div className="relative">
              <TextField
                onClick={() => setShowSearchBox(true)}
                name="searchText"
                placeholder="متن مورد نظر را وارد کنید"
                customValue={searchText}
                customOnChange={(value) => {
                  setSearchText(value);
                }}
                rightIcon={<i className="icon-Search text-24 text-blue-main" />}
                wrapperClassname="py-16 !rounded-12 !w-[480px] !h-[44px]"
                isFullWidth={false}
                ref={searchTextFieldRef}
              />
              {searchText && showSearchBox && (
                <OutsideClickHandler
                  handleClick={() => {
                    setShowSearchBox(false);
                  }}
                  exceptionElementsRef={[searchTextFieldRef]}
                >
                  <div className="absolute z-3 mt-4 bg-white w-[480px] rounded-16 border border-gray-E8E8E8 shadow-[0_6px_16px_0px_rgba(8,19,56,0.12)]">
                    {(
                      Object.entries(search_type) as [
                        key: I_Change_Residence_Search_type,
                        value: string
                      ][]
                    ).map(([key, value]) => (
                      <div
                        className="py-10 px-16 cursor-pointer"
                        key={key}
                        onClick={() => {
                          if (key !== searchType || finalSearchText !== searchText) {
                            setResidencesList([]);
                            setSearchType(key);
                            setFinalSearchText(searchText);
                          }
                          setShowSearchBox(false);
                        }}
                      >
                        <span>{`جستجوی "${searchText}" در ${value}`}</span>
                      </div>
                    ))}
                  </div>
                </OutsideClickHandler>
              )}
            </div>
            <div className="relative">
              <TextField
                customValue={
                  filterCalendarSelectedRanges.length
                    ? `${momentToJalali(filterCalendarSelectedRanges[0][0])} > ${
                        filterCalendarSelectedRanges[0][1]
                          ? momentToJalali(filterCalendarSelectedRanges[0][1])
                          : ""
                      }`
                    : ""
                }
                readonly={true}
                wrapperClassname="py-16 !rounded-12 !w-[480px] !h-[44px]"
                isFullWidth={false}
                rightIcon={<i className="icon-Calendar text-24 text-black" />}
                name="filteredDates"
                ref={filteredDatesTextFieldRef}
                onClick={() => setShowFilterCalendar(true)}
                placeholder="جستجوی تاریخ"
              />

              <OutsideClickHandler
                handleClick={() => setShowFilterCalendar(false)}
                exceptionElementsRef={[filteredDatesTextFieldRef]}
              >
                {showFilterCalendar && (
                  <div className="bg-white w-[300px] border border-gray-#E8E8E8 p-16 rounded-20 shadow-lg z-3 absolute top-70 right-7">
                    <Calendar
                      canOnlySelectOneRange
                      showToday={true}
                      wrapperClassname="bg-white"
                      color="blue"
                      rounded={true}
                      hasBorderDashed={false}
                      makeBgConsistentInSelectedRanges={true}
                      aspectRatio1by1
                      setDateToWorkWith={setFilterCalendarDateToWorkWith}
                      dateToWorkWith={filterCalendarDateToWorkWith}
                      onMonthInc={() => {
                        setFilterCalendarDateToWorkWith(
                          filterCalendarDateToWorkWith.clone().add(1, "jMonth")
                        );
                      }}
                      onMonthDec={() => {
                        setFilterCalendarDateToWorkWith(
                          filterCalendarDateToWorkWith.clone().subtract(1, "jMonth")
                        );
                      }}
                      isRangeEnabled={true}
                      filledDays={[]}
                      alreadyReservedDays={[]}
                      peakDays={[]}
                      fastReserveDays={[]}
                      discounted_days={[]}
                      special_dates={[]}
                      offDays={[]}
                      prices={{
                        extra_guests_price: 0,
                        monthly_discount: 0,
                        peak_price: 0,
                        week_price: 0,
                        weekend_price: 0,
                        weekly_discount: 0,
                      }}
                      showNavigateToPrevMonthBtn={true}
                      showNavigateToNextMonthBtn={true}
                      onlyShowCalendarDateNumber={true}
                      noCoOperation={false}
                      selectedRanges={filterCalendarSelectedRanges}
                      setSelectedRanges={setFilterCalendarSelectedRanges}
                      checkForAlreadyReservedDatesOrFilledDatesValidity={true}
                      canSelectMonth={true}
                      canSelectDay={!!finalSearchText}
                    />
                    <div className="flex items-center justify-between mt-16">
                      <div className="flex items-center gap-x-8">
                        <Button
                          color="grey"
                          onClick={() => resetFilterCalendar()}
                          rounded
                          className="!px-10"
                        >
                          پاک کردن فیلتر تاریخ
                        </Button>
                        <Button
                          onClick={() => setShowFilterCalendar(false)}
                          color="dark-blue"
                          rounded
                        >
                          تایید تاریخ
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </OutsideClickHandler>
            </div>
          </div>
          <div className="pt-14 grid grid-cols-14 gap-x-24">
            <div
              className={`col-span-4 h-[540px] overflow-y-scroll overflow-x-hidden ${
                !searchType ? "border border-gray-E8E8E8} rounded-20" : ""
              }`}
            >
              {!searchType ? (
                <div className="w-full h-full flex items-center justify-center flex-col">
                  <Image
                    src="/assets/havent-searched-anything-yet.svg"
                    width={240}
                    height={240}
                    alt=""
                  />
                  <p className="text-gray-263341 leading-28 text-20 font-r mt-40">
                    هنوز چیزی سرچ نکردی جون دل...!
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <div className="rounded-12 bg-gray-616E7C p-8 flex items-center justify-between w-full mb-8 sticky top-0 z-1">
                    <div className="flex items-center">
                      <Checkbox
                        checked={checkedAllResidences}
                        onChange={(e) => {
                          setCheckedAllResidences(!checkedAllResidences);
                          if (e.target.checked) {
                            appendResesAndRoomsToUrl({ residencesList, router });
                          } else {
                            removeQueryParameters(router, [
                              { paramKey: "residenceId" },
                              { paramKey: "roomId" },
                            ]);
                          }
                          // let all = residencesList.map(
                          //   (res) => {
                          //     let residences = [
                          //       ["residenceId", res.id.toString()],
                          //     ];
                          //     console.log("residences", residences);

                          //     if (res.rooms.length) {
                          //       res.rooms.forEach((room) => {
                          //         residences.push(["residenceId", room.id.toString()]);
                          //       });
                          //     }
                          //     // console.log("residences", residences);

                          //     return residences.flat(1)
                          //   }
                          // );

                          // console.log(all);

                          // appendQueryParameters(router, all);
                          // !residencesTotalCount
                          //   ? setResidencesTotalCount(searchKeywordResultsData?.params?.count)
                          //   : setResidencesTotalCount(0);
                        }}
                        inputClassnames="checked:after:!bg-blue-dark"
                      />
                      <p className="text-white text-16 font-r leading-24">لیست اقامتگاه ها</p>
                    </div>
                    <div className="bg-gray-263341 rounded-6 p-4">
                      <span className="text-white text-14 font-r leading-20">
                        <span className="mx-2">
                          {checkedAllResidences
                            ? searchKeywordResultsData?.params?.count
                            : (router?.query?.residenceId
                                ? Array.isArray(router?.query?.residenceId)
                                  ? router?.query?.residenceId?.length
                                  : 1
                                : 0) +
                              (router?.query?.roomId
                                ? Array.isArray(router?.query?.roomId)
                                  ? router?.query?.roomId?.length
                                  : 1
                                : 0)}
                        </span>
                        اقامتگاه
                      </span>
                    </div>
                  </div>
                  {searchKeywordResultsIsLoading ? (
                    <TinyLoader />
                  ) : (
                    <div>
                      {residencesList?.map((item, idx) => (
                        <ResidenceCart
                          setCheckedAllResidences={setCheckedAllResidences}
                          key={`${item.id}-${idx}`}
                          display_type={item.display_type}
                          hostName={item.host.name}
                          hostPhone={item.host.phone}
                          image_url={item.image_url}
                          resAddress={item.address}
                          resId={item.id}
                          resName={item.name}
                          rooms={item.rooms || []}
                          lastUpdateAt={item.last_update_at}
                          lastUpdateBy={item.last_update_by}
                        />
                      ))}
                    </div>
                  )}
                  {!!renderPagination(
                    Number(router?.query?.page as string) || 1,
                    pageSize,
                    searchKeywordResultsData?.params?.count
                  ) && (
                    <div className="mt-8 mb-20">
                      <Button
                        onClick={() => {
                          removeSomeQueryParameters_Then_AddSomeQueryParameters(
                            router,
                            ["page"],
                            [["page", !!router?.query?.page ? Number(router?.query?.page) + 1 : 2]],
                            undefined,
                            false
                          );
                        }}
                        variant="outlined"
                        color="dark-blue"
                        isFullWidth
                        rounded
                        isLoading={searchKeywordResultsIsFetching}
                        loadingText="در حال لود..."
                        loadingTextClassName="ml-6"
                      >
                        مشاهده بیشتر
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              key={calendarKeyState.getTime()}
              className="col-span-6 p-20 border border-gray-E8E8E8 rounded-20 h-[540px]"
            >
              <Calendar
                wrapperClassname="bg-white"
                color="blue"
                hasBorderDashed={true}
                setDateToWorkWith={setDateToWorkWith}
                dateToWorkWith={dateToWorkWith}
                onMonthInc={() => {
                  setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                }}
                onMonthDec={() => {
                  setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                }}
                isRangeEnabled={isRangeEnabled}
                filledDays={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData).filled_dates.map((filled_date) =>
                        moment(filled_date, "YYYY-M-D")
                      )
                    : []
                }
                alreadyReservedDays={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData).reserved_dates.map((reserved_date) =>
                        moment(reserved_date, "YYYY-M-D")
                      )
                    : []
                }
                peakDays={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? getPeakDays((calendarData as IServerCalendarData)?.peak_dates)
                    : []
                }
                fastReserveDays={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData).fast_days.map((fast_day) =>
                        moment(fast_day, "YYYY-M-D")
                      )
                    : []
                }
                discounted_days={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData).discounted_days.map(
                        (discounted_day) => ({
                          ...discounted_day,
                          date: moment(discounted_day.date, "YYYY-M-D"),
                        })
                      )
                    : []
                }
                special_dates={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData).special_dates.map((special_date) => [
                        moment(special_date[0], "YYYY-M-D"),
                        special_date[1],
                      ])
                    : []
                }
                offDays={[]}
                prices={
                  !!calendarData && !!isOnlyOneItemSelected({ router })
                    ? (calendarData as IServerCalendarData)?.prices
                    : {
                        extra_guests_price: 0,
                        monthly_discount: 0,
                        peak_price: 0,
                        week_price: 0,
                        weekend_price: 0,
                        weekly_discount: 0,
                      }
                }
                showNavigateToPrevMonthBtn={true}
                showNavigateToNextMonthBtn={true}
                onlyShowCalendarDateNumber={!isOnlyOneItemSelected({ router })}
                noCoOperation={false}
                selectedRanges={selectedRanges}
                setSelectedRanges={setSelectedRanges}
                selectedIndividualDays={selectedIndividualDays}
                setSelectedIndividualDays={setSelectedIndividualDays}
                // checkForAlreadyReservedDatesOrFilledDatesValidity={true}
                // canOnlySelectOneRange={true}
                canSelectDay={!!finalSearchText}
                canSelectMonth={true}
              />
              <div className="mt-44 flex items-center justify-between">
                <Switch
                  name={"range-select"}
                  label={"انتخاب بازه ای"}
                  checked={isRangeEnabled}
                  onChange={(e) => {
                    setIsRangeEnabled(e.target.checked);
                  }}
                  inputClassnames="!bg-blue-main"
                />
                {(!!selectedIndividualDays.length || !!selectedRanges.length) && (
                  <Button
                    variant="contained"
                    color="grey"
                    rounded
                    onClick={() => resetAllSelectedDays()}
                  >
                    پاک کردن
                  </Button>
                )}
              </div>
            </div>
            <div className="col-span-4 p-20 border border-gray-E8E8E8 rounded-20 relative h-[540px]">
              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* <TextField
                    customValue={[
                      ...selectedRanges.map(
                        (range) =>
                          `${momentToJalali(range[0])} > ${
                            range[1] ? momentToJalali(range[1]) : ""
                          }`
                      ),
                      ...selectedIndividualDays.map((day) => momentToJalali(day)),
                    ].join(" , ")}
                    readonly={true}
                    wrapperClassname="py-8"
                    name="selectedDate"
                    ref={selectedDateTextFieldRef}
                    onClick={() => setShowCalendar(true)}
                    placeholder="تاریخ انتخابی"
                  /> */}
                  <p className="text-17 text-black leading-24 font-r mb-14">وضعیت تقویم</p>
                  <div className="w-full mb-24 flex items-center gap-x-20">
                    <Radio
                      label="بدون تغییر"
                      name="calendar_status_nochange"
                      value="nochange"
                      look={"selected"}
                      onChange={(e) => {
                        setCalendarStatus(e.target.value as "nochange");
                      }}
                      checked={calendarStatus === "nochange"}
                      color="blue"
                    />
                    <Radio
                      label="پر است"
                      name="full"
                      value="full"
                      look={"selected"}
                      onChange={(e) => {
                        setCalendarStatus(e.target.value as "full");
                      }}
                      checked={calendarStatus === "full"}
                      color="blue"
                    />
                    <Radio
                      label="خالی است"
                      name="empty"
                      value="empty"
                      look={"selected"}
                      onChange={(e) => {
                        setCalendarStatus(e.target.value as "empty");
                      }}
                      checked={calendarStatus === "empty"}
                      color="blue"
                    />
                  </div>
                  <div className="mt-12">
                    <UpdateCalendarForm UpdateCalendar_formik={formik} />
                  </div>
                  <p className="text-17 text-black leading-24 font-r mt-20 mb-14">وضعیت رزرو آنی</p>
                  <div className="w-full flex items-center gap-x-20">
                    <Radio
                      label="بدون تغییر"
                      name="fast_reservation_status_nochange"
                      value="nochange"
                      look={"selected"}
                      onChange={(e) => {
                        setFastReservationStatus(e.target.value as "nochange");
                      }}
                      checked={fastReservationStatus === "nochange"}
                      color="blue"
                    />
                    <Radio
                      label="آنی شود"
                      name="fast"
                      value="fast"
                      look={"selected"}
                      onChange={(e) => {
                        setFastReservationStatus(e.target.value as "fast");
                      }}
                      checked={fastReservationStatus === "fast"}
                      color="blue"
                    />
                    <Radio
                      label="غیرآنی شود"
                      name="slow"
                      value="slow"
                      look={"selected"}
                      onChange={(e) => {
                        setFastReservationStatus(e.target.value as "slow");
                      }}
                      checked={fastReservationStatus === "slow"}
                      color="blue"
                    />
                  </div>
                  <div className="flex justify-end mt-24">
                    <Button
                      variant="contained"
                      color="grey"
                      rounded
                      isFullWidth
                      onClick={() => setShowResidenceGeneralPricingModal(true)}
                      className="text-15 font-m text-blue-main leading-20 cursor-pointer border-none mb-12 justify-between pr-24"
                      leftIcon={<i className="icon-FlashLeft text-20" />}
                      disabled={generalPricingButtonActivation}
                    >
                      تغییر نرخ کلی
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-x-8">
                  <Button
                    disabled={
                      !(
                        !!getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges)
                          .length &&
                        (!!router?.query?.roomId?.length || !!router?.query?.residenceId?.length)
                      )
                    }
                    onClick={() => formik.handleSubmit()}
                    variant="contained"
                    color="dark-blue"
                    rounded
                    className="!w-[60%]"
                  >
                    ذخیره کردن تغییرات
                  </Button>
                  <Button
                    disabled={
                      !(
                        !!getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges)
                          .length &&
                        (!!router?.query?.roomId?.length || !!router?.query?.residenceId?.length)
                      )
                    }
                    onClick={() => handleResetCalendar()}
                    variant="contained"
                    color="warning"
                    rounded
                    className="!w-[40%]"
                  >
                    بازگردانی به قبل
                  </Button>
                </div>
              </div>
              {showResidenceGeneralPricingModal && (
                <ChangeResidenceStatusGeneralPricingModal
                  showResidenceGeneralPricingModal={showResidenceGeneralPricingModal}
                  setShowResidenceGeneralPricingModal={setShowResidenceGeneralPricingModal}
                />
              )}
              {/* <OutsideClickHandler
                handleClick={() => setShowCalendar(false)}
                exceptionElementsRef={[selectedDateTextFieldRef]}
              >
                {showCalendar && (
                  <div className="bg-white w-[300px] border border-gray-#E8E8E8 p-16 rounded-20 shadow-lg z-1 absolute top-70 left-7">
                    <Calendar
                      showToday={true}
                      wrapperClassname="bg-white"
                      color="blue"
                      rounded={true}
                      hasBorderDashed={false}
                      makeBgConsistentInSelectedRanges={true}
                      aspectRatio1by1
                      setDateToWorkWith={setDateToWorkWith}
                      dateToWorkWith={dateToWorkWith}
                      onMonthInc={() => {
                        setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                      }}
                      onMonthDec={() => {
                        setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                      }}
                      isRangeEnabled={isRangeEnabled}
                      filledDays={[]}
                      alreadyReservedDays={[]}
                      peakDays={[]}
                      fastReserveDays={[]}
                      discounted_days={[]}
                      special_dates={[]}
                      offDays={[]}
                      prices={{
                        extra_guests_price: 0,
                        monthly_discount: 0,
                        peak_price: 0,
                        week_price: 0,
                        weekend_price: 0,
                        weekly_discount: 0,
                      }}
                      showNavigateToPrevMonthBtn={true}
                      showNavigateToNextMonthBtn={true}
                      onlyShowCalendarDateNumber={true}
                      noCoOperation={false}
                      selectedRanges={selectedRanges}
                      setSelectedRanges={setSelectedRanges}
                      selectedIndividualDays={selectedIndividualDays}
                      setSelectedIndividualDays={setSelectedIndividualDays}
                      checkForAlreadyReservedDatesOrFilledDatesValidity={true}
                      canSelectMonth={true}
                      canSelectDay={!!finalSearchText}
                    />
                    <div className="flex items-center justify-between mt-16">
                      <Switch
                        name={"range-select"}
                        label={"بازه ای"}
                        checked={isRangeEnabled}
                        onChange={(e) => {
                          setIsRangeEnabled(e.target.checked);
                        }}
                        inputClassnames="!bg-blue-main"
                      />
                      <div className="flex items-center gap-x-8">
                        <Button
                          color="grey"
                          onClick={() => resetAllSelectedDays()}
                          rounded
                          className="!px-10"
                        >
                          انصراف
                        </Button>
                        <Button onClick={() => setShowCalendar(false)} color="dark-blue" rounded>
                          تایید تاریخ
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </OutsideClickHandler> */}
            </div>
          </div>
        </div>
      )}
      {!hasPermission && !permissionIsLoading && <Inaccessibility />}
    </>
  );
}

export default ChangeResidencesStatus;
