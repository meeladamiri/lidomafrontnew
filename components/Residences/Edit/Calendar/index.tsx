import { useMutation, useQuery } from "@tanstack/react-query";
import { getCalendarData, IServerCalendarData } from "api/Calendar/Calendar";
import Calendar from "components/Calendar";
import CalendarHelp from "components/Calendar/CalendarHelp";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import DropDown from "components/General/core/DropDown";
import Cart from "components/General/core/DropDown/DropdownCart";
import ModalHeader from "components/General/core/ModalHeader";
import { Switch } from "components/General/core/Switch";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import Link from "next/link";
import InstantBookingToggle from "./InstantBookingToggle";
import { useFormik } from "formik";
import moment from "moment-jalaali";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import EditCalendarBottomSheet from "components/Residences/Edit/Calendar/EditCalendarBottomSheet";
import * as Yup from "yup";
import exception from "utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { getAllUniqueSelectedDays_Array } from "utilities/calendar/getAllUniqueSelectedDays_Array";
import { ResidenceStates_enum } from "constants/enums/residence_states";
import { getPeakDays } from "@/utilities/calendar/getPeakDays";
import {
  IServerResidence,
  IServerRoom,
  getResidencesList,
} from "@/api/Residences/getResidencesList";
import { UpdateCalendar_TEnable, updateCalendar } from "@/api/Residences/updateCalendar";

const calendarPriceAndDiscount_NoChange_YupSchema = {
  "selected-days-price_NoChange": Yup.number().nullable(),
  // .typeError(VALIDATION_MESSAGES.REQUIRED),
  // .required(VALIDATION_MESSAGES.REQUIRED),
  "selected-days-discount_NoChange": Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
};

const calendarPriceAndDiscount_MakeEmpty_YupSchema = {
  "selected-days-price_MakeEmpty": Yup.number().nullable(),
  // .typeError(VALIDATION_MESSAGES.REQUIRED),
  // .required(VALIDATION_MESSAGES.REQUIRED),
  "selected-days-discount_MakeEmpty": Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
};

interface ICalendarPriceAndDiscount_NoChange_V {
  "selected-days-price_NoChange": number | null;
  "selected-days-discount_NoChange": number | null;
}

interface ICalendarPriceAndDiscount_MakeEmpty_V {
  "selected-days-price_MakeEmpty": number | null;
  "selected-days-discount_MakeEmpty": number | null;
}

const calendarPriceAndDiscount_NoChange_InitV: ICalendarPriceAndDiscount_NoChange_V = {
  "selected-days-price_NoChange": null,
  "selected-days-discount_NoChange": null,
};

const calendarPriceAndDiscount_MakeEmpty_InitV: ICalendarPriceAndDiscount_MakeEmpty_V = {
  "selected-days-price_MakeEmpty": null,
  "selected-days-discount_MakeEmpty": null,
};

/**
 * What the host chose for «رزرو آنی» on the selected days.
 *
 * "none" is the default and rides along with every save: not touching the
 * control must not change how those nights get booked.
 */
export type FastChoice = "on" | "off" | "none";

