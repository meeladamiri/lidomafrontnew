import {
  editResidenceGeneralPricing,
  IEditResidenceGeneralPricing,
} from "@/api/Residences/editResidenceGeneralPricing";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getCalendarData, IServerCalendarData } from "api/Calendar/Calendar";
import { Button } from "components/General/core/Button";
import ModalHeader from "components/General/core/ModalHeader";
import { TextField } from "components/General/core/TextField";
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

/**
 * The peak extra-guest rate has a column and an endpoint but never had a box.
 *
 * Kept local rather than widened into the shared interface, which three other
 * pricing screens build objects of — none of them collects this field, and
 * making it required there would have been a compile error standing in for a
 * decision nobody asked for.
 */
type PricingValues = IResidenceGeneralPricingInitV & {
  extraGuestPeakPrice: number | null;
};

const residenceGeneralPricingInitV: PricingValues = {
  basePrice: null,
  weekEndPrice: null,
  peakDaysPrice: null,
  extraGuestPrice: null,
  extraGuestPeakPrice: null,
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
  extraGuestPeakPrice: Yup.number().nullable(),
  weeklyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
  monthlyReserveDiscount: Yup.number()
    .min(0, "میزان تخفیف حداقل باید 0 باشد.")
    .max(99, "میزان تخفیف را به درصد وارد کنید. ( حداکثر 99 درصد )")
    .nullable(),
};

/** An empty box and a zero are the same rate; both are "no change" from null. */
const asNumber = (value: unknown) => Number(value) || 0;

function isPristine(a: PricingValues, b: PricingValues) {
  return (Object.keys(residenceGeneralPricingInitV) as (keyof PricingValues)[]).every(
    (key) => asNumber(a[key]) === asNumber(b[key])
  );
}

/**
 * «نرخ گذاری کلی».
 *
 * Used two ways. On its own route it reads the listing from the URL and
 * navigates away when it is done. Given `residenceId` and `onSaved` it is a
 * panel over the calendar instead — same form, same request, but the host
 * stays on the calendar and sees the new rates land on it, rather than being
 * sent to another page and having to find their way back.
 *
 * Both share one shape, and it is the shape every other full-screen editor in
 * the app already uses: a `ModalHeader` with the title and a back control, the
 * form scrolling under it, and the actions pinned to the bottom. It used to be
 * a bottom sheet when opened from the calendar — a container with no scroll
 * and no height limit, which for a seven-field form meant the last fields and
 * the save button sat below the fold with no way to reach them.
 */
