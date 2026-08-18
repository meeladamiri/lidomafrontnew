import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TextField } from "../General/core/TextField";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  IEditResidenceGeneralPricing,
  changeResidencesStatusGeneralPricing,
} from "@/api/ChangeResidencesStatus/changeResidencesStatusGeneralPricing";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { useRouter } from "next/router";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import ChangeResidencesStatusGeneralPricingModalActions from "./ChangeResidencesStatusGeneralPricingModalActions";
import { IChangeResidenceStatusGeneralPricingInitV } from "@/interfaces/ChangeResidencesStatus";
import { IServerCalendarData, getCalendarData } from "@/api/Calendar/Calendar";
import { isOnlyOneItemSelected } from "./isOnlyOneItemSelected";
import { TinyLoader } from "../General/Loader/TinyLoader";

// const HotelStars = dynamic(() => import("./HotelStars"), {
//   ssr: true,
// });

const changeResidencesStatusGeneralPricingInitV: IChangeResidenceStatusGeneralPricingInitV = {
  basePrice: null,
  weekEndPrice: null,
  peakDaysPrice: null,
  extraGuestPrice: null,
  weeklyReserveDiscount: null,
  monthlyReserveDiscount: null,
};

const changeResidencesStatusGeneralPricingYupSchema = {
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

function ChangeResidenceStatusGeneralPricingModal({
  showResidenceGeneralPricingModal,
  setShowResidenceGeneralPricingModal,
}: {
  showResidenceGeneralPricingModal: boolean;
  setShowResidenceGeneralPricingModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [changeResidencesStatusGeneralPricingV, setChangeResidencesStatusGeneralPricingV] =
    useState<IChangeResidenceStatusGeneralPricingInitV>(changeResidencesStatusGeneralPricingInitV);
  const router = useRouter();

  const changeResidencesStatusGeneralPricingMutation = useMutation(
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
      return changeResidencesStatusGeneralPricing({
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
         
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: resp?.err_msg || defaultError }]);
        }
      },
    }
  );

  const changeResidencesStatusGeneralPricingFormik = useFormik({
    initialValues: changeResidencesStatusGeneralPricingV,
    validationSchema: Yup.object(changeResidencesStatusGeneralPricingYupSchema),
    onSubmit: (values) => {
      changeResidencesStatusGeneralPricingMutation.mutate({
        product_type: router?.query?.residenceId
          ? ResidenceTypes_enum.PRODUCT
          : ResidenceTypes_enum.ROOM,
        product_id: Number(router?.query?.roomId) | Number(router?.query?.residenceId),
        week_price: Number(values.basePrice) || 0,
        weekend_price: Number(values.weekEndPrice) || 0,
        peak_price: Number(values.peakDaysPrice) || 0,
        extra_price: Number(values.extraGuestPrice) || 0,
        weekly_discount: Number(values.weeklyReserveDiscount) || 0,
        monthly_discount: Number(values.monthlyReserveDiscount) || 0,
      });
      setChangeResidencesStatusGeneralPricingV({
        basePrice: null,
        weekEndPrice: null,
        peakDaysPrice: null,
        extraGuestPrice: null,
        weeklyReserveDiscount: null,
        monthlyReserveDiscount: null,
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
    ["getCalendarData", router?.query?.roomId, router?.query?.residenceId],
    () => {
      return getCalendarData({
        residenceId: Number(router?.query?.roomId) || Number(router?.query?.residenceId),
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
    if (!!data) {
      const serverCalendarData: IServerCalendarData = data?.params;
      setChangeResidencesStatusGeneralPricingV({
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
    <ModalWrapper
      headerTitle="نرخ گذاری کلی"
      onClose={() => {
        setShowResidenceGeneralPricingModal(false);
      }}
      open={showResidenceGeneralPricingModal}
      bodyContainerClassname="md:!pb-0"
      modalClassname="md:!w-[720px]"
    >
      {calendarDataIsLoading ? (
        <TinyLoader />
      ) : (
        <div>
          <div className="mt-20">
            <TextField
              name="basePrice"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="قیمت پایه"
              labelInBorder
              isFullWidth
            />
          </div>
          <div className="mt-20">
            <TextField
              name="weekEndPrice"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="قیمت آخر هفته"
              labelInBorder
              isFullWidth
            />
          </div>
          <div className="mt-20">
            <TextField
              name="peakDaysPrice"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="قیمت ایام پیک"
              labelInBorder
              isFullWidth
            />
          </div>
          <div className="mt-20">
            <TextField
              name="extraGuestPrice"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="نرخ هر نفر اضافه"
              labelInBorder
              isFullWidth
            />
          </div>
          <div className="mt-20">
            <TextField
              name="weeklyReserveDiscount"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="تخفیف رزرو هفتگی(درصد)"
              labelInBorder
              isFullWidth
            />
          </div>
          <div className="mt-20 pb-[92px]">
            <TextField
              name="monthlyReserveDiscount"
              inputmode="numeric"
              formik={changeResidencesStatusGeneralPricingFormik}
              label="تخفیف رزرو ماهانه(درصد)"
              isFullWidth
              labelInBorder
            />
          </div>

          {/* ACTIONS */}
          <ChangeResidencesStatusGeneralPricingModalActions
            changeResidencesStatusGeneralPricingFormik={changeResidencesStatusGeneralPricingFormik}
            setShowResidenceGeneralPricingModal={setShowResidenceGeneralPricingModal}
          />
        </div>
      )}
    </ModalWrapper>
  );
}

export default ChangeResidenceStatusGeneralPricingModal;