function EditResidenceCalendar() {
  const router = useRouter();
  const [selectedResidenceValue, setSelectedResidenceValue] = useState<number | "all">(); // as residenceId
  const [fastChoice, setFastChoice] = useState<FastChoice>("none");
  /**
   * The last calendar fetch failed.
   *
   * Failure used to raise a toast and nothing else — `calendarData` stayed
   * undefined, so the loading guard kept spinning behind a message that had
   * already faded. A spinner that never stops is indistinguishable from a
   * slow network, and it left the host no way to try again.
   */
  const [calendarFailed, setCalendarFailed] = useState(false);
  const [residencesList, setResidencesList] = useState<IServerResidence[]>();
  // const [allRoomsList, setAllRoomsList] = useState<IServerRoom[]>();
  const [eligibleRoomsToBeListed, setEligibleRoomsToBeListed] = useState<IServerRoom[]>();

  const [dateToWorkWith, setDateToWorkWith] = useState<moment.Moment>(moment(new Date()));

  const [calendarPriceAndDiscount_NoChange_V, setCalendarPriceAndDiscount_NoChange_V] = useState(
    calendarPriceAndDiscount_NoChange_InitV
  );
  const [calendarPriceAndDiscount_MakeEmpty_V, setCalendarPriceAndDiscount_MakeEmpty_V] = useState(
    calendarPriceAndDiscount_MakeEmpty_InitV
  );

  const [calendarData, setCalendarData] = useState<IServerCalendarData>();
  const [isRangeEnabled, setIsRangeEnabled] = useState(false);

  const [showEditCalendarBottomSheet, setShowEditCalendarBottomSheet] = useState(false);

  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [selectedIndividualDays, setSelectedIndividualDays] = useState<moment.Moment[]>([]);

  const {
    isSuccess: residencesIsSuccess,
    isLoading: residencesIsLoading,
    isFetching: residencesIsFetching,
    data,
  } = useQuery(["getResidencesList"], () => getResidencesList());

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const allResidences: IServerResidence[] = data?.params?.residences;
        setResidencesList(allResidences);

        // setAllRoomsList(parsedData?.params?.rooms);

        const allRooms: IServerRoom[] = data?.params?.rooms;
        setEligibleRoomsToBeListed(
          allRooms.filter(
            (room) => allResidences.find((res) => res.id === room.parent_id)?.res_type !== "suit"
          )
        );
      }
    }
  }, [data]);

  useEffect(() => {
    if (!!showEditCalendarBottomSheet) {
    }
  }, [showEditCalendarBottomSheet]);

  const updateCalendarMutation = useMutation(
    ({
      product_id,
      products,
      dates,
      enable,
      isFast,
      resType,
      price,
      discount,
    }: {
      product_id?: number;
      products?: number[];
      dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
      resType: ResidenceTypes_enum;
      enable: UpdateCalendar_TEnable;
      isFast?: boolean;
      price?: number;
      discount?: number;
    }) => {
      return updateCalendar({
        product_id,
        products,
        dates,
        enable,
        isFast,
        resType,
        price,
        discount,
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "بروزرسانی با موفقیت انجام شد." },
          ]);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const editCalendarPriceAndDiscount_NoChange_Formik = useFormik({
    initialValues: calendarPriceAndDiscount_NoChange_V,
    validationSchema: Yup.object(calendarPriceAndDiscount_NoChange_YupSchema),
    onSubmit: async (values) => {
      try {
        if (selectedResidenceValue === "all") {
          // Mutation for products
          const resp1 = await updateCalendarMutation.mutateAsync({
            products: residencesList
              ?.filter((res) => res.state === ResidenceStates_enum.ACTIVE)
              ?.map((product) => product.id), // ids of products
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: undefined,

            isFast: fastForRequest(),
            resType: ResidenceTypes_enum.PRODUCT,
            price: values["selected-days-price_NoChange"] || 0,
            discount: values["selected-days-discount_NoChange"] || 0,
          });

          // Mutation for rooms
          const resp2 = await updateCalendarMutation.mutateAsync({
            products: eligibleRoomsToBeListed?.map((room) => room.id as number), // ids of rooms
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: undefined,

            isFast: fastForRequest(),
            resType: ResidenceTypes_enum.ROOM,
            price: values["selected-days-price_NoChange"] || 0,
            discount: values["selected-days-discount_NoChange"] || 0,
          });

          if (resp2?.status === "error") {
            exception.message([
              {
                type: EXCEPTIONTYPES.ERROR,
                title: resp2?.err_msg || defaultError,
              },
            ]);
          }
        } else {
          const resp = await updateCalendarMutation.mutateAsync({
            product_id: selectedResidenceValue as number, // id of the only-selected residence
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: undefined,

            isFast: fastForRequest(),
            resType: router.query.residenceType as ResidenceTypes_enum,
            price: values["selected-days-price_NoChange"] || 0,
            discount: values["selected-days-discount_NoChange"] || 0,
          });

          if (resp?.status === "success") {
            // refetch(es)
            refetchCalendarData();
            // clearings
            resetAllSelectedDays();
            editCalendarPriceAndDiscount_NoChange_Formik.resetForm();

            // exception.message([
            //   { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
            // ]);
            setShowEditCalendarBottomSheet(false);
          }
        }

        // exception.message();
      } catch (e: any) {
        // console.log("ERRRRRRRROOOOOOOOOOOOOR ISSSSSSSS", { e });
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: e?.err_msg || defaultError }]);
      }
    },
    enableReinitialize: false,
  });

  const editCalendarPriceAndDiscount_MakeEmpty_Formik = useFormik({
    initialValues: calendarPriceAndDiscount_MakeEmpty_V,
    validationSchema: Yup.object(calendarPriceAndDiscount_MakeEmpty_YupSchema),
    onSubmit: async (values) => {
      try {
        if (selectedResidenceValue === "all") {
          // Mutation for products
          const resp1 = await updateCalendarMutation.mutateAsync({
            products: residencesList
              ?.filter((res) => res.state === ResidenceStates_enum.ACTIVE)
              .map((product) => product.id), // ids of products
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: "empty",

            isFast: fastForRequest(),
            resType: ResidenceTypes_enum.PRODUCT,
            price: values["selected-days-price_MakeEmpty"] || 0,
            discount: values["selected-days-discount_MakeEmpty"] || 0,
          });

          // console.log("resp1-1", resp1?.result);
          // console.log("resp1-1", resp1?.status);
          // Mutation for rooms
          const resp2 = await updateCalendarMutation.mutateAsync({
            products: eligibleRoomsToBeListed?.map((room) => room.id as number), // ids of rooms
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: "empty",

            isFast: fastForRequest(),
            resType: ResidenceTypes_enum.ROOM,
            price: values["selected-days-price_MakeEmpty"] || 0,
            discount: values["selected-days-discount_MakeEmpty"] || 0,
          });

          if (resp2?.status === "error") {
            exception.message([
              {
                type: EXCEPTIONTYPES.ERROR,
                title: resp2?.err_msg || defaultError,
              },
            ]);
          }
        } else {
          const resp = await updateCalendarMutation.mutateAsync({
            product_id: selectedResidenceValue as number, // id of the only-selected residence
            dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
            enable: "empty",

            isFast: fastForRequest(),
            resType: router.query.residenceType as ResidenceTypes_enum,
            price: values["selected-days-price_MakeEmpty"] || 0,
            discount: values["selected-days-discount_MakeEmpty"] || 0,
          });

          if (resp?.status === "success") {
            // refetch(es)
            refetchCalendarData();
            // clearings
            resetAllSelectedDays();
            editCalendarPriceAndDiscount_MakeEmpty_Formik.resetForm();

            // exception.message([
            //   { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
            // ]);
            setShowEditCalendarBottomSheet(false);
          }
        }

        // exception.message();
      } catch (e: any) {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: e?.err_msg || defaultError }]);
      }
    },
    // enableReinitialize: true,
  });

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    isFetching: calendarDataIsFetching,
    refetch: refetchCalendarData,
    data: dataOfCalendar,
  } = useQuery(
    ["getCalendarData", selectedResidenceValue],
    () => {
      return getCalendarData({
        residenceId: selectedResidenceValue as number | "all",
        // TODO: Waiting for backend reply for 'what value should be sent when "all" is selected'
        residenceType: router.query.residenceType as ResidenceTypes_enum,
      });
    },
    {
      enabled: !!selectedResidenceValue && selectedResidenceValue !== "all",
    }
  );

  useEffect(() => {
    if (!!dataOfCalendar) {
      if (dataOfCalendar?.status === "error") {
        setCalendarFailed(true);
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: dataOfCalendar?.err_msg || defaultError },
        ]);
      } else {
        const serverCalendarData: IServerCalendarData = dataOfCalendar?.params;

        setCalendarFailed(false);
        setCalendarData(serverCalendarData);
      }
    }
  }, [dataOfCalendar]);

  /**
   * Which listing the calendar is showing.
   *
   * The page used to be entered only from a button on a listing card, so a
   * `residenceId` was always in the URL and nothing needed to happen without
   * one. It is a destination of its own now — opened from the menu with no
   * query at all — and in that case nothing was ever selected, no calendar
   * was ever fetched, and the loading guard below never let go. The page
   * simply span.
   *
   * So: honour the URL when it says something, and otherwise fall to the
   * host's first active listing, which is the one they almost always mean.
   */
  useEffect(() => {
    if (router?.query?.residenceId) {
      if (router?.query?.residenceId === "all") {
        setSelectedResidenceValue("all");
      } else {
        setSelectedResidenceValue(Number(router?.query?.residenceId));
      }
      return;
    }

    if (selectedResidenceValue !== undefined) return;

    const firstActive = residencesList?.find((res) => res.state === ResidenceStates_enum.ACTIVE);
    if (firstActive) {
      setSelectedResidenceValue(firstActive.id);
      return;
    }
    const firstRoom = eligibleRoomsToBeListed?.[0];
    if (firstRoom) setSelectedResidenceValue(firstRoom.id as number);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router?.query?.residenceId, residencesList, eligibleRoomsToBeListed]);

  function resetAllSelectedDays() {
    setSelectedIndividualDays([]);
    setSelectedRanges([]);
  }

  function getNumberOfAllUniqueSelectedDays() {
    const allUniqueSelectedDays_Array = getAllUniqueSelectedDays_Array(
      selectedIndividualDays,
      selectedRanges
    );
    return allUniqueSelectedDays_Array.length;
  }

  function getBtnText() {
    const incompleteRangeData = selectedRanges.find((selectedRange) => selectedRange[1] === null);
    if (incompleteRangeData) {
      return "در انتظار انتخاب انتهای بازه";
    }

    const numberOfAllUniqueSelectedDays = getNumberOfAllUniqueSelectedDays();

    return `بروزرسانی ${numberOfAllUniqueSelectedDays} روز`;
  }

  useEffect(() => {
    resetAllSelectedDays();
  }, [router?.query?.residenceId, router?.query?.residenceType]);

  //   console.log("router", router?.query?.residenceId);

  const day = "2021-02-11";

  // console.log("jalali", moment("2000-1-31", "YYYY-M-D"));
  // console.log("Hey0", moment(day).format("jYYYY/jMM/jDD"));
  // console.log("Hey1", moment(day).startOf("jMonth").format("jYYYY/jMM/jDD"));
  // console.log("Hey1", day);
  // console.log("Hey2", miladiToJalali(day));
  // console.log("getNumberOfDaysInMonth", getNumberOfDaysInMonth(day));
  // for (let month = 1; month <= 12; month++) {
  //   console.log(
  //     miladiToJalali(`2022-${month}-13`),
  //     // moment(`2022-${month}-13`, "en").locale("fa").daysInMonth()
  //     getNumberOfDaysInMonth(`2022-${month}-13`)
  //   );
  // }

  // console.log("all", )

  // console.log(
  //   "jalali2",
  //   new Intl.DateTimeFormat("fa-IR", {
  //     dateStyle: "full",
  //   }).format(new Date("2010/10/13"))
  //   // ?.split(",")
  // );

  // editCalendarPriceAndDiscount_NoChange_Formik.handleSubmit

  /** undefined when untouched, so the field is simply not sent. */
  const fastForRequest = () => (fastChoice === "none" ? undefined : fastChoice === "on");

  async function handleFillingCalendarDates() {
    try {
      if (selectedResidenceValue === "all") {
        // Mutation for products
        const resp1 = await updateCalendarMutation.mutateAsync({
          products: residencesList
            ?.filter((res) => res.state === ResidenceStates_enum.ACTIVE)
            ?.map((product) => product.id), // ids of products
          dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
          enable: "full",

          isFast: fastForRequest(),
          resType: ResidenceTypes_enum.PRODUCT,
        });

        // console.log("resp1-1", resp1?.result);
        // console.log("resp1-1", resp1?.status);
        // Mutation for rooms
        const resp2 = await updateCalendarMutation.mutateAsync({
          products: eligibleRoomsToBeListed?.map((room) => room.id as number), // ids of rooms
          dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
          enable: "full",

          isFast: fastForRequest(),
          resType: ResidenceTypes_enum.ROOM,
        });

        if (resp2?.status === "error") {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: resp2?.err_msg || defaultError,
            },
          ]);
        }
      } else {
        const resp = await updateCalendarMutation.mutateAsync({
          product_id: selectedResidenceValue as number, // id of the only-selected residence
          dates: getAllUniqueSelectedDays_Array(selectedIndividualDays, selectedRanges),
          enable: "full",

          isFast: fastForRequest(),
          resType: router.query.residenceType as ResidenceTypes_enum,
        });

        if (resp?.status === "success") {
          // refetch(es)
          refetchCalendarData();
          // clearings
          resetAllSelectedDays();
          editCalendarPriceAndDiscount_MakeEmpty_Formik.resetForm();

          // exception.message([
          //   { type: EXCEPTIONTYPES.SUCCESS, title: "تقویم با موفقیت بروزرسانی شد" },
          // ]);
          setShowEditCalendarBottomSheet(false);
        }
      }

      // exception.message();
    } catch (e: any) {
      exception.message([{ type: EXCEPTIONTYPES.ERROR, title: e?.err_msg || defaultError }]);
    }
  }

  return (
    <div className="relative pt-80 md:pt-0">
      <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
        <ModalHeader headerTitle={"ویرایش تقویم"} onBackClick={() => router.back()} />
      </div>

      <div className="">
        {/*
          Three states, not two.

          This used to fall into the loader whenever `calendarData` was
          missing — which, for a host with nothing published, is forever:
          there is no listing to fetch a calendar for, so the page showed its
          heading and then an empty screen with no way to tell whether it was
          loading, broken, or simply had nothing to say.
        */}
        {residencesIsLoading ? (
          <TinyLoader />
        ) : !residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE).length &&
          !eligibleRoomsToBeListed?.length ? (
          <div className="py-48 text-center">
            <i className="icon-Calendar text-40 text-gray-A9B1BC" />
            <p className="text-15 font-b text-black mt-16">هنوز اقامتگاه فعالی ندارید</p>
            <p className="text-13 leading-24 font-l text-gray-77828F mt-6 mb-20">
              تقویم پس از تایید اولین اقامتگاه شما در دسترس قرار می‌گیرد.
            </p>
            <Link
              href="/residences/list"
              className="inline-flex h-[44px] px-24 rounded-12 bg-primary-main text-14 font-b text-black items-center"
            >
              اقامتگاه‌های من
            </Link>
          </div>
        ) : calendarFailed && !calendarData ? (
          <div className="py-48 text-center">
            <i className="icon-Warning text-40 text-warning" />
            <p className="text-14 leading-26 font-m text-black mt-16 mb-20">
              تقویم این اقامتگاه بارگذاری نشد.
            </p>
            <button
              type="button"
              onClick={() => {
                setCalendarFailed(false);
                refetchCalendarData();
              }}
              className="h-[44px] px-24 rounded-12 bg-primary-main text-14 font-b text-black"
            >
              تلاش دوباره
            </button>
          </div>
        ) : calendarDataIsFetching || (!calendarData && selectedResidenceValue !== "all") ? (
          <TinyLoader />
        ) : (
          <>
            <div className="pb-[88px] md:pb-0">
              {/*
                «رزرو آنی» lives here rather than on the listing card: it is a
                property of how the listing takes bookings, and the exceptions
                to it are set on the calendar directly below. "All residences"
                has no single answer to show, so it appears only for one.
              */}
              {typeof selectedResidenceValue === "number" && (
                <InstantBookingToggle residenceId={selectedResidenceValue} />
              )}
              {(!!residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE).length ||
                (!!eligibleRoomsToBeListed && !!eligibleRoomsToBeListed.length)) && (
                <DropDown
                  currntValue={selectedResidenceValue || 0}
                  onChange={(e, value, allChildProps) => {
                    // setSelectedResidenceValue(value as number | "all")
                    // Stay on whichever route the host opened — the menu
                    // entry is /residences/calendar, and bouncing them to the
                    // old /edit URL on every pick is a needless redirect.
                    router.replace(
                      `${router.pathname}?residenceId=${value}&residenceType=${allChildProps?.type}`
                    );
                  }}
                >
                  {[
                    <Cart
                      key={new Date().getMilliseconds()}
                      value={"all"}
                      title={"انتخاب همه اقامتگاه ها"}
                      subText={`${
                        (
                          residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) ||
                          []
                        ).length + (eligibleRoomsToBeListed || []).length
                      } اقامتگاه`}
                      iconSrc={"icon-LocationHome"}
                      type={"all"}
                    />,
                    ...(
                      residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) || []
                    ).map((residence: any, index: number) => {
                      return (
                        <Cart
                          key={index}
                          value={residence?.id}
                          title={residence?.name}
                          subText={`کد اقامتگاه : ${residence?.reference}`}
                          imgSrc={residence?.image_url}
                          type={ResidenceTypes_enum.PRODUCT}
                        />
                      );
                    }),
                    ...(eligibleRoomsToBeListed || []).map((room: any, index: number) => {
                      return (
                        <Cart
                          key={index}
                          value={room.id}
                          title={room.name}
                          subText={`کد اتاق : ${room.id}`}
                          imgSrc={room.image_url}
                          type={ResidenceTypes_enum.ROOM}
                        />
                      );
                    }),
                  ]}
                </DropDown>
              )}

              <div className="mb-16">
                <p className="my-16 text-10 leading-18 text-black text-center">
                  با کلیک بر روی یک یا چند روز، تغییرات را به صورت یکجا اعمال کنید.
                </p>

                <Calendar
                  // initialDateToWorkWith
                  dateToWorkWith={dateToWorkWith}
                  // setDateToWorkWith={setDateToWorkWith}
                  onMonthInc={() => {
                    setDateToWorkWith(dateToWorkWith.clone().add(1, "jMonth"));
                  }}
                  onMonthDec={() => {
                    setDateToWorkWith(dateToWorkWith.clone().subtract(1, "jMonth"));
                  }}
                  filledDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).filled_dates.map((filled_date) =>
                          moment(filled_date, "YYYY-M-D")
                        )
                  }
                  noCoOperation={false}
                  alreadyReservedDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).reserved_dates.map((reserved_date) =>
                          moment(reserved_date, "YYYY-M-D")
                        )
                  }
                  offDays={[]} // TODO
                  peakDays={
                    selectedResidenceValue === "all"
                      ? []
                      : getPeakDays((calendarData as IServerCalendarData)?.peak_dates)
                  }
                  fastReserveDays={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).fast_days.map((fast_day) =>
                          moment(fast_day, "YYYY-M-D")
                        )
                  }
                  discounted_days={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).discounted_days.map(
                          (discounted_day) => ({
                            ...discounted_day,
                            date: moment(discounted_day.date, "YYYY-M-D"),
                          })
                        )
                  }
                  special_dates={
                    selectedResidenceValue === "all"
                      ? []
                      : (calendarData as IServerCalendarData).special_dates.map((special_date) => [
                          moment(special_date[0], "YYYY-M-D"),
                          special_date[1],
                        ])
                  }
                  prices={
                    selectedResidenceValue === "all"
                      ? {
                          extra_guests_price: 0,
                          monthly_discount: 0,
                          peak_price: 0,
                          week_price: 0,
                          weekend_price: 0,
                          weekly_discount: 0,
                        }
                      : (calendarData as IServerCalendarData)?.prices
                  }
                  onlyShowCalendarDateNumber={selectedResidenceValue === "all"}
                  isRangeEnabled={isRangeEnabled}
                  // SELECTING Props
                  selectedRanges={selectedRanges}
                  setSelectedRanges={setSelectedRanges}
                  selectedIndividualDays={selectedIndividualDays}
                  setSelectedIndividualDays={setSelectedIndividualDays}
                />
              </div>

              <div className="flex items-center justify-between mb-36">
                <CalendarHelp />

                <Switch
                  name={"range-select"}
                  label={"انتخاب بازه ای"}
                  checked={isRangeEnabled}
                  onChange={(e) => {
                    setIsRangeEnabled(e.target.checked);
                  }}
                />
              </div>

              <LinkButton
                href={`/residences/${
                  router?.query?.residenceId
                }/general-pricing/edit?residenceType=${
                  router.query.residenceType as ResidenceTypes_enum
                }&fromCalendarPage=true`}
                isFullWidth
                className="!pr-12 !pl-8"
                color="grey"
                // Refrence to S.Rezaei in Figma: hide this btn when 'all residence' option is selected;
                disabled={selectedResidenceValue === "all"}
              >
                <div className="flex items-center justify-between w-full">
                  <p>تغییر نرخ کلی اقامتگاه</p>
                  <i className="icon-FlashLeft text-24" />
                </div>
              </LinkButton>

              <div className="mt-24">
                <span className="text-14 leading-24 text-black font-m ml-4">توجه : </span>
                <span className="text-12 leading-21 text-black font-l">
                  به ‌روز نگه‌ داشتن تقویم باعث کاهش رد رزرو، افزایش رتبه و رزرو اقامتگاه در سایت
                  می‌شود.
                </span>
              </div>
            </div>

            <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto">
              {!selectedIndividualDays.length && !selectedRanges.length ? (
                <Button isFullWidth color="grey">
                  حداقل یک روز را انتخاب کنید
                </Button>
              ) : (
                <div className="grid grid-cols-3 gap-x-12">
                  <div className="col-span-1">
                    <Button
                      isFullWidth
                      color="grey"
                      onClick={() => resetAllSelectedDays()}
                      className="!px-10"
                    >
                      پاک کردن
                    </Button>
                  </div>
                  <div className="col-span-2">
                    <Button
                      isFullWidth
                      disabled={!!selectedRanges.find((selectedRange) => selectedRange[1] === null)}
                      className="!px-4"
                      type="submit"
                      onClick={() => {
                        // TODO: calculate if the selected days have the same price or the same discount
                        setShowEditCalendarBottomSheet(true);
                      }}
                    >
                      {getBtnText()}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <BottomSheet
              open={showEditCalendarBottomSheet}
              handleClose={() => setShowEditCalendarBottomSheet(false)}
              headerTitle="بروزرسانی تقویم"
              body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
                return (
                  <EditCalendarBottomSheet
                    handleSmoothClose={handleSmoothClose}
                    noChange_formik={editCalendarPriceAndDiscount_NoChange_Formik}
                    makeEmpty_formik={editCalendarPriceAndDiscount_MakeEmpty_Formik}
                    handleFillingCalendarDates={handleFillingCalendarDates}
                    fastChoice={fastChoice}
                    setFastChoice={setFastChoice}
                  />
                );
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
export default EditResidenceCalendar;
