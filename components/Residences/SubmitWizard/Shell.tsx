import React from "react";
import { useRouter } from "next/router";
import { STEPS, TOTAL_STEPS } from "./steps";
import { useWizard } from "./useWizard";
import { Callout, faDigits, SaveStatus, Spinner } from "./ui";

/**
 * The frame every step sits in.
 *
 * Three jobs: say where the host is, keep the way out visible, and put the
 * primary action where a thumb already is. Everything else on screen belongs
 * to the step.
 */

// ------------------------------------------------------------------ rail ---

function StepRail() {
  const { index, goTo, maxReachable, draft } = useWizard();

  return (
    <nav aria-label="مراحل ثبت اقامتگاه" className="w-[196px] shrink-0">
      <ol className="relative">
        {STEPS.map((step, i) => {
          const done = !!draft && step.isComplete(draft);
          const current = i === index;
          const reachable = i <= Math.max(maxReachable, index);

          return (
            <li key={step.key} className="relative">
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute right-[15px] top-32 w-2 h-[calc(100%-24px)] ${
                    done ? "bg-primary-main" : "bg-gray-E9ECF0"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => reachable && goTo(i)}
                disabled={!reachable}
                aria-current={current ? "step" : undefined}
                className={`relative z-1 flex items-center gap-x-10 w-full py-8 text-right rounded-8 transition-colors disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main ${
                  reachable ? "cursor-pointer" : ""
                }`}
              >
                <span
                  className={`w-32 h-32 shrink-0 rounded-full grid place-items-center border-2 transition-colors ${
                    current
                      ? "border-primary-main bg-primary-main text-white"
                      : done
                      ? "border-primary-main bg-white text-primary-dark"
                      : "border-gray-E9ECF0 bg-white text-gray-A9B1BC"
                  }`}
                >
                  {done && !current ? (
                    <i className="icon-Tick text-12" />
                  ) : (
                    <span className="text-12 font-b">{faDigits(i + 1)}</span>
                  )}
                </span>
                <span
                  className={`text-13 leading-22 ${
                    current
                      ? "font-b text-black"
                      : done
                      ? "font-m text-black"
                      : "font-l text-gray-A9B1BC"
                  }`}
                >
                  {step.short}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------- header ---

function MobileProgress() {
  const { index, step, saveState } = useWizard();
  const percent = Math.round(((index + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="md:hidden sticky top-0 z-3 bg-white border-b border-gray-F3F5F7">
      <div className="flex items-center justify-between px-16 pt-12 pb-8">
        <span className="text-12 font-m text-gray-77828F">
          مرحله {faDigits(index + 1)} از {faDigits(TOTAL_STEPS)} · {step.short}
        </span>
        <SaveStatus state={saveState} />
      </div>
      <div
        className="h-4 bg-gray-F3F5F7"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="پیشرفت ثبت اقامتگاه"
      >
        <div
          className="h-full bg-primary-main transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- shell ---

export function WizardShell({ children }: { children: React.ReactNode }) {
  const { index, draft, residenceId, hasFailedSave, retryFailed, saveState } = useWizard();

  return (
    <div className="pb-[104px] md:pb-40">
      <MobileProgress />

      <div className="hidden md:flex md:items-baseline md:justify-between md:mb-24">
        <h1 className="text-22 leading-34 font-b text-black">ثبت اقامتگاه</h1>
        {residenceId && draft?.reference && (
          <span className="text-12 font-l text-gray-77828F">پیش‌نویس {draft.reference}</span>
        )}
      </div>

      {/*
        Saves go out behind the navigation, so a failure arrives on a screen
        the host has already left. It follows them until it is resolved —
        anything quieter would let someone reach the end believing a step was
        stored when it was not.
      */}
      {hasFailedSave && (
        <div className="px-16 md:px-0 mb-16">
          <Callout tone="error">
            <div className="flex items-center justify-between gap-x-12">
              <span>یکی از مراحل ذخیره نشد. تا رفع آن، ثبت نهایی ممکن نیست.</span>
              <button
                type="button"
                onClick={retryFailed}
                disabled={saveState === "saving"}
                className="shrink-0 h-[32px] px-14 rounded-8 bg-white border border-error-light text-12 font-m text-error-light disabled:opacity-50"
              >
                {saveState === "saving" ? "در حال تلاش…" : "تلاش دوباره"}
              </button>
            </div>
          </Callout>
        </div>
      )}

      <div className="flex items-start md:gap-x-32">
        <div className="hidden md:block sticky top-24">
          {/* The rail is meaningless before there is a draft to measure. */}
          {index > 0 || draft ? <StepRail /> : null}
        </div>
        <div className="w-full md:grow md:max-w-[720px] px-16 md:px-0 pt-16 md:pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ step frame ---

interface StepLayoutProps {
  children: React.ReactNode;
  /** Runs on «ادامه». Return false to stay put. */
  onNext: () => void | Promise<void>;
  nextLabel?: string;
  nextDisabled?: boolean;
  busy?: boolean;
  /** Replaces the default back button, e.g. on the first step. */
  hideBack?: boolean;
  /** Shown above the actions — an error, a note, a rescue banner. */
  footerNote?: React.ReactNode;
}

export function StepLayout({
  children,
  onNext,
  nextLabel = "ذخیره و ادامه",
  nextDisabled,
  busy,
  hideBack,
  footerNote,
}: StepLayoutProps) {
  const { step, index, back, saveState, error, clearError } = useWizard();

  return (
    <>
      <header className="mb-20">
        <p className="hidden md:flex md:items-center md:gap-x-12 text-12 font-m text-gray-77828F mb-8">
          مرحله {faDigits(index + 1)} از {faDigits(TOTAL_STEPS)}
          <SaveStatus state={saveState} />
        </p>
        <h2 className="text-20 leading-32 md:text-24 md:leading-38 font-b text-black">
          {step.title}
        </h2>
        {step.hint && (
          <p className="text-13 leading-22 font-l text-gray-77828F mt-6">{step.hint}</p>
        )}
      </header>

      {error && (
        <div className="mb-16">
          <Callout tone={error.offline ? "warning" : "error"}>
            <div className="flex items-start justify-between gap-x-12">
              <span>{error.message}</span>
              <button
                type="button"
                onClick={clearError}
                className="shrink-0 text-12 font-m text-gray-77828F underline"
              >
                بستن
              </button>
            </div>
          </Callout>
        </div>
      )}

      <div>{children}</div>

      {/*
        Mobile: fixed to the bottom, above the safe area, on an opaque bar —
        and the page reserves the same height, so the bar never covers the last
        field. Desktop: it simply follows the content.
      */}
      <div className="fixed md:static bottom-0 right-0 left-0 z-3 md:z-0 bg-white md:bg-transparent border-t md:border-t-0 border-gray-F3F5F7 px-16 md:px-0 py-12 md:py-0 md:mt-32 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-0">
        {footerNote && <div className="mb-10">{footerNote}</div>}
        <div className="flex items-center gap-x-12">
          {!hideBack && index > 0 && (
            <button
              type="button"
              onClick={back}
              className="h-[52px] px-20 shrink-0 rounded-12 border border-gray-DBDFE5 text-14 font-m text-black transition-colors hover:border-gray-A9B1BC focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
            >
              قبلی
            </button>
          )}
          <button
            type="button"
            onClick={() => void onNext()}
            disabled={nextDisabled || busy}
            className="grow h-[52px] rounded-12 bg-primary-main text-14 font-b text-black transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 flex items-center justify-center gap-x-8"
          >
            {busy && <Spinner className="!w-16 !h-16 !border-black/20 !border-t-black" />}
            {busy ? "در حال ذخیره…" : nextLabel}
          </button>
        </div>
      </div>
    </>
  );
}

/** Full-width message for a step that cannot render — no draft, load failed. */
export function StepBlocked({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const router = useRouter();
  return (
    <div className="py-40 text-center">
      <i className="icon-Warning text-40 text-warning" />
      <p className="text-14 leading-26 font-m text-black mt-16 mb-20">{message}</p>
      <div className="flex items-center justify-center gap-x-12">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="h-[44px] px-24 rounded-12 bg-primary-main text-14 font-b text-black"
          >
            تلاش دوباره
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push("/residences/list")}
          className="h-[44px] px-24 rounded-12 border border-gray-DBDFE5 text-14 font-m text-black"
        >
          اقامتگاه‌های من
        </button>
      </div>
    </div>
  );
}
