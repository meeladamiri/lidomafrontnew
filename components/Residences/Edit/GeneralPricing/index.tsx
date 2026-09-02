import {
  editResidenceGeneralPricing,
  IEditResidenceGeneralPricing,
} from "@/api/Residences/editResidenceGeneralPricing";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCalendarData, IServerCalendarData } from "api/Calendar/Calendar";
import { Button } from "components/General/core/Button";
import ModalHeader from "components/General/core/ModalHeader";
import { TextField } from "components/General/core/TextField";
import Divider from "components/General/Divider";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { defaultError, EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { VALIDATION_MESSAGES } from "constants/enums/validation_messages";
import { useFormik } from "formik";
import { IResidenceGeneralPricingInitV } from "interfaces/Residences/Submit/Steps/Step_11";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import exception from "utilities/exception";
import * as Yup from "yup";

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
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  weekEndPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  peakDaysPrice: Yup.number()
    .typeError(VALIDATION_MESSAGES.REQUIRED)
    .required(VALIDATION_MESSAGES.REQUIRED),
  extraGuestPrice: Yup.number().nullable(),
  weeklyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
  monthlyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
};

/**
 * «نرخ گذاری کلی».
 *
 * Used two ways. On its own route it reads the listing from the URL and
 * navigates away when it is done. Given `residenceId` and `onSaved` it is a
 * dialog over the calendar instead — same form, same request, but the host
 * stays on the calendar and sees the new rates land on it, rather than being
 * sent to another page and having to find their way back.
 */
function EditResidenceGeneralPricing({
  residenceId,
  residenceType,
  onSaved,
}: {
  residenceId?: number;
  residenceType?: ResidenceTypes_enum;
  onSaved?: () => void;
}) {
  const router = useRouter();
  /** In a dialog the caller says which listing; on the route, the URL does. */
  const asDialog = residenceId !== undefined;
  const targetId = residenceId ?? Number(router?.query?.id);
  const targetType = (residenceType ??
    (router?.query?.residenceType as ResidenceTypes_enum)) as ResidenceTypes_enum;

  const [residenceGeneralPricingV, setResidenceGeneralPricingV] =
    useState<IResidenceGeneralPricingInitV>(residenceGeneralPricingInitV);

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
          refetch();

          exception.message([
            { type: EXCEPTIONTYPES.SUCCESS, title: "تغییرات با موفقیت اعمال شد" },
          ]);

          if (onSaved) {
            onSaved();
          } else if (router?.query?.fromCalendarPage === "true") {
            router.push(
              `/residences/calendar?residenceId=${router?.query?.id}&residenceType=${router?.query?.residenceType}`
            );
          } else {
            router.push(`/residences/list`);
          }
          // setProductId(resp?.params?.product_id);
          // router.push(`?step=${12}&productId=${resp?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const residenceGeneralPricingFormik = useFormik({
    initialValues: residenceGeneralPricingV,
    validationSchema: Yup.object(residenceGeneralPricingYupSchema),
    onSubmit: (values) => {
      editResidenceGeneralPricingMutation.mutate({
        product_type: targetType,
        product_id: targetId,
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

  const {
    isSuccess: calendarDataSuccess,
    isLoading: calendarDataIsLoading,
    data,
    refetch,
  } = useQuery(
    ["getCalendarData", targetId],
    () => {
      return getCalendarData({
        residenceId: targetId,
        residenceType: targetType,
      });
    },
    {
      enabled: !!targetId,
    }
  );

  useEffect(() => {
    if (!!data) {
      const serverCalendarData: IServerCalendarData = data?.params;

      // console.log("setting", serverCalendarData?.prices.monthly_discount);
      setResidenceGeneralPricingV({
        basePrice: serverCalendarData?.prices.week_price || null,
        weekEndPrice: serverCalendarData?.prices.weekend_price || null,
        peakDaysPrice: serverCalendarData?.prices.peak_price || null,
        extraGuestPrice: serverCalendarData?.prices.extra_guests_price || null,
        weeklyReserveDiscount: serverCalendarData?.prices.weekly_discount || null,
        monthlyReserveDiscount: serverCalendarData?.prices.monthly_discount || null,
      });
    }
  }, [data]);

  return (
    <div className={asDialog ? "relative" : "relative pt-80 md:pt-0"}>
      {!asDialog && (
        <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
          <ModalHeader headerTitle={"نرخ گذاری کلی"} onBackClick={() => router.back()} />
        </div>
      )}

      <div className="">
        {calendarDataIsLoading ? (
          <TinyLoader />
        ) : (
          <>
            {/* TODO: change pb-* when we have helpButton too */}
            <div className="pb-[88px] md:pb-0">
              <div className="grid grid-cols-12 md:gap-x-16 gap-y-16">
                <div className="col-span-full md:col-span-6">
                  <TextField
                    name="basePrice"
                    inputmode="numeric"
                    formik={residenceGeneralPricingFormik}
                    label="قیمت پایه"
                    label2="( شنبه ، یکشنبه، دوشنبه و سه شنبه )"
                    leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
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
                    leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
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
                    leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                    wordifyNumbers={true}
                  />
                </div>

                <div className="col-span-full md:hidden">
                  <Divider />
                </div>

                <div className="col-span-full md:col-span-6">
                  <TextField
                    name="extraGuestPrice"
                    inputmode="numeric"
                    formik={residenceGeneralPricingFormik}
                    label="نرخ هر نفر اضافه"
                    leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
                    wordifyNumbers={true}
                  />
                </div>

                <div className="col-span-full md:hidden">
                  <Divider />
                </div>

                <div className="col-span-full md:col-span-6">
                  <TextField
                    name="weeklyReserveDiscount"
                    inputmode="numeric"
                    formik={residenceGeneralPricingFormik}
                    label="تخفیف رزرو هفتگی"
                    leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
                    wordifyNumbers={false}
                  />
                </div>

                <div className="col-span-full md:col-span-6">
                  <TextField
                    name="monthlyReserveDiscount"
                    inputmode="numeric"
                    formik={residenceGeneralPricingFormik}
                    label="تخفیف رزرو ماهانه"
                    leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
                    wordifyNumbers={false}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[240px] md:mx-auto">
              <Button
                isFullWidth
                //   onClick={() => resetAllSelectedDays()}
                className="!px-10"
                onClick={() => residenceGeneralPricingFormik.handleSubmit()}
              >
                ذخیره
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default EditResidenceGeneralPricing;
