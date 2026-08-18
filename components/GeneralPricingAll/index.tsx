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
import Divider from "../General/Divider";
import { useFormik } from "formik";
import { IResidenceGeneralPricingInitV } from "@/interfaces/Residences/Submit/Steps/Step_11";
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
import {
  IEditResidenceGeneralPricing,
  editResidenceGeneralPricing,
} from "@/api/Residences/editResidenceGeneralPricing";

const residenceGeneralPricingInitV: IResidenceGeneralPricingInitV = {
  basePrice: null,
  weekEndPrice: null,
  peakDaysPrice: null,
  extraGuestPrice: null,
  weeklyReserveDiscount: null,
  monthlyReserveDiscount: null,
};

const residenceGeneralPricingYupSchema = {
  basePrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  weekEndPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  peakDaysPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .required(VALIDATION_MESSAGES.REQUIRED),
  extraGuestPrice: Yup.number().typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS).nullable(),
  weeklyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .nullable(),
  monthlyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .typeError(VALIDATION_MESSAGES.ONLY_NUMBER_CHARS)
    .nullable(),
};

function GeneralPricingAll() {
  const [elligibleResidencesToEditGeneralPricing, setElligibleResidencesToEditGeneralPricing] =
    useState<(IServerRoom | IServerResidence)[]>();
  const router = useRouter();

  const [residenceGeneralPricingV, setResidenceGeneralPricingV] =
    useState<IResidenceGeneralPricingInitV>(residenceGeneralPricingInitV);

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
        setElligibleResidencesToEditGeneralPricing([...activeReses, ...allRooms]);
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
    ["getCalendarData", elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]?.id],
    () => {
      return getCalendarData({
        residenceId: elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]?.id as number,
        residenceType:
          elligibleResidencesToEditGeneralPricing &&
          "parent_id" in elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]
            ? ResidenceTypes_enum.ROOM
            : ResidenceTypes_enum.PRODUCT,
      });
    },
    {
      enabled: !!elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]?.id,
    }
  );

  useEffect(() => {
    if (!!calendarData) {
      if (calendarData?.status === "success") {
        const serverCalendarData: IServerCalendarData = calendarData?.params;

        setResidenceGeneralPricingV({
          basePrice: serverCalendarData?.prices.week_price || 0,
          weekEndPrice: serverCalendarData?.prices.weekend_price || 0,
          peakDaysPrice: serverCalendarData?.prices.peak_price || 0,
          extraGuestPrice: serverCalendarData?.prices.extra_guests_price || 0,
          weeklyReserveDiscount: serverCalendarData?.prices.weekly_discount || 0,
          monthlyReserveDiscount: serverCalendarData?.prices.monthly_discount || 0,
        });
      } else {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: calendarData?.err_msg || defaultError },
        ]);
      }
    }
  }, [calendarData]);

  const residenceGeneralPricingFormik = useFormik({
    initialValues: residenceGeneralPricingV,
    validationSchema: Yup.object(residenceGeneralPricingYupSchema),
    onSubmit: (values) => {
      editResidenceGeneralPricingMutation.mutate({
        product_type:
          elligibleResidencesToEditGeneralPricing &&
          "parent_id" in elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]
            ? ResidenceTypes_enum.ROOM
            : ResidenceTypes_enum.PRODUCT,
        product_id: elligibleResidencesToEditGeneralPricing?.[currentResBeingEdited]?.id as number,
        week_price: values.basePrice || 0,
        weekend_price: values.weekEndPrice || 0,
        peak_price: values.peakDaysPrice || 0,
        extra_price: values.extraGuestPrice || 0,
        weekly_discount: values.weeklyReserveDiscount || 0,
        monthly_discount: values.monthlyReserveDiscount || 0,
      });
    },
    enableReinitialize: true,
  });

  const editResidenceGeneralPricingMutation = useMutation(
    ({
      product_type,
      product_id,
      week_price,
      weekend_price,
      peak_price,
      extra_price,
      weekly_discount,
      monthly_discount,
    }: IEditResidenceGeneralPricing) => {
      return editResidenceGeneralPricing({
        product_type,
        product_id,
        week_price,
        weekend_price,
        peak_price,
        extra_price,
        weekly_discount,
        monthly_discount,
      });
    },
    {
      onSuccess: (resp) => {
        if (resp?.status === "success") {
          calendarDataRefetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);

          if (currentResBeingEdited < elligibleResidencesToEditGeneralPricing!.length - 1) {
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
    <div className="relative">
      <div className="fixed top-0 right-0 left-0 z-[6] md:hidden">
        <ModalHeader headerTitle="نرخ گذاری کلی اقامتگاه ها" onBackClick={() => router.back()} />
      </div>

      <div className="pt-80 md:pt-0">
        {!elligibleResidencesToEditGeneralPricing ? (
          <TinyLoader />
        ) : (
          <>
            <div className="pb-[88px] md:pb-0">
              <PageTitle
                title="نرخ گذاری کلی اقامتگاه ها"
                // icon={undefined}
                containerClassname="mb-24 hidden md:flex"
              />

              <div className="mb-16">
                <div className="w-full h-[214px] p-12 relative rounded-10">
                  <Image
                    src={elligibleResidencesToEditGeneralPricing[currentResBeingEdited].image_url}
                    fill
                    style={{
                      objectFit: "cover",
                    }}
                    alt="" // TODO
                    className="rounded-10"
                    placeholder="blur"
                    blurDataURL={
                      elligibleResidencesToEditGeneralPricing[currentResBeingEdited].image_url
                    }
                  />

                  <div className="flex flex-col justify-between h-full">
                    <div className="z-3 flex justify-end">
                      <Link
                        passHref
                        prefetch={false}
                        href={getPropertyPageUrl({
                          residenceId:
                            elligibleResidencesToEditGeneralPricing[currentResBeingEdited].id,
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
                            {elligibleResidencesToEditGeneralPricing[currentResBeingEdited].name}
                          </p>
                          {elligibleResidencesToEditGeneralPricing[currentResBeingEdited]
                            .last_update_time && (
                            <p className="text-12 leading-21 font-l text-[rgba(255,255,255,0.65)] OnlyOneLineAndEndWithElipsis">
                              آخرین بروزرسانی :{" "}
                              {miladiToJalali(
                                elligibleResidencesToEditGeneralPricing[currentResBeingEdited]
                                  .last_update_time
                              )}
                            </p>
                          )}
                        </div>

                        {!!elligibleResidencesToEditGeneralPricing[currentResBeingEdited]
                          .reference && (
                          <div className="shrink-0 flex justify-end">
                            <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                              کد اقامتگاه :{" "}
                              {
                                elligibleResidencesToEditGeneralPricing[currentResBeingEdited]
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

              {calendarDataIsLoading ? (
                <div className="md:py-24">
                  <TinyLoader />
                </div>
              ) : (
                <div className="">
                  <div className="grid grid-cols-12 md:gap-x-16 gap-y-16">
                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="basePrice"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="قیمت پایه"
                        label2="( شنبه ، یکشنبه، دوشنبه و سه شنبه )"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">تومان</span>
                        }
                        wordifyNumbers={true}
                      />
                    </div>

                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="weekEndPrice"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="قیمت آخر هفته"
                        label2="( چهارشنبه، پنجشنبه و جمعه )"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">تومان</span>
                        }
                        wordifyNumbers={true}
                      />
                    </div>

                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="peakDaysPrice"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="قیمت ایام پیک"
                        label2="( تعطیلات خاص )"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">تومان</span>
                        }
                        wordifyNumbers={true}
                      />
                    </div>

                    <Divider className="col-span-full md:hidden" />

                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="extraGuestPrice"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="نرخ هر نفر اضافه"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">تومان</span>
                        }
                        wordifyNumbers={true}
                      />
                    </div>

                    <Divider className="col-span-full md:hidden" />

                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="weeklyReserveDiscount"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="تخفیف رزرو هفتگی"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">درصد</span>
                        }
                        wordifyNumbers={false}
                      />
                    </div>

                    <div className="col-span-full md:col-span-6">
                      <TextField
                        name="monthlyReserveDiscount"
                        inputmode="numeric"
                        formik={residenceGeneralPricingFormik}
                        label="تخفیف رزرو ماهانه"
                        leftIcon={
                          <span className="text-12 leading-21 text-black font-l">درصد</span>
                        }
                        wordifyNumbers={false}
                      />
                    </div>
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
                className={`!pl-16 !pr-8 ${currentResBeingEdited === 0 ? "hidden" : "col-span-1"}`}
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
                {currentResBeingEdited < elligibleResidencesToEditGeneralPricing.length - 1
                  ? "ذخیره و بعدی"
                  : "ذخیره و پایان"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GeneralPricingAll;
