import React, { useCallback, useMemo } from "react";
import { saveSpecs } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { DEFAULT_NAME } from "../steps";
import { useWizard } from "../useWizard";
import { useDebouncedAutosave, useStepForm } from "../useStepForm";
import { Callout, Field, NumberInput, StepSkeleton, TextArea, TextInput } from "../ui";

/**
 * Step two: what the listing is called and what it is like.
 *
 * This is the step that stopped every new host. Its numbers went out as
 * strings — a controlled text input holds a string — and the API rejected the
 * whole body with «ورودی نامعتبر است», naming no field. Two things changed:
 * the numbers leave here as numbers, and the server now says which field it
 * refused so the message can land next to it.
 */

interface Values {
  name: string;
  description: string;
  totalArea: string;
  foundationArea: string;
  floor: string;
}

const NAME_MIN = 3;
const NAME_MAX = 200;
const DESCRIPTION_MIN = 30;

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};

  const name = values.name.trim();
  if (!name) errors.name = "نام اقامتگاه را وارد کنید.";
  else if (name === DEFAULT_NAME) errors.name = "یک نام واقعی برای اقامتگاه انتخاب کنید.";
  else if (name.length < NAME_MIN) errors.name = `نام باید حداقل ${NAME_MIN} حرف باشد.`;
  else if (name.length > NAME_MAX) errors.name = `نام نباید بیشتر از ${NAME_MAX} حرف باشد.`;

  const description = values.description.trim();
  if (description && description.length < DESCRIPTION_MIN) {
    errors.description = `توضیح کوتاه‌تر از ${DESCRIPTION_MIN} حرف کمکی به مهمان نمی‌کند.`;
  }

  return errors;
}

export default function SpecsStep() {
  const { draft, residenceId, commit, saveState, next, setDirty, progressMarker, fieldErrors } =
    useWizard();

  const initial = useMemo<Values | undefined>(() => {
    if (!draft) return undefined;
    return {
      // The row is created with a placeholder name; showing it back would make
      // the host think they had already named the place.
      name: draft.name && draft.name !== DEFAULT_NAME ? draft.name : "",
      description: draft.description ?? "",
      totalArea: draft.totalArea != null ? String(draft.totalArea) : "",
      foundationArea: draft.foundationArea != null ? String(draft.foundationArea) : "",
      floor: draft.floor ?? "",
    };
  }, [draft]);

  const form = useStepForm<Values>({
    initial,
    validate,
    rescueKey: residenceId ? `lidoma:wizard:${residenceId}:specs` : undefined,
  });

  const patch = useCallback(
    (step?: number) => ({
      name: form.values.name.trim(),
      // The panel keeps the host's proposal separately from the published
      // name, so an admin can retitle for search without erasing what the
      // host asked for. On the way in they are the same thing.
      hostSuggestedName: form.values.name.trim(),
      description: form.values.description.trim(),
      // Numbers, not strings — see the note at the top of this file.
      totalArea: form.values.totalArea ? Number(form.values.totalArea) : undefined,
      foundationArea: form.values.foundationArea ? Number(form.values.foundationArea) : undefined,
      floor: form.values.floor.trim(),
      ...(step !== undefined ? { step } : {}),
    }),
    [form.values]
  );

  // Quietly, while the host is still writing. Only once the step is valid —
  // there is no point posting a body the server will refuse.
  useDebouncedAutosave(
    () => {
      if (!form.dirty || !form.isValid) return;
      commit(async (id) => {
        const result = await saveSpecs(id, patch());
        if (result.ok) form.markSaved();
        return result;
      });
    },
    { enabled: !!residenceId && form.dirty && form.isValid, deps: [form.values] }
  );

  React.useEffect(() => {
    setDirty(form.dirty);
  }, [form.dirty, setDirty]);

  React.useEffect(() => {
    if (Object.keys(fieldErrors).length) form.setServerErrors(fieldErrors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldErrors]);

  async function onNext() {
    const problems = form.submit();
    if (problems.length) return problems;
    commit(async (id) => {
      const result = await saveSpecs(id, patch(progressMarker));
      if (result.ok) form.markSaved();
      else if (!result.ok && result.fieldErrors) form.setServerErrors(result.fieldErrors);
      return result;
    });
    setDirty(false);
    next();
  }

  if (!form.ready) return <StepSkeleton />;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      footerNote={
        form.rescued ? (
          <Callout tone="warning">
            <div className="flex items-center justify-between gap-x-12">
              <span>نوشته‌های ذخیره‌نشده‌ی شما بازیابی شد.</span>
              <button
                type="button"
                onClick={form.dismissRescue}
                className="shrink-0 text-12 font-m underline"
              >
                باشه
              </button>
            </div>
          </Callout>
        ) : null
      }
    >
      <Field
        label="نام اقامتگاه"
        required
        hint="کوتاه و گویا. مهمان همین را در نتایج جست‌وجو می‌بیند."
        error={form.visibleErrors.name}
      >
        {(props) => (
          <TextInput
            {...props}
            value={form.values.name}
            onChange={(e) => form.setField("name", e.target.value)}
            onBlur={() => form.touch("name")}
            placeholder="مثلاً: ویلای ساحلی رامسر"
            maxLength={NAME_MAX}
            invalid={!!form.visibleErrors.name}
          />
        )}
      </Field>

      <Field
        label="درباره اقامتگاه"
        optionalNote
        hint="چه چیزی این‌جا را متفاوت می‌کند؟ منظره، حیاط، نزدیکی به جایی."
        error={form.visibleErrors.description}
      >
        {(props) => (
          <TextArea
            {...props}
            value={form.values.description}
            onChange={(e) => form.setField("description", e.target.value)}
            onBlur={() => form.touch("description")}
            placeholder="ویلایی دوخوابه با حیاط بزرگ و پنجره‌هایی رو به دریا…"
            rows={6}
            invalid={!!form.visibleErrors.description}
          />
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-x-16">
        <Field label="مساحت کل زمین" optionalNote error={form.visibleErrors.totalArea}>
          {(props) => (
            <NumberInput
              {...props}
              value={form.values.totalArea}
              onValueChange={(v) => form.setField("totalArea", v)}
              onBlur={() => form.touch("totalArea")}
              suffix="متر"
              placeholder="۳۰۰"
              invalid={!!form.visibleErrors.totalArea}
            />
          )}
        </Field>

        <Field label="مساحت زیربنا" optionalNote error={form.visibleErrors.foundationArea}>
          {(props) => (
            <NumberInput
              {...props}
              value={form.values.foundationArea}
              onValueChange={(v) => form.setField("foundationArea", v)}
              onBlur={() => form.touch("foundationArea")}
              suffix="متر"
              placeholder="۱۲۰"
              invalid={!!form.visibleErrors.foundationArea}
            />
          )}
        </Field>
      </div>

      <Field label="طبقه" optionalNote error={form.visibleErrors.floor}>
        {(props) => (
          <TextInput
            {...props}
            value={form.values.floor}
            onChange={(e) => form.setField("floor", e.target.value)}
            onBlur={() => form.touch("floor")}
            placeholder="مثلاً: همکف"
            invalid={!!form.visibleErrors.floor}
          />
        )}
      </Field>
    </StepLayout>
  );
}
