import { useMutation } from "@tanstack/react-query";
import { TextField } from "components/General/core/TextField";
import Divider from "components/General/Divider";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IResidenceGeneralPricingInitV } from "interfaces/Residences/Submit/Steps/Step_11";
import { IGeneralPricing } from "interfaces/Residences/Submit";
import { useEffect, useState } from "react";
import StepTitle from "../../StepTitle";
import { useFormik } from "formik";
import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/constants/enums/validation_messages";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { useRouter } from "next/router";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { Button } from "@/components/General/core/Button";
import { useResidenceDraft } from "../../useWizard";

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

const residenceGeneralPricingInitV: IResidenceGeneralPricingInitV = {
  basePrice: null,
  weekEndPrice: null,
  peakDaysPrice: null,
  extraGuestPrice: null,
  weeklyReserveDiscount: null,
  monthlyReserveDiscount: null,
};

function Step11() {
  const router = useRouter();
  const [residenceGeneralPricingV, setResidenceGeneralPricingV] =
    useState<IResidenceGeneralPricingInitV>(residenceGeneralPricingInitV);

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        if (!!residenceSubmittedData?.params?.residence_info) {
          const residenceGeneralPricingComingFromAPI: IGeneralPricing =
            residenceSubmittedData?.params?.residence_info;

          setResidenceGeneralPricingV({
            basePrice: residenceGeneralPricingComingFromAPI.week_price || null,
            extraGuestPrice: residenceGeneralPricingComingFromAPI.extra_price || null,
            monthlyReserveDiscount: residenceGeneralPricingComingFromAPI.monthly_discount || null,
            peakDaysPrice: residenceGeneralPricingComingFromAPI.peak_price || null,
            weekEndPrice: residenceGeneralPricingComingFromAPI.weekend_price || null,
            weeklyReserveDiscount: residenceGeneralPricingComingFromAPI.weekly_discount || null,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const submitStep11Mutation = useMutation(
    ({
      week_price,
      weekend_price,
      peak_price,
      extra_price,
      weekly_discount,
      monthly_discount,
      productId,
    }: {
      productId: number;
      week_price: IGeneralPricing["week_price"];
      weekend_price: IGeneralPricing["weekend_price"];
      peak_price: IGeneralPricing["peak_price"];
      extra_price: IGeneralPricing["extra_price"];
      weekly_discount: IGeneralPricing["weekly_discount"];
      monthly_discount: IGeneralPricing["monthly_discount"];
    }) => {
      return submitStep({
        step: 11,
        productId,
        data: {
          week_price,
          weekend_price,
          peak_price,
          extra_price,
          weekly_discount,
          monthly_discount,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${12}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const residenceGeneralPricingFormik = useFormik({
    initialValues: residenceGeneralPricingV,
    validationSchema: Yup.object(residenceGeneralPricingYupSchema),
    onSubmit: (values) => {
      submitStep11Mutation.mutate({
        productId: Number(router?.query?.productId as string),
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

  function onSubmitClick() {
    residenceGeneralPricingFormik.handleSubmit();
  }

  return getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <form onSubmit={residenceGeneralPricingFormik.handleSubmit}>
          <div className="mb-16">
            <div className="mb-16">
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

            <div className="mb-16">
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

          <Divider />

          <div className="my-16">
            <TextField
              name="extraGuestPrice"
              inputmode="numeric"
              formik={residenceGeneralPricingFormik}
              label="نرخ هر نفر اضافه"
              leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
              wordifyNumbers={true}
            />
          </div>

          <Divider />

          <div className="my-16">
            <TextField
              name="weeklyReserveDiscount"
              inputmode="numeric"
              formik={residenceGeneralPricingFormik}
              label="تخفیف رزرو هفتگی"
              leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
              wordifyNumbers={false}
            />
          </div>

          <TextField
            name="monthlyReserveDiscount"
            inputmode="numeric"
            formik={residenceGeneralPricingFormik}
            label="تخفیف رزرو ماهانه"
            leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
            wordifyNumbers={false}
          />
        </form>
      </div>

      <BottomActionsWrapper isSaving={submitStep11Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
        <Button
          isLoading={submitStep11Mutation.isLoading}
          loadingText="در حال ذخیره…"
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          isFullWidth
          onClick={onSubmitClick}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step11;
