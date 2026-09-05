import React, { useEffect } from "react";
import { StepBlocked, WizardShell } from "./Shell";
import { STEPS } from "./steps";
import { STEP_COMPONENTS, STEP_LOADERS } from "./stepComponents";
import { WizardProvider, useWizard } from "./useWizard";
import { StepSkeleton } from "./ui";

/**
 * The wizard is a single route with a `?step=` parameter, so `router.prefetch`
 * has nothing to do here — calling the import is what starts the chunk.
 */
function usePrefetchNext(index: number) {
  useEffect(() => {
    const load = STEP_LOADERS[index + 1];
    if (!load) return;
    // A beat behind, so it never competes with the step the host is reading.
    const timer = setTimeout(() => {
      void load().catch(() => {
        /* it will just load on demand instead */
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [index]);
}

function WizardBody() {
  const { index, isLoading, loadError, reload, residenceId, draft } = useWizard();
  usePrefetchNext(index);

  if (residenceId && isLoading && !draft) {
    return <StepSkeleton />;
  }

  if (residenceId && loadError) {
    return (
      <StepBlocked
        message="اطلاعات این اقامتگاه بارگذاری نشد. ممکن است حذف شده باشد یا متعلق به حساب دیگری باشد."
        onRetry={() => void reload()}
      />
    );
  }

  const Step = STEP_COMPONENTS[index] ?? STEP_COMPONENTS[0];
  // Keyed by step so a step's local form state is never carried into the next
  // one — two steps with a field of the same name would otherwise share it.
  return <Step key={STEPS[index]?.key ?? index} />;
}

export default function SubmitWizard() {
  return (
    <WizardProvider>
      <WizardShell>
        <WizardBody />
      </WizardShell>
    </WizardProvider>
  );
}
