import React, { useEffect, useMemo } from "react";
import { savePricing } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { useStepForm } from "../useStepForm";
import {
  Callout,
  Field,
  MoneyInput,
  NumberInput,
  Section,
  StepSkeleton,
  faDigits,
  grouped,
} from "../ui";

/**
 * Step six: what a night costs.
 *
 * Field names follow the panel's «نرخ اقامتگاه» tab exactly, including its
 * labels. The old wizard sent the extra-guest rate as `extraPrice`, while the
 * panel has always read `extraGuestsPrice` — so what a host typed here was
 * never what an admin saw there, and neither side had any way to notice.
 *
 * Everything is in تومان and everything is optional except the base rate. A
 * blank weekend or peak price means "same as the base", which is what most
 * listings mean, and is better than making a host type the same number three
 * times to get past the screen.
 */

interface Values {
  weekPrice: string;
  weekendPrice: string;
  peakPrice: string;
  extraGuestsPrice: string;
  extraGuestsPeakPrice: string;
  weeklyDiscount: string;
  monthlyDiscount: string;
}

const MIN_NIGHT = 50_000;

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  const week = Number(values.weekPrice);

  if (!values.weekPrice) errors.weekPrice = "قیمت پایه را وارد کنید.";
  else if (week < MIN_NIGHT) {
    errors.weekPrice = `قیمت پایه کمتر از ${grouped(MIN_NIGHT)} تومان به نظر اشتباه می‌رسد.`;
  }

  const weekend = Number(values.weekendPrice);
  if (values.weekendPrice && weekend < week) {
    errors.weekendPrice = "قیمت آخر هفته معمولاً کمتر از قیمت پایه نیست. مطمئنید؟";
  }

  (["weeklyDiscount", "monthlyDiscount"] as const).forEach((key) => {
    const value = Number(values[key]);
    if (values[key] && (value < 0 || value > 90)) {
      errors[key] = "تخفیف باید بین ۰ تا ۹۰ درصد باشد.";
    }
  });

  return errors;
}

export default function PricingStep() {
  const { draft, residenceId, commit, saveState, next, setDirty, progressMarker } = useWizard();

  const initial = useMemo<Values | undefined>(() => {
    if (!draft) return undefined;
    const asText = (value: number | null) => (value != null && value > 0 ? String(value) : "");
    return {
      weekPrice: asText(draft.weekPrice),
      weekendPrice: asText(draft.weekendPrice),
      peakPrice: asText(draft.peakPrice),
      extraGuestsPrice: asText(draft.extraGuestsPrice),
      extraGuestsPeakPrice: asText(draft.extraGuestsPeakPrice),
      weeklyDiscount: asText(draft.weeklyDiscount),
      monthlyDiscount: asText(draft.monthlyDiscount),
    };
  }, [draft]);

  const form = useStepForm<Values>({
    initial,
    validate,
    rescueKey: residenceId ? `lidoma:wizard:${residenceId}:pricing` : undefined,
  });

  useEffect(() => {
    setDirty(form.dirty);
  }, [form.dirty, setDirty]);

  const capacityNote =
    draft?.maxCapacity && draft?.capacity && draft.maxCapacity > draft.capacity
      ? `ظرفیت استاندارد ${faDigits(draft.capacity)} نفر است و تا ${faDigits(
          draft.maxCapacity
        )} نفر پذیرفته می‌شود — نرخ نفر اضافه برای همان اختلاف اعمال می‌شود.`
      : undefined;

  async function onNext() {
    if (!form.submit()) return;
    const number = (value: string) => (value ? Number(value) : undefined);

    commit(async (id) => {
      const result = await savePricing(id, {
        weekPrice: number(form.values.weekPrice),
        weekendPrice: number(form.values.weekendPrice),
        peakPrice: number(form.values.peakPrice),
        extraGuestsPrice: number(form.values.extraGuestsPrice),
        extraGuestsPeakPrice: number(form.values.extraGuestsPeakPrice),
        weeklyDiscount: number(form.values.weeklyDiscount),
        monthlyDiscount: number(form.values.monthlyDiscount),
        step: progressMarker,
      });
      if (result.ok) form.markSaved();
      else if (result.fieldErrors) form.setServerErrors(result.fieldErrors);
      return result;
    });
    setDirty(false);
    next();
  }

  if (!form.ready) return <StepSkeleton />;

  const money = (
    key: keyof Values,
    label: string,
    options: { required?: boolean; hint?: string } = {}
  ) => (
    <Field
      label={label}
      required={options.required}
      optionalNote={!options.required}
      hint={options.hint}
      error={form.visibleErrors[key]}
    >
      {(props) => (
        <MoneyInput
          {...props}
          value={form.values[key]}
          onValueChange={(value) => form.setField(key, value)}
          onBlur={() => form.touch(key)}
          placeholder="۰"
          invalid={!!form.visibleErrors[key]}
        />
      )}
    </Field>
  );

  return (
    <StepLayout onNext={onNext} busy={saveState === "saving"}>
      <Section title="نرخ هر شب">
        {money("weekPrice", "قیمت پایه ( جمعه تا چهارشنبه )", {
          required: true,
          hint: "نرخ معمول یک شب اقامت.",
        })}
        {money("weekendPrice", "قیمت آخر هفته ( چهارشنبه و پنجشنبه )", {
          hint: "خالی بگذارید تا همان قیمت پایه اعمال شود.",
        })}
        {money("peakPrice", "قیمت ایام پیک ( تعطیلات خاص )", {
          hint: "نوروز، تعطیلات رسمی و شب‌های پرتقاضا.",
        })}
      </Section>

      <Section
        title="نفر اضافه"
        description={capacityNote ?? "برای هر نفر بیشتر از ظرفیت استاندارد، به‌ازای هر شب."}
      >
        {money("extraGuestsPrice", "نرخ نفر اضافه")}
        {money("extraGuestsPeakPrice", "نرخ نفر اضافه ( ایام پیک )")}
      </Section>

      <Section
        title="تخفیف اقامت طولانی"
        description="اختیاری، ولی رزروهای بلندمدت را زیاد می‌کند."
      >
        <div className="grid grid-cols-2 gap-x-16">
          <Field label="تخفیف هفتگی" optionalNote error={form.visibleErrors.weeklyDiscount}>
            {(props) => (
              <NumberInput
                {...props}
                value={form.values.weeklyDiscount}
                onValueChange={(value) => form.setField("weeklyDiscount", value)}
                onBlur={() => form.touch("weeklyDiscount")}
                suffix="٪"
                placeholder="۱۰"
                invalid={!!form.visibleErrors.weeklyDiscount}
              />
            )}
          </Field>
          <Field label="تخفیف ماهانه" optionalNote error={form.visibleErrors.monthlyDiscount}>
            {(props) => (
              <NumberInput
                {...props}
                value={form.values.monthlyDiscount}
                onValueChange={(value) => form.setField("monthlyDiscount", value)}
                onBlur={() => form.touch("monthlyDiscount")}
                suffix="٪"
                placeholder="۲۰"
                invalid={!!form.visibleErrors.monthlyDiscount}
              />
            )}
          </Field>
        </div>
      </Section>

      <Callout tone="info">
        این نرخ‌ها پیش‌فرض هستند. پس از تایید اقامتگاه می‌توانید از تقویم، قیمت هر شب را جداگانه
        تغییر دهید.
      </Callout>
    </StepLayout>
  );
}
