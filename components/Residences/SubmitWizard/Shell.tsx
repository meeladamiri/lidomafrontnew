import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import { STEPS, TOTAL_STEPS } from "./steps";
import { useWizard } from "./useWizard";
import { Blockers, Callout, ConfirmDialog, faDigits, SaveStatus, Spinner } from "./ui";

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

/** `useLayoutEffect` warns when it runs during SSR; the steps render client-side. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

// ------------------------------------------------------------------ exit ---

/**
 * The way out.
 *
 * The wizard fills the screen on a phone, the app's own header is hidden on
 * this route, and the only navigation left is the browser's back gesture —
 * which walks back one `?step=` at a time and warns on every one of them. So
 * there was no way out at all, short of closing the tab on top of a draft.
 *
 * Leaving is safe and worth saying so: finished steps are already on the
 * server, and the listing is waiting under «اقامتگاه‌های من». What the dialog
 * has to be clear about is the one case where it is not — a step still in
 * flight or one whose save failed.
 */
function ExitControl({ variant }: { variant: "mobile" | "desktop" }) {
  const { exit, atRisk } = useWizard();
  const [asking, setAsking] = useState(false);
  const close = useCallback(() => setAsking(false), []);

  return (
    <>
      {variant === "mobile" ? (
        <button
          type="button"
          onClick={() => setAsking(true)}
          aria-label="خروج از ثبت اقامتگاه"
          className="w-32 h-32 -ml-6 shrink-0 grid place-items-center rounded-full text-gray-77828F transition-colors hover:bg-gray-F3F5F7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
        >
          <i className="icon-Close text-20" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="flex items-center gap-x-6 h-[36px] px-14 rounded-10 border border-gray-DBDFE5 text-13 font-m text-black transition-colors hover:border-gray-A9B1BC focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
        >
          <i className="icon-Close text-16" />
          خروج
        </button>
      )}

      <ConfirmDialog
        open={asking}
        title="از ثبت اقامتگاه خارج می‌شوید؟"
        description={
          atRisk
            ? "آخرین تغییرات این مرحله هنوز ذخیره نشده است. اگر الان خارج شوید، همان مرحله را باید دوباره پر کنید. مراحل قبلی ذخیره شده‌اند."
            : "مراحلی که تکمیل کرده‌اید ذخیره شده‌اند و هر وقت خواستید می‌توانید از «اقامتگاه‌های من» ادامه دهید."
        }
        cancelLabel="انصراف"
        confirmLabel="بله، بعداً ادامه می‌دهم"
        tone={atRisk ? "danger" : "default"}
        onCancel={close}
        onConfirm={() => {
          close();
          exit();
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------- header ---

/**
 * The rail's mobile equivalent.
 *
 * `StepRail` is a permanent sidebar on desktop because there is room for one.
 * On a phone the same content — every step, which are done, which is current,
 * which a tap can jump straight to — has nowhere to live permanently without
 * pushing the actual step off the screen, so it lives in a sheet instead: the
 * same rows, opened on demand, closed the moment a choice is made.
 */
function StepPickerSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { index, goTo, maxReachable, draft } = useWizard();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 md:hidden"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="مراحل ثبت اقامتگاه"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-h-[80vh] flex flex-col bg-white rounded-t-20 pt-10 pb-[max(12px,env(safe-area-inset-bottom))]"
      >
        <span
          aria-hidden="true"
          className="mx-auto w-36 h-4 rounded-full bg-gray-E9ECF0 mb-12 shrink-0"
        />
        <div className="flex items-center justify-between px-16 mb-4 shrink-0">
          <h2 className="text-15 leading-24 font-b text-black">مراحل ثبت اقامتگاه</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="w-32 h-32 -ml-6 grid place-items-center rounded-full text-gray-77828F transition-colors hover:bg-gray-F3F5F7"
          >
            <i className="icon-Close text-18" />
          </button>
        </div>
        <ol className="overflow-y-auto px-8 pb-4">
          {STEPS.map((step, i) => {
            const done = !!draft && step.isComplete(draft);
            const current = i === index;
            const reachable = i <= Math.max(maxReachable, index);

            return (
              <li key={step.key}>
                <button
                  type="button"
                  disabled={!reachable}
                  aria-current={current ? "step" : undefined}
                  onClick={() => {
                    goTo(i);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-x-12 px-8 py-11 rounded-12 text-right transition-colors disabled:cursor-not-allowed ${
                    current ? "bg-primary-main/10" : reachable ? "active:bg-gray-F3F5F7" : ""
                  }`}
                >
                  <span
                    className={`w-32 h-32 shrink-0 rounded-full grid place-items-center border-2 ${
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
                    className={`grow min-w-0 truncate text-14 leading-22 ${
                      current
                        ? "font-b text-black"
                        : done
                        ? "font-m text-black"
                        : reachable
                        ? "font-l text-gray-77828F"
                        : "font-l text-gray-A9B1BC"
                    }`}
                  >
                    {step.short}
                  </span>
                  {current && (
                    <span className="shrink-0 text-11 font-m text-primary-dark">همین‌جا</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>,
    document.body
  );
}

function MobileProgress() {
  const { index, step, saveState, draft, maxReachable } = useWizard();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-3 bg-white border-b border-gray-F3F5F7">
      <div className="flex items-center gap-x-10 px-16 pt-12 pb-8">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          aria-haspopup="dialog"
          className="flex items-center gap-x-6 grow min-w-0 -my-4 py-4 text-right transition-opacity active:opacity-60"
        >
          <span className="grow min-w-0 truncate text-12 font-m text-gray-77828F">
            مرحله {faDigits(index + 1)} از {faDigits(TOTAL_STEPS)} · {step.short}
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="shrink-0 text-gray-A9B1BC"
          >
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <SaveStatus state={saveState} />
        <ExitControl variant="mobile" />
      </div>

      {/*
        Discrete segments, one per step, rather than one bar filled to a
        percentage — the same "which of these ten am I on" the desktop rail's
        row of numbered circles answers, just compressed to a strip that fits
        a sticky header. Tapping it opens the same sheet as the label above.
      */}
      <div
        onClick={() => setPickerOpen(true)}
        aria-hidden="true"
        className="w-full flex items-center gap-x-4 px-16 pb-10 cursor-pointer"
      >
        {STEPS.map((s, i) => {
          const done = !!draft && s.isComplete(draft);
          const current = i === index;
          const reachable = i <= Math.max(maxReachable, index);
          return (
            <span
              key={s.key}
              className={`h-4 flex-1 rounded-full transition-colors duration-300 ${
                current
                  ? "bg-primary-main"
                  : done
                  ? "bg-primary-main/60"
                  : reachable
                  ? "bg-primary-main/25"
                  : "bg-gray-F3F5F7"
              }`}
            />
          );
        })}
      </div>
      <div
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-label="پیشرفت ثبت اقامتگاه"
        className="sr-only"
      />

      <StepPickerSheet open={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

// ----------------------------------------------------------------- shell ---

export function WizardShell({ children }: { children: React.ReactNode }) {
  const { index, draft, residenceId, hasFailedSave, retryFailed, saveState } = useWizard();

  return (
    <div className="md:pb-40">
      <MobileProgress />

      <div className="hidden md:flex md:items-center md:justify-between md:mb-24">
        <h1 className="text-22 leading-34 font-b text-black">ثبت اقامتگاه</h1>
        <div className="flex items-center gap-x-16">
          {residenceId && draft?.reference && (
            <span className="text-12 font-l text-gray-77828F">پیش‌نویس {draft.reference}</span>
          )}
          <ExitControl variant="desktop" />
        </div>
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
  /**
   * Runs on «ادامه».
   *
   * Return a list of reasons to stay put; they are shown above the button that
   * refused. Returning nothing means it moved on.
   */
  onNext: () => void | string[] | Promise<void | string[]>;
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
  const [blockers, setBlockers] = useState<string[]>([]);

  /**
   * The page has to reserve exactly as much room as the bar takes.
   *
   * On mobile the action bar is fixed to the bottom, and the shell used to
   * reserve a fixed 104px for it. That was right until the bar grew: a
   * footer note adds a line, and the list of blocking reasons adds several —
   * so the taller the explanation, the more of the page it covered, and the
   * field it was telling the host to fix was the last thing on the page and
   * the first thing hidden. Measured instead of guessed, and re-measured
   * whenever the bar changes size.
   */
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);

  const measure = useCallback(() => {
    const node = barRef.current;
    if (!node) return;
    const height = node.getBoundingClientRect().height;
    setBarHeight((previous) => (Math.abs(previous - height) < 1 ? previous : height));
  }, []);

  useIsomorphicLayoutEffect(measure);

  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure]);

  /**
   * Press «ادامه», and either move or be told why not.
   *
   * The steps already marked their fields red on a failed attempt. That is the
   * right thing and it was not enough: the action bar is pinned to the bottom
   * of a phone screen and the field that failed is usually above the fold, so
   * the host taps a button and watches nothing happen. Two things fix it —
   * the reasons appear right above the button, and the first bad field is
   * scrolled to, so the list and the field agree about where to look.
   */
  const handleNext = useCallback(async () => {
    const result = await onNext();
    const problems = Array.isArray(result) ? result : [];
    setBlockers(problems);
    if (problems.length === 0) return;

    // After the step has re-rendered with its errors marked.
    requestAnimationFrame(() => {
      const target = document.querySelector<HTMLElement>('[data-field-invalid="true"]');
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.querySelector<HTMLElement>("input, textarea, select, button")?.focus({
        preventScroll: true,
      });
    });
  }, [onNext]);

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

      {/* Reserves the bar's real height on mobile; nothing on desktop. */}
      <div className="md:hidden" style={{ height: barHeight }} aria-hidden="true" />

      {/*
        Mobile: fixed to the bottom, above the safe area, on an opaque bar —
        and the spacer above reserves the same height, so the bar never covers
        the last field. Desktop: it simply follows the content.
      */}
      <div
        ref={barRef}
        className="fixed md:static bottom-0 right-0 left-0 z-3 md:z-0 bg-white md:bg-transparent border-t md:border-t-0 border-gray-F3F5F7 px-16 md:px-0 py-12 md:py-0 md:mt-32 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-0"
      >
        {blockers.length > 0 ? (
          <div className="mb-10 max-h-[30vh] overflow-y-auto">
            <Blockers items={blockers} />
          </div>
        ) : (
          footerNote && <div className="mb-10">{footerNote}</div>
        )}
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
            onClick={() => void handleNext()}
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
