import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import { getRuleCatalog, saveRules } from "@/api/Residences/hostWizard";
import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";
import CancelRuleItem from "@/components/Residences/CancelRule/CancelRuleItem";
import EditableCancelRuleItem from "@/components/Residences/CancelRule/EditableCancelRuleItem";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import {
  CANCELLATION_POLICIES,
  CANCEL_COMMISSION,
  RESERVE_COMMISSION,
  policyByValue,
} from "../cancellation";
import {
  Callout,
  CheckCard,
  Counter,
  Field,
  Section,
  StepSkeleton,
  TextArea,
  TimeSelect,
  faDigits,
} from "../ui";

/**
 * Step nine: the house rules, the cancellation policy, and the agreement.
 *
 * The cancellation cards are the previous wizard's own components, not a
 * reimplementation — a host choosing between three policies is reading the
 * three-row breakdown of what each one costs them, and that breakdown is the
 * component. Rebuilding it would have meant two versions of the same promise
 * to keep in step.
 */

/** Round-the-clock reception, stored as a full-day window. */
const ALL_DAY_FROM = "00:00";
const ALL_DAY_TO = "23:00";

interface Values {
  ruleIds: number[];
  rulesDesc: string;
  checkinFrom: string;
  checkinTo: string;
  checkout: string;
  allDayCheckin: boolean;
  minReservableDays: number;
  cancellationPolicy: string;
  acceptedTerms: boolean;
}

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.allDayCheckin) {
    if (!values.checkinFrom) errors.checkinFrom = "ساعت شروع پذیرش را انتخاب کنید.";
    if (values.checkinFrom && values.checkinTo && values.checkinTo < values.checkinFrom) {
      errors.checkinTo = "پایان بازه‌ی پذیرش نمی‌تواند قبل از شروع آن باشد.";
    }
  }
  if (!values.checkout) errors.checkout = "ساعت تخلیه را انتخاب کنید.";
  if (!values.cancellationPolicy) errors.cancellationPolicy = "یک قانون لغو انتخاب کنید.";
  if (!values.acceptedTerms) errors.acceptedTerms = "برای ادامه باید قوانین لیدوما را بپذیرید.";
  return errors;
}

