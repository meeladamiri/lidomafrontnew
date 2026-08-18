import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";
// import { ResidenceAmenity } from "@/interfaces/Residences/Submit";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useEffect, useState } from "react";
import CancelRuleItem from "../../../CancelRule/CancelRuleItem";
import EditableCancelRuleItem from "../../../CancelRule/EditableCancelRuleItem";
import StepTitle from "../../StepTitle";
import { useRouter } from "next/router";
import { ICustomPolicyInitialValues } from "@/interfaces/Residences/Submit/Steps/Step_13";
import {
  customPolicyFormikInitialValues,
  customPolicyYupSchema,
} from "@/constants/Residences/Submit/Steps/Step_13";
import { useFormik } from "formik";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import * as Yup from "yup";
import { submitStep } from "@/api/SubmitResidence";
import { Button } from "@/components/General/core/Button";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { getResidenceSubmittedData } from "@/api/Residences/getResidenceSubmittedData";

const reserveCommission = 10;
const cancelCommission = 10;

function Step13() {
  const [customPolicyInitialValues, setCustomPolicyInitialValues] =
    useState<ICustomPolicyInitialValues>(customPolicyFormikInitialValues);
  const [selectedCancelPolicy, setSelectedCancelPolicy] = useState<CancellationPolicy_enum>();
  const router = useRouter();
  // Possible to be dynamic in the future. That's why i used state for it.
  // const [easyGoingValues, setEasyGoingValues] = useState({
  //   fullReturnTime: 72,
  //   beforeStartTime: 24,
  //   hostShareTotalAmount: 20,
  //   hostSharePastNights: 100,
  //   hostShareFutureNights: 10,
  // });
  // const [balancedValues, setBalancedValues] = useState({
  //   fullReturnTime: 72,
  //   beforeStartTime: 24,
  //   hostShareTotalAmount: 20,
  //   hostSharePastNights: 100,
  //   hostShareFutureNights: 10,
  // });
  // const [strictValues, setStrictValues] = useState({
  //   fullReturnTime: 72,
  //   beforeStartTime: 24,
  //   hostShareTotalAmount: 20,
  //   hostSharePastNights: 100,
  //   hostShareFutureNights: 10,
  // });

  const [customValues, setCustomValues] = useState({
    fullReturnTime: null,
    beforeStartTime: null,
    hostShareTotalAmount: null,
    hostSharePastNights: null,
    hostShareFutureNights: null,
  });

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useQuery(["getResidenceSubmittedData", router?.query?.step], () => {
    return getResidenceSubmittedData({
      step: Number(router?.query?.step as string),
      productId: Number(router?.query?.productId as string),
    });
  });

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const resInfo = residenceSubmittedData?.params?.residence_info;
        if (resInfo?.rules?.length !== 0) {
          setSelectedCancelPolicy(resInfo?.rules[0].value);
        }

        if (
          resInfo?.before_start_time ||
          resInfo?.full_return_time ||
          resInfo?.host_share_future_nights ||
          resInfo?.host_share_past_nights ||
          resInfo?.host_share_total_amount
        ) {
          setCustomPolicyInitialValues({
            "before-start-time": resInfo?.before_start_time || null,
            "full-return-time": resInfo?.full_return_time || null,
            "host-share-future-nights": resInfo?.host_share_future_nights,
            "host-share-past-nights": resInfo?.host_share_past_nights,
            "host-share-total-amount": resInfo?.host_share_total_amount,
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  // const { isLoading: getAmenitiesIsLoading, data: amenitiesData } = useQuery(["getAmenities"], () =>
  //   getAmenities()
  // );

  // useEffect(() => {
  //   if (!!amenitiesData) {
  //     if (amenitiesData?.status === "success") {
  //       const allAmenities: ResidenceAmenity[] = amenitiesData?.params?.amenities;

  //       console.log("allAmenities", allAmenities);
  //       const residenceCancelRules = allAmenities?.filter(
  //         (el) => el.category === "مقررات لغو رزرو" && el.name === "مقررات لغو رزرو"
  //       );
  //       console.log("residenceCancelRules", residenceCancelRules);
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [amenitiesData]);

  const submitStep13Mutation = useMutation(
    ({
      productId,
      cancellation_policy,
      full_return_time,
      before_start_time,
      host_share_total_amount,
      host_share_past_nights,
      host_share_future_nights,
    }: {
      productId: number;
      cancellation_policy: CancellationPolicy_enum | "custom";
      full_return_time?: number;
      before_start_time?: number;
      host_share_total_amount?: number;
      host_share_past_nights?: number;
      host_share_future_nights?: number;
    }) => {
      return submitStep({
        step: 13,
        productId,
        data: {
          cancellation_policy,
          full_return_time,
          before_start_time,
          host_share_total_amount,
          host_share_past_nights,
          host_share_future_nights,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${14}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  const customPolicyFormik = useFormik({
    initialValues: customPolicyInitialValues,
    onSubmit: (values) => {
      if ((values["before-start-time"] as number) >= (values["full-return-time"] as number)) {
        const errMsg = "مقدار فیلد دوم، حتما باید کمتر از فیلد اول باشد.";

        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: errMsg }]);

        customPolicyFormik.setFieldError("before-start-time", errMsg);
        customPolicyFormik.setFieldError("full-return-time", errMsg);
        return;
      }

      submitStep13Mutation.mutate({
        productId: Number(router?.query?.productId as string),
        cancellation_policy: "custom",
        full_return_time: values["full-return-time"] as number,
        before_start_time: values["before-start-time"] as number,
        host_share_total_amount: values["host-share-total-amount"] as number,
        host_share_past_nights: values["host-share-past-nights"] as number,
        host_share_future_nights: values["host-share-future-nights"] as number,
      });
    },
    validationSchema: Yup.object(customPolicyYupSchema),
    enableReinitialize: true,
  });

  function onSubmitClick() {
    if (selectedCancelPolicy === CancellationPolicy_enum.CUSTOM) {
      customPolicyFormik.handleSubmit();
    } else {
      submitStep13Mutation.mutate({
        productId: Number(router?.query?.productId as string),
        cancellation_policy: selectedCancelPolicy as CancellationPolicy_enum,
      });
    }
  }

  return getResidenceSubmittedDataIsLaoding ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <p className="text-16 md:text-14 leading-28 md:leading-20 text-black font-m md:font-r mb-24">
          یکی از حالت های زیر را برای قوانین لغو رزرو انتخاب کنید
        </p>

        <div>
          <div className="mb-16">
            <CancelRuleItem
              mainTitle={CancellationPolicy_enum.EASYGOING}
              //
              // fullReturnTime={easyGoingValues.fullReturnTime}
              // beforeStartTime={easyGoingValues.beforeStartTime}
              // hostShareTotalAmount={easyGoingValues.hostShareTotalAmount}
              // hostSharePastNights={easyGoingValues.hostSharePastNights}
              // hostShareFutureNights={easyGoingValues.hostShareFutureNights}
              firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
              firstDesc={`پرداخت کامل وجه با کسر کارمزد سایت`}
              secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
              secondDesc={`سهم میزبان : کسر مبلغ شب اول`}
              thirdTitle={`از روز ورود تا خروج مهمان`}
              thirdDesc={`سهم میزبان : 100% مبلغ شب های سپری شده + %10 مبلغ شب های باقیمانده`}
              //
              reserveCommission={reserveCommission}
              cancelCommission={cancelCommission}
              isSelected={selectedCancelPolicy === CancellationPolicy_enum.EASYGOING}
              onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.EASYGOING)}
            />
          </div>

          <div className="mb-16">
            <CancelRuleItem
              mainTitle={CancellationPolicy_enum.BALANCED}
              //
              // fullReturnTime={balancedValues.fullReturnTime}
              // beforeStartTime={balancedValues.beforeStartTime}
              // hostShareTotalAmount={balancedValues.hostShareTotalAmount}
              // hostSharePastNights={balancedValues.hostSharePastNights}
              // hostShareFutureNights={balancedValues.hostShareFutureNights}
              firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
              firstDesc={`سهم میزبان : %10 کل مبلغ رزرو`}
              secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
              secondDesc={`سهم میزبان : کسر مبلغ شب اول + %10 شب های باقی مانده`}
              thirdTitle={`از روز ورود تا خروج مهمان`}
              thirdDesc={`سهم میزبان : 100% مبلغ شب های سپری شده + %20 مبلغ شب های باقیمانده`}
              //
              reserveCommission={reserveCommission}
              cancelCommission={cancelCommission}
              isSelected={selectedCancelPolicy === CancellationPolicy_enum.BALANCED}
              onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.BALANCED)}
            />
          </div>

          <div className="mb-16">
            <CancelRuleItem
              mainTitle={CancellationPolicy_enum.STRICT}
              //
              // fullReturnTime={strictValues.fullReturnTime}
              // beforeStartTime={strictValues.beforeStartTime}
              // hostShareTotalAmount={strictValues.hostShareTotalAmount}
              // hostSharePastNights={strictValues.hostSharePastNights}
              // hostShareFutureNights={strictValues.hostShareFutureNights}
              firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
              firstDesc={`سهم میزبان : %20 کل مبلغ رزرو`}
              secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
              secondDesc={`سهم میزبان : کسر مبلغ دو شب اول + %20 شب های باقی مانده`}
              thirdTitle={`از روز ورود تا خروج مهمان`}
              thirdDesc={`هیچ مبلغی به مسافر عودت داده نخواهد شد`}
              //
              reserveCommission={reserveCommission}
              cancelCommission={cancelCommission}
              isSelected={selectedCancelPolicy === CancellationPolicy_enum.STRICT}
              onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.STRICT)}
            />
          </div>

          <EditableCancelRuleItem
            mainTitle={CancellationPolicy_enum.CUSTOM}
            //
            fullReturnTime={customValues.fullReturnTime}
            beforeStartTime={customValues.beforeStartTime}
            hostShareTotalAmount={customValues.hostShareTotalAmount}
            hostSharePastNights={customValues.hostSharePastNights}
            hostShareFutureNights={customValues.hostShareFutureNights}
            //
            reserveCommission={reserveCommission}
            cancelCommission={cancelCommission}
            isSelected={selectedCancelPolicy === CancellationPolicy_enum.CUSTOM}
            onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.CUSTOM)}
            formik={customPolicyFormik}
          />
        </div>
      </div>

      <BottomActionsWrapper
        onClickOfSubmitStep={() => onSubmitClick()}
        isSubmitBtnDisabled={!selectedCancelPolicy}
      >
        <Button
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          isFullWidth
          onClick={onSubmitClick}
          disabled={!selectedCancelPolicy}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step13;
