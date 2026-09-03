import PageTitle from "components/General/PageTitle";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import ModalHeader from "../General/core/ModalHeader";
import { TinyLoader } from "../General/Loader/TinyLoader";
import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import Image from "next/image";
import Link from "next/link";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { miladiToJalali } from "@/utilities/dateTools";
import { TextField } from "../General/core/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { getCalendarData, IServerCalendarData } from "@/api/Calendar/Calendar";
import { Button } from "../General/core/Button";
import { useRouter } from "next/router";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import {
  IServerResidence,
  IServerRoom,
  getResidencesList,
} from "@/api/Residences/getResidencesList";
import { IUpdateNowruzCalendar, updateNowruzCalendar } from "@/api/nowruz";
import ModalWrapper from "../General/core/ModalWrapper";
import Calendar from "../Calendar";
import moment, { Moment } from "moment-jalaali";
import { getAllUniqueSelectedDays_Array } from "@/utilities/calendar/getAllUniqueSelectedDays_Array";
import React from "react";
import ChooseDateBox from "../General/ChooseDateBox";

const residenceNowruzPricingInitV: { nowruzPrice: number | null } = {
  nowruzPrice: null,
};

const residenceGeneralPricingYupSchema = {
  nowruzPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
};

function NowruzPricingAll() {
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [dateToWorkWith, setDateToWorkWith] = useState<Moment>(moment(new Date()));

  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([[moment("2024/03/19"), moment("2024/04/01")]]);

  function resetAllSelectedDays() {
    setSelectedRanges([]);
  }

  const [elligibleResidencesToEditNowruzPricing, setElligibleResidencesToEditNowruzPricing] =
    useState<(IServerRoom | IServerResidence)[]>();
  const router = useRouter();

  const [residenceNowruzPricingV, setResidenceNowruzPricingV] = useState<{
    nowruzPrice: number | null;
  }>(residenceNowruzPricingInitV);

  const [currentResBeingEdited, setCurrentResBeingEdited] = useState<number>(0);

  const { isSuccess, isLoading, data } = useQuery(
    ["getResidencesList"],
    () => getResidencesList(),
    {
      refetchInterval: false,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        const allReses = data?.params?.residences as IServerResidence[];
        const activeReses = allReses.filter(
          (res) => res.state === ResidenceStates_enum.ACTIVE && res.res_type !== "boomgardi"
        );

        const allRooms = data?.params?.rooms as IServerRoom[];

        setElligibleResidencesToEditNowruzPricing([...activeReses, ...allRooms]);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    data: calendarData,
    refetch: calendarDataRefetch,
  } = useQuery(
    ["getCalendarData", elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]?.id],
    () => {
      return getCalendarData({
        residenceId: elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]?.id as number,
        residenceType:
          elligibleResidencesToEditNowruzPricing &&
          "parent_id" in elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]
            ? ResidenceTypes_enum.ROOM
            : ResidenceTypes_enum.PRODUCT,
        scope: "host",
      });
    },
    {
      enabled: !!elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]?.id,
    }
  );

  useEffect(() => {
    if (!!calendarData) {
      if (calendarData?.status === "success") {
        const serverCalendarData: IServerCalendarData = calendarData?.params;

        setResidenceNowruzPricingV({
          nowruzPrice: serverCalendarData?.prices.week_price || 0,
        });
      } else {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: calendarData?.err_msg || defaultError },
        ]);
      }
    }
  }, [calendarData]);

  const residenceGeneralPricingFormik = useFormik({
    initialValues: residenceNowruzPricingV,
    validationSchema: Yup.object(residenceGeneralPricingYupSchema),
    onSubmit: (values) => {
      editResidenceGeneralPricingMutation.mutate({
        resType:
          elligibleResidencesToEditNowruzPricing &&
          "parent_id" in elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]
            ? ResidenceTypes_enum.ROOM
            : ResidenceTypes_enum.PRODUCT,
        product_id: elligibleResidencesToEditNowruzPricing?.[currentResBeingEdited]?.id as number,
        price: values.nowruzPrice || 0,
        dates: getAllUniqueSelectedDays_Array([], selectedRanges),
      });
    },
    enableReinitialize: true,
  });

  const editResidenceGeneralPricingMutation = useMutation(
    ({ product_id, dates, resType, price }: IUpdateNowruzCalendar) => {
      return updateNowruzCalendar({
        product_id,
        dates,
        resType,
        price,
      });
    },
    {
      onSuccess: (resp) => {
        if (resp?.status === "success") {
          calendarDataRefetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);

          if (currentResBeingEdited < elligibleResidencesToEditNowruzPricing!.length - 1) {
            setCurrentResBeingEdited((prev) => prev + 1);
          } else {
            router.push(`/dashboard`);
          }
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  return (
    <>
      <div className="relative">
        <div className="fixed top-0 right-0 left-0 z-[6] md:hidden">
          <ModalHeader headerTitle="نرخ نوروز 1403" onBackClick={() => router.back()} />
        </div>

        <div className="pt-80 md:pt-0">
          {!elligibleResidencesToEditNowruzPricing ? (
            <TinyLoader />
          ) : (
            <>
              <div className="pb-[88px] md:pb-0">
                <PageTitle title="نرخ نوروز 1403" containerClassname="mb-24 hidden md:flex" />

                <div className="mb-16">
                  <div className="w-full h-[214px] p-12 relative rounded-10">
                    <Image
                      src={elligibleResidencesToEditNowruzPricing[currentResBeingEdited].image_url}
                      fill
                      style={{
                        objectFit: "cover",
                      }}
                      alt="اقامتگاه"
                      className="rounded-10"
                      placeholder="blur"
                      blurDataURL={
                        elligibleResidencesToEditNowruzPricing[currentResBeingEdited].image_url
                      }
                    />

                    <div className="flex flex-col justify-between h-full">
                      <div className="z-3 flex justify-end">
                        <Link
                          passHref
                          prefetch={false}
                          href={getPropertyPageUrl({
                            residenceId:
                              elligibleResidencesToEditNowruzPricing[currentResBeingEdited].id,
                          })}
                          className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
                        >
                          <i className="icon-See text-18" />
                          <span className="text-12 leading-21">مشاهده</span>
                        </Link>
                      </div>

                      <div className="z-2">
                        <div className="flex grow items-end justify-between gap-x-8">
                          <div className="text-14 leading-24 text-white OnlyOneLineAndEndWithElipsis">
                            <p className="OnlyOneLineAndEndWithElipsis">
                              {elligibleResidencesToEditNowruzPricing[currentResBeingEdited].name}
                            </p>
                            {elligibleResidencesToEditNowruzPricing[currentResBeingEdited]
                              .last_update_time && (
                              <p className="text-12 leading-21 font-l text-[rgba(255,255,255,0.65)] OnlyOneLineAndEndWithElipsis">
                                آخرین بروزرسانی :{" "}
                                {miladiToJalali(
                                  elligibleResidencesToEditNowruzPricing[currentResBeingEdited]
                                    .last_update_time
                                )}
                              </p>
                            )}
                          </div>

                          {!!elligibleResidencesToEditNowruzPricing[currentResBeingEdited]
                            .reference && (
                            <div className="shrink-0 flex justify-end">
                              <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                                کد اقامتگاه :{" "}
                                {
                                  elligibleResidencesToEditNowruzPricing[currentResBeingEdited]
                                    .reference
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* that faded black layer on image  */}
                    <div
                      className="h-[107px] absolute w-full bottom-0 right-0 rounded-bl-10 rounded-br-10"
                      style={{
                        background:
                          "linear-gradient(0deg, #000000 7%, rgba(0, 0, 0, 0.52) 49.82%, rgba(0, 0, 0, 0.0001) 80.84%)",
                      }}
                    />
                  </div>
                </div>

                <ChooseDateBox
                  placeholder="تاریخ ایام نوروز"
                  selectedRanges={selectedRanges}
                  setShowCalendarModal={setShowCalendarModal}
                />

                {calendarDataIsLoading ? (
                  <div className="md:py-24">
                    <TinyLoader />
                  </div>
                ) : (
                  <div className="">
                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="nowruzPrice"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="قیمت ایام نوروز"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">تومان</span>
                        }
                        wordifyNumbers={true}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`
                bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0
                z-2 md:static md:mt-40 md:w-[320px] md:mx-auto grid grid-cols-2 gap-x-24
              `}
              >
                <Button
                  rightIcon={<i className="icon-FlashRight text-24 text-black" />}
                  isFullWidth
                  variant="outlined"
                  color="grey"
                  className={`!pl-16 !pr-8 ${
                    currentResBeingEdited === 0 ? "hidden" : "col-span-1"
                  }`}
                  onClick={() => setCurrentResBeingEdited((prev) => prev - 1)}
                >
                  اقامتگاه قبلی
                </Button>
                <Button
                  className={`${currentResBeingEdited === 0 ? "col-span-2" : "col-span-1"}`}
                  isFullWidth
                  onClick={() => {
                    residenceGeneralPricingFormik.handleSubmit();
                  }}
                  leftIcon={<i className="icon-FlashLeft text-24 text-white" />}
                >
                  {currentResBeingEdited < elligibleResidencesToEditNowruzPricing.length - 1
                    ? "ذخیره و بعدی"
                    : "ذخیره و پایان"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
      {showCalendarModal && (
        <ModalWrapper
          headerTitle="نرخ نوروز 1403"
          onClose={() => {
            setShowCalendarModal(false);
          }}
          open={showCalendarModal}
          modalClassname="md:w-[420px]"
          bodyContainerClassname="pt-[124px] md:pt-0"
        >
          <Calendar
            canNavigateToAllPrevMonth={true}
            canSelectPassedDay={true}
            wrapperClassname="bg-white"
            // color="blue"
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
            canSelectDay={true}
            showNavigateToPrevMonthBtn={true}
            showNavigateToNextMonthBtn={true}
            onlyShowCalendarDateNumber={true}
            noCoOperation={false}
            selectedRanges={selectedRanges}
            setSelectedRanges={setSelectedRanges}
            // selectedIndividualDays={selectedIndividualDays}
            // setSelectedIndividualDays={setSelectedIndividualDays}
            checkForAlreadyReservedDatesOrFilledDatesValidity={true}
            canSelectMonth={true}
            canOnlySelectOneRange
          />
          <div className="flex items-center justify-between mt-16">
            <div className="flex items-center gap-x-8">
              <Button
                rounded
                color="grey"
                onClick={() => resetAllSelectedDays()}
                className="!px-10"
              >
                انصراف
              </Button>
              <Button
                onClick={() => {
                  setShowCalendarModal(false);
                }}
                rounded
                color="primary"
              >
                تایید تاریخ
              </Button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </>
  );
}

export default NowruzPricingAll;
