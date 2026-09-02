import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { StepBlocked, WizardShell } from "./Shell";
import { STEPS } from "./steps";
import { WizardProvider, useWizard } from "./useWizard";
import { StepSkeleton } from "./ui";

/**
 * One list, two uses.
 *
 * `dynamic()` is built from it and so is the prefetcher, so a step cannot be
 * registered for rendering and forgotten for preloading. The wizard is a
 * single route with a `?step=` parameter, so `router.prefetch` has nothing to
 * do here — calling the import is what starts the chunk.
 */
const LOADERS = [
  () => import("./steps/Details"),
  () => import("./steps/Specs"),
  () => import("./steps/Address"),
  () => import("./steps/Capacity"),
  () => import("./steps/Amenities"),
  () => import("./steps/Pricing"),
  () => import("./steps/Images"),
  () => import("./steps/Documents"),
  () => import("./steps/Rules"),
  () => import("./steps/Review"),
];

const STEP_COMPONENTS = LOADERS.map((load) =>
  dynamic(load, { ssr: false, loading: () => <StepSkeleton /> })
);

function usePrefetchNext(index: number) {
  useEffect(() => {
    const load = LOADERS[index + 1];
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