function EditResidenceGeneralPricing({
  residenceId,
  residenceType,
  onSaved,
  onCancel,
}: {
  residenceId?: number;
  residenceType?: ResidenceTypes_enum;
  onSaved?: () => void;
  /** Present when the caller owns the container and wants it closed. */
  onCancel?: () => void;
}) {
  const router = useRouter();
  /** In a panel the caller says which listing; on the route, the URL does. */
  const asDialog = residenceId !== undefined;
  const targetId = residenceId ?? Number(router?.query?.id);
  const targetType = (residenceType ??
    (router?.query?.residenceType as ResidenceTypes_enum)) as ResidenceTypes_enum;

  const [residenceGeneralPricingV, setResidenceGeneralPricingV] =
    useState<PricingValues>(residenceGeneralPricingInitV);

  const editResidenceGeneralPricingMutation = useMutation(
    (payload: IEditResidenceGeneralPricing) => editResidenceGeneralPricing(payload),
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
        extra_peak_price: values.extraGuestPeakPrice || 0,
        weekly_discount: values.weeklyReserveDiscount || 0,
        monthly_discount: values.monthlyReserveDiscount || 0,
      });
    },
    enableReinitialize: true,
  });

  const {
    isLoading: calendarDataIsLoading,
    data,
    refetch,
  } = useQuery(
    ["getCalendarData", targetId],
    () => {
      return getCalendarData({
        residenceId: targetId,
        residenceType: targetType,
        scope: "host",
      });
    },
    {
      enabled: !!targetId,
    }
  );

  useEffect(() => {
    if (!!data) {
      const serverCalendarData: IServerCalendarData = data?.params;

      setResidenceGeneralPricingV({
        basePrice: serverCalendarData?.prices.week_price || null,
        weekEndPrice: serverCalendarData?.prices.weekend_price || null,
        peakDaysPrice: serverCalendarData?.prices.peak_price || null,
        extraGuestPrice: serverCalendarData?.prices.extra_guests_price || null,
        extraGuestPeakPrice: serverCalendarData?.prices.extra_guests_peak_price || null,
        weeklyReserveDiscount: serverCalendarData?.prices.weekly_discount || null,
        monthlyReserveDiscount: serverCalendarData?.prices.monthly_discount || null,
      });
    }
  }, [data]);

  const saving = editResidenceGeneralPricingMutation.isLoading;
  /**
   * Nothing typed yet, so nothing to save.
   *
   * Measured against the values the server sent, not against Formik's own
   * `dirty`: `enableReinitialize` resets that on every refetch, and a host who
   * types a rate and then triggers any background refresh would watch the
   * button go grey with their change still on screen.
   */
  const pristine = isPristine(residenceGeneralPricingFormik.values, residenceGeneralPricingV);

  function close() {
    if (onCancel) onCancel();
    else router.back();
  }

  const money = (name: keyof PricingValues, label: string, label2?: string) => (
    <TextField
      name={name}
      inputmode="numeric"
      formik={residenceGeneralPricingFormik}
      label={label}
      label2={label2}
      leftIcon={<span className="text-12 leading-21 text-black font-l">تومان</span>}
      wordifyNumbers={true}
    />
  );

  const percent = (name: keyof PricingValues, label: string) => (
    <TextField
      name={name}
      inputmode="numeric"
      formik={residenceGeneralPricingFormik}
      label={label}
      leftIcon={<span className="text-12 leading-21 text-black font-l">درصد</span>}
      wordifyNumbers={false}
    />
  );

  const form = (
    <div className="grid grid-cols-12 md:gap-x-16 gap-y-16">
      <div className="col-span-full md:col-span-6">
        {money("basePrice", "قیمت پایه", "( شنبه ، یکشنبه، دوشنبه و سه شنبه )")}
      </div>
      <div className="col-span-full md:col-span-6">
        {money("weekEndPrice", "قیمت آخر هفته", "( چهارشنبه، پنجشنبه و جمعه )")}
      </div>
      <div className="col-span-full md:col-span-6">
        {money("peakDaysPrice", "قیمت ایام پیک", "( تعطیلات خاص )")}
      </div>

      <div className="col-span-full">
        <p className="text-14 leading-24 text-black font-m pt-8">نفر اضافه</p>
      </div>
      <div className="col-span-full md:col-span-6">
        {money("extraGuestPrice", "نرخ هر نفر اضافه")}
      </div>
      <div className="col-span-full md:col-span-6">
        {money("extraGuestPeakPrice", "نرخ هر نفر اضافه", "( ایام پیک )")}
      </div>

      <div className="col-span-full">
        <p className="text-14 leading-24 text-black font-m pt-8">تخفیف اقامت طولانی</p>
      </div>
      <div className="col-span-full md:col-span-6">
        {percent("weeklyReserveDiscount", "تخفیف رزرو هفتگی")}
      </div>
      <div className="col-span-full md:col-span-6">
        {percent("monthlyReserveDiscount", "تخفیف رزرو ماهانه")}
      </div>
    </div>
  );

  /**
   * Cancel first, save second.
   *
   * Save stays dimmed until a number actually differs from what the server
   * holds, so «ذخیره» never invites a request that would change nothing — and
   * a host who opened the screen to look rather than to edit is told, before
   * they press anything, that there is nothing to press.
   */
  const actions = (
    <div className="grid grid-cols-2 gap-x-12">
      <Button isFullWidth color="grey" className="!px-10" onClick={close} disabled={saving}>
        انصراف
      </Button>
      <Button
        isFullWidth
        className="!px-10"
        disabled={pristine || saving}
        isLoading={saving}
        loadingText="در حال ذخیره"
        onClick={() => residenceGeneralPricingFormik.handleSubmit()}
      >
        ذخیره
      </Button>
    </div>
  );

  // ------------------------------------------------------------- as a panel ---

  if (asDialog) {
    return (
      <div
        className="fixed inset-0 z-[70] flex md:items-center md:justify-center md:bg-[rgba(24,39,58,0.7)] md:p-16"
        onClick={close}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نرخ گذاری کلی"
          onClick={(event) => event.stopPropagation()}
          className="w-full h-full md:w-[560px] md:h-auto md:max-h-[86vh] md:rounded-16 bg-white flex flex-col overflow-hidden"
        >
          <ModalHeader
            headerTitle="نرخ گذاری کلی"
            onBackClick={close}
            containerClassname="shrink-0 border-b-1 border-solid border-b-gray-F2F2F7"
          />
          <div className="grow overflow-y-auto px-20 py-16">
            {calendarDataIsLoading ? <TinyLoader /> : form}
          </div>
          <div className="shrink-0 border-t-1 border-solid border-t-gray-F2F2F7 px-20 py-12 pb-[max(12px,env(safe-area-inset-bottom))]">
            {actions}
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- as a route ---

  return (
    <div className="relative pt-80 md:pt-0">
      <div className="fixed right-0 left-0 top-0 bg-white z-4 md:hidden">
        <ModalHeader headerTitle={"نرخ گذاری کلی"} onBackClick={close} />
      </div>

      {calendarDataIsLoading ? (
        <TinyLoader />
      ) : (
        <>
          <div className="pb-[88px] md:pb-0">{form}</div>

          <div className="bg-white py-16 md:py-0 px-20 md:px-0 fixed bottom-0 right-0 left-0 z-2 md:static md:mt-40 md:w-[320px] md:mx-auto">
            {actions}
          </div>
        </>
      )}
    </div>
  );
}
export default EditResidenceGeneralPricing;