export default function RulesStep() {
  const { draft, residenceId, commit, saveState, next, setDirty, progressMarker } = useWizard();

  const { data: catalog, isLoading } = useQuery({
    queryKey: ["ruleCatalog"],
    queryFn: async () => {
      const res = await getRuleCatalog();
      return res.ok ? res.data : [];
    },
    staleTime: 30 * 60 * 1000,
  });

  const initial = useMemo<Values | undefined>(() => {
    if (!draft) return undefined;
    const from = draft.checkinFrom ?? "14:00";
    const to = draft.checkinTo ?? "22:00";
    return {
      ruleIds: (draft.rules ?? []).map((rule) => rule.ruleId),
      rulesDesc: draft.rulesDesc ?? "",
      checkinFrom: from,
      checkinTo: to,
      allDayCheckin: from === ALL_DAY_FROM && to === ALL_DAY_TO,
      checkout: draft.checkout ?? "12:00",
      minReservableDays: draft.minReservableDays ?? 1,
      cancellationPolicy: draft.cancellationPolicy ?? "",
      /**
       * Never pre-ticked. Accepting the terms is a statement the host makes,
       * and a box that arrives already ticked is not one they made.
       */
      acceptedTerms: false,
    };
  }, [draft]);

  const form = useStepForm<Values>({
    initial,
    validate,
    rescueKey: residenceId ? `lidoma:wizard:${residenceId}:rules` : undefined,
  });

  useEffect(() => {
    setDirty(form.dirty);
  }, [form.dirty, setDirty]);

  /** The custom policy's five numbers, in the shape the old card expects. */
  const customFormik = useFormik({
    initialValues: {
      "full-return-time": draft?.fullReturnTime ?? null,
      "before-start-time": draft?.beforeStartTime ?? null,
      "host-share-total-amount": draft?.hostShareTotalAmount ?? null,
      "host-share-past-nights": draft?.hostSharePastNights ?? null,
      "host-share-future-nights": draft?.hostShareFutureNights ?? null,
    },
    onSubmit: () => undefined,
    enableReinitialize: true,
  });

  const isCustom = form.values.cancellationPolicy === CancellationPolicy_enum.CUSTOM;

  const toggleRule = (id: number) =>
    form.setValues((previous) => ({
      ...previous,
      ruleIds: previous.ruleIds.includes(id)
        ? previous.ruleIds.filter((r) => r !== id)
        : [...previous.ruleIds, id],
    }));

  const setAllDay = (on: boolean) =>
    form.setValues((previous) => ({
      ...previous,
      allDayCheckin: on,
      checkinFrom: on ? ALL_DAY_FROM : "14:00",
      checkinTo: on ? ALL_DAY_TO : "22:00",
    }));

  async function onNext() {
    const problems = form.submit();
    if (problems.length) return problems;

    const preset = policyByValue(form.values.cancellationPolicy);
    const custom = customFormik.values;

    if (isCustom) {
      const full = Number(custom["full-return-time"]);
      const before = Number(custom["before-start-time"]);
      if (!Number.isFinite(full) || !Number.isFinite(before)) {
        return ["دو مهلت قانون لغو دلخواه را وارد کنید."];
      }
      if (before >= full) {
        customFormik.setFieldError(
          "before-start-time",
          "مقدار فیلد دوم باید کمتر از فیلد اول باشد."
        );
        return ["در قانون لغو دلخواه، مهلت دوم باید کمتر از مهلت اول باشد."];
      }
    }

    commit(async (id) => {
      const result = await saveRules(id, {
        rules: form.values.ruleIds.map((ruleId) => ({ ruleId })),
        rulesDesc: form.values.rulesDesc.trim(),
        checkinFrom: form.values.checkinFrom,
        checkinTo: form.values.checkinTo,
        checkout: form.values.checkout,
        minReservableDays: form.values.minReservableDays,
        cancellationPolicy: form.values.cancellationPolicy,
        // The policy's numbers travel with its name. Storing only the name
        // would leave the reservation engine to guess the refund terms.
        fullReturnTime: isCustom ? Number(custom["full-return-time"]) : preset?.fullReturnTime,
        beforeStartTime: isCustom ? Number(custom["before-start-time"]) : preset?.beforeStartTime,
        hostShareTotalAmount: isCustom
          ? Number(custom["host-share-total-amount"])
          : preset?.hostShareTotalAmount,
        hostSharePastNights: isCustom
          ? Number(custom["host-share-past-nights"])
          : preset?.hostSharePastNights,
        hostShareFutureNights: isCustom
          ? Number(custom["host-share-future-nights"])
          : preset?.hostShareFutureNights,
        step: progressMarker,
      });
      if (result.ok) form.markSaved();
      else if (result.fieldErrors) form.setServerErrors(result.fieldErrors);
      return result;
    });
    setDirty(false);
    next();
  }

  if (isLoading || !form.ready) return <StepSkeleton />;

  return (
    <StepLayout onNext={onNext} busy={saveState === "saving"}>
      <Section title="ساعت پذیرش و تخلیه">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12">
          <Field
            label="پذیرش از"
            required={!form.values.allDayCheckin}
            error={form.visibleErrors.checkinFrom}
          >
            {(props) => (
              <TimeSelect
                id={props.id}
                aria-invalid={props["aria-invalid"]}
                aria-describedby={props["aria-describedby"]}
                value={form.values.checkinFrom}
                onChange={(value) => form.setField("checkinFrom", value)}
                onBlur={() => form.touch("checkinFrom")}
                disabled={form.values.allDayCheckin}
                invalid={!!form.visibleErrors.checkinFrom}
              />
            )}
          </Field>

          <div>
            {form.values.allDayCheckin ? (
              // The pair collapses into one statement rather than leaving two
              // disabled boxes showing 00:00–23:00, which reads like a setting
              // rather than like "any time".
              <Field label="پذیرش تا" optionalNote>
                {() => (
                  <div className="h-[52px] px-16 rounded-12 border border-primary-main bg-primary-light/30 flex items-center gap-x-8 text-14 font-m text-black">
                    <i className="icon-Timer text-18 text-primary-dark" />
                    پذیرش ۲۴ ساعته
                  </div>
                )}
              </Field>
            ) : (
              <Field label="پذیرش تا" optionalNote error={form.visibleErrors.checkinTo}>
                {(props) => (
                  <TimeSelect
                    id={props.id}
                    aria-invalid={props["aria-invalid"]}
                    aria-describedby={props["aria-describedby"]}
                    value={form.values.checkinTo}
                    onChange={(value) => form.setField("checkinTo", value)}
                    onBlur={() => form.touch("checkinTo")}
                    invalid={!!form.visibleErrors.checkinTo}
                  />
                )}
              </Field>
            )}

            <label className="flex items-center gap-x-8 -mt-14 mb-14 cursor-pointer">
              <input
                type="checkbox"
                checked={form.values.allDayCheckin}
                onChange={(e) => setAllDay(e.target.checked)}
                className="w-18 h-18 shrink-0 accent-primary-main cursor-pointer"
              />
              <span className="text-12 font-m text-black">پذیرش ۲۴ ساعته</span>
            </label>
          </div>

          <Field label="تخلیه تا" required error={form.visibleErrors.checkout}>
            {(props) => (
              <TimeSelect
                id={props.id}
                aria-invalid={props["aria-invalid"]}
                aria-describedby={props["aria-describedby"]}
                value={form.values.checkout}
                onChange={(value) => form.setField("checkout", value)}
                onBlur={() => form.touch("checkout")}
                invalid={!!form.visibleErrors.checkout}
              />
            )}
          </Field>
        </div>

        <div className="flex items-center justify-between gap-x-16 rounded-12 border border-gray-DBDFE5 px-16 py-14 mt-4">
          <div>
            <p className="text-14 font-m text-black">حداقل شب رزرو</p>
            <p className="text-12 font-l text-gray-77828F mt-2">
              کمتر از این تعداد شب، رزرو پذیرفته نمی‌شود.
            </p>
          </div>
          <Counter
            label="حداقل شب رزرو"
            value={form.values.minReservableDays}
            onChange={(value) => form.setField("minReservableDays", value)}
            min={1}
            max={30}
          />
        </div>
      </Section>

      <Section title="مقررات اقامتگاه" description="هر چیزی که مهمان باید پیش از رزرو بداند.">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10">
          {(catalog ?? []).map((rule) => (
            <CheckCard
              key={rule.id}
              checked={form.values.ruleIds.includes(rule.id)}
              onToggle={() => toggleRule(rule.id)}
              label={rule.name}
              icon={rule.iconUrl}
            />
          ))}
        </div>

        <div className="mt-14">
          <Field label="توضیح بیشتر" optionalNote>
            {(props) => (
              <TextArea
                {...props}
                value={form.values.rulesDesc}
                onChange={(e) => form.setField("rulesDesc", e.target.value)}
                rows={3}
                placeholder="مثلاً: برگزاری مهمانی و صدای بلند پس از ساعت ۲۳ مجاز نیست."
              />
            )}
          </Field>
        </div>
      </Section>

      <Section
        title="قانون لغو رزرو"
        description="یکی از حالت‌های زیر را برای قوانین لغو رزرو انتخاب کنید."
      >
        {CANCELLATION_POLICIES.map((policy) => (
          <div className="mb-16" key={policy.value}>
            <CancelRuleItem
              mainTitle={policy.value}
              firstTitle={policy.firstTitle}
              firstDesc={policy.firstDesc}
              secondTitle={policy.secondTitle}
              secondDesc={policy.secondDesc}
              thirdTitle={policy.thirdTitle}
              thirdDesc={policy.thirdDesc}
              reserveCommission={RESERVE_COMMISSION}
              cancelCommission={CANCEL_COMMISSION}
              isSelected={form.values.cancellationPolicy === policy.value}
              onSelect={() => form.setField("cancellationPolicy", policy.value)}
            />
          </div>
        ))}

        <EditableCancelRuleItem
          mainTitle={CancellationPolicy_enum.CUSTOM}
          fullReturnTime={Number(customFormik.values["full-return-time"]) || 0}
          beforeStartTime={Number(customFormik.values["before-start-time"]) || 0}
          hostShareTotalAmount={Number(customFormik.values["host-share-total-amount"]) || 0}
          hostSharePastNights={Number(customFormik.values["host-share-past-nights"]) || 0}
          hostShareFutureNights={Number(customFormik.values["host-share-future-nights"]) || 0}
          reserveCommission={RESERVE_COMMISSION}
          cancelCommission={CANCEL_COMMISSION}
          isSelected={isCustom}
          onSelect={() => form.setField("cancellationPolicy", CancellationPolicy_enum.CUSTOM)}
          formik={customFormik}
        />

        {form.visibleErrors.cancellationPolicy && (
          <p role="alert" className="text-12 font-m text-error-light mt-8">
            {form.visibleErrors.cancellationPolicy}
          </p>
        )}
      </Section>

      <div
        data-field-invalid={form.visibleErrors.acceptedTerms ? "true" : undefined}
        className={`rounded-12 border-2 p-14 scroll-mt-80 transition-colors ${
          form.visibleErrors.acceptedTerms
            ? "border-error-light bg-red-light/40"
            : form.values.acceptedTerms
            ? "border-primary-main bg-primary-light/40"
            : "border-gray-DBDFE5"
        }`}
      >
        {/*
          The state has to be readable at a glance, because this is the one
          box a host is asked to actively agree to. A bare native checkbox
          renders differently in every browser and reads as furniture; a tile
          that changes colour and shows a filled tick says "you have agreed"
          without anyone having to look closely.
        */}
        <label className="flex items-start gap-x-12 cursor-pointer">
          <input
            type="checkbox"
            checked={form.values.acceptedTerms}
            onChange={(e) => form.setField("acceptedTerms", e.target.checked)}
            onBlur={() => form.touch("acceptedTerms")}
            aria-invalid={!!form.visibleErrors.acceptedTerms}
            className="sr-only peer"
          />
          <span
            aria-hidden="true"
            className={`w-24 h-24 mt-1 shrink-0 rounded-6 border-2 grid place-items-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary-main peer-focus-visible:ring-offset-2 ${
              form.values.acceptedTerms
                ? "border-primary-main bg-primary-main"
                : "border-gray-A9B1BC bg-white"
            }`}
          >
            {form.values.acceptedTerms && <i className="icon-Tick text-12 text-white" />}
          </span>
          <span className="text-13 leading-24 font-l text-black">
            <Link href="/rules" target="_blank" className="text-blue-main underline font-m">
              قوانین و مقررات لیدوما
            </Link>{" "}
            را خوانده‌ام و می‌پذیرم.
            <span className="text-error-light mr-2" aria-hidden="true">
              *
            </span>
          </span>
        </label>
        {form.visibleErrors.acceptedTerms && (
          <p role="alert" className="text-12 font-m text-error-light mt-8 pr-32">
            {form.visibleErrors.acceptedTerms}
          </p>
        )}
      </div>

      {form.values.minReservableDays > 3 && (
        <div className="mt-16">
          <Callout tone="warning">
            حداقل {faDigits(form.values.minReservableDays)} شب، بخش بزرگی از جست‌وجوهای آخر هفته را
            از اقامتگاه شما حذف می‌کند.
          </Callout>
        </div>
      )}
    </StepLayout>
  );
}
