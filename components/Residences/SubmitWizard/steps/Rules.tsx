import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRuleCatalog, saveRules } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import { CANCELLATION_POLICIES } from "../cancellation";
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
 * Three things that used to be two separate steps and a checkbox nobody had
 * anywhere to put. They belong together: all three are the terms of the stay,
 * and a host deciding one is in the frame of mind to decide the others.
 */

interface Values {
  ruleIds: number[];
  rulesDesc: string;
  checkinFrom: string;
  checkinTo: string;
  checkout: string;
  minReservableDays: number;
  cancellationPolicy: string;
  acceptedTerms: boolean;
}

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.checkinFrom) errors.checkinFrom = "ساعت شروع پذیرش را انتخاب کنید.";
  if (!values.checkout) errors.checkout = "ساعت تخلیه را انتخاب کنید.";

  if (values.checkinFrom && values.checkinTo && values.checkinTo < values.checkinFrom) {
    errors.checkinTo = "پایان بازه‌ی پذیرش نمی‌تواند قبل از شروع آن باشد.";
  }
  if (!values.cancellationPolicy) errors.cancellationPolicy = "یک قانون لغو انتخاب کنید.";
  if (!values.acceptedTerms) errors.acceptedTerms = "برای ادامه باید قوانین لیدوما را بپذیرید.";
  return errors;
}

export default function RulesStep() {
  const { draft, residenceId, save, saveState, next, setDirty, progressMarker } = useWizard();

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
    return {
      ruleIds: (draft.rules ?? []).map((rule) => rule.ruleId),
      rulesDesc: draft.rulesDesc ?? "",
      checkinFrom: draft.checkinFrom ?? "14:00",
      checkinTo: draft.checkinTo ?? "22:00",
      checkout: draft.checkout ?? "12:00",
      minReservableDays: draft.minReservableDays ?? 1,
      cancellationPolicy: draft.cancellationPolicy ?? "",
      // Already published listings agreed at the time; asking again on every
      // edit would be a checkbox that means nothing.
      acceptedTerms: draft.state !== "DRAFT",
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

  const toggleRule = (id: number) =>
    form.setValues((previous) => ({
      ...previous,
      ruleIds: previous.ruleIds.includes(id)
        ? previous.ruleIds.filter((r) => r !== id)
        : [...previous.ruleIds, id],
    }));

  async function onNext() {
    if (!form.submit()) return;
    const policy = CANCELLATION_POLICIES.find(
      (p) => p.value === form.values.cancellationPolicy
    );

    const ok = await save(async (id) => {
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
        fullReturnTime: policy?.fullReturnTime,
        beforeStartTime: policy?.beforeStartTime,
        hostShareTotalAmount: policy?.hostShareTotalAmount,
        hostSharePastNights: policy?.hostSharePastNights,
        hostShareFutureNights: policy?.hostShareFutureNights,
        step: progressMarker,
      });
      if (result.ok) form.markSaved();
      else if (result.fieldErrors) form.setServerErrors(result.fieldErrors);
      return result;
    });
    if (ok) {
      setDirty(false);
      next();
    }
  }

  if (isLoading || !form.ready) return <StepSkeleton />;

  return (
    <StepLayout onNext={onNext} busy={saveState === "saving"}>
      <Section title="ساعت پذیرش و تخلیه">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12">
          <Field label="پذیرش از" required error={form.visibleErrors.checkinFrom}>
            {(props) => (
              <TimeSelect
                id={props.id}
                aria-invalid={props["aria-invalid"]}
                aria-describedby={props["aria-describedby"]}
                value={form.values.checkinFrom}
                onChange={(value) => form.setField("checkinFrom", value)}
                onBlur={() => form.touch("checkinFrom")}
                invalid={!!form.visibleErrors.checkinFrom}
              />
            )}
          </Field>
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
        description="تعیین می‌کند اگر مهمان رزروش را لغو کند، چه مقدار به شما می‌رسد."
      >
        <div className="flex flex-col gap-y-10">
          {CANCELLATION_POLICIES.map((policy) => {
            const selected = form.values.cancellationPolicy === policy.value;
            return (
              <button
                key={policy.value}
                type="button"
                onClick={() => form.setField("cancellationPolicy", policy.value)}
                aria-pressed={selected}
                className={`w-full text-right rounded-12 border-2 p-14 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main ${
                  selected
                    ? "border-primary-main bg-primary-light/30"
                    : "border-gray-DBDFE5 hover:border-gray-A9B1BC"
                }`}
              >
                <span className="flex items-start gap-x-12">
                  <span
                    className={`shrink-0 w-20 h-20 mt-2 rounded-full border-2 grid place-items-center ${
                      selected ? "border-primary-main bg-primary-main" : "border-gray-DBDFE5"
                    }`}
                  >
                    {selected && <i className="icon-Tick text-10 text-white" />}
                  </span>
                  <span className="grow">
                    <span className="flex items-baseline gap-x-8">
                      <span className="text-14 font-b text-black">{policy.label}</span>
                      <span className="text-11 font-l text-gray-77828F">{policy.summary}</span>
                    </span>
                    <span className="block text-12 leading-20 font-l text-gray-77828F mt-4">
                      {policy.detail}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {form.visibleErrors.cancellationPolicy && (
          <p role="alert" className="text-12 font-m text-error-light mt-8">
            {form.visibleErrors.cancellationPolicy}
          </p>
        )}
        <p className="text-12 font-l text-gray-77828F mt-10">
          جزئیات کامل در{" "}
          <Link
            href="/reserve-cancellation-policy"
            target="_blank"
            className="text-blue-main underline"
          >
            صفحه‌ی قوانین لغو رزرو
          </Link>{" "}
          آمده است.
        </p>
      </Section>

      <div
        className={`rounded-12 border p-14 ${
          form.visibleErrors.acceptedTerms ? "border-error-light" : "border-gray-DBDFE5"
        }`}
      >
        <label className="flex items-start gap-x-12 cursor-pointer">
          <input
            type="checkbox"
            checked={form.values.acceptedTerms}
            onChange={(e) => form.setField("acceptedTerms", e.target.checked)}
            onBlur={() => form.touch("acceptedTerms")}
            aria-invalid={!!form.visibleErrors.acceptedTerms}
            className="w-20 h-20 mt-2 shrink-0 accent-primary-main cursor-pointer"
          />
          <span className="text-13 leading-24 font-l text-black">
            <Link href="/rules" target="_blank" className="text-blue-main underline font-m">
              قوانین و مقررات لیدوما
            </Link>{" "}
            را خوانده‌ام و می‌پذیرم.
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
            حداقل {faDigits(form.values.minReservableDays)} شب، بخش بزرگی از جست‌وجوهای آخر هفته
            را از اقامتگاه شما حذف می‌کند.
          </Callout>
        </div>
      )}
    </StepLayout>
  );
}
