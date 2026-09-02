import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitForReview } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { legacyStep, requiredSteps, STEPS, TOTAL_STEPS } from "../steps";
import { useWizard } from "../useWizard";
import { policyByValue } from "../cancellation";
import { Callout, faDigits, grouped, Section, StepSkeleton } from "../ui";

/**
 * The last screen: what the listing looks like, what is still missing, and the
 * one button that hands it to a reviewer.
 *
 * The preview is built from the saved draft, not from anything held in memory
 * — so it shows what a reviewer will actually open, including the bits a host
 * thinks they filled in and did not.
 *
 * Submitting is idempotent. `PATCH /state` sets a state rather than appending
 * anything, so a second press, a retry after a timeout, or a refresh mid-
 * request all end in the same place. That is what makes it safe to leave the
 * button pressable when a host is not sure the first press registered.
 */

export default function ReviewStep() {
  const { draft, save, saveState, goTo, reload, residenceId } = useWizard();
  const [submitted, setSubmitted] = useState(false);

  // The summary is the one screen where stale is worse than slow: a host is
  // about to sign off on it.
  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceId]);

  const gaps = useMemo(() => {
    if (!draft) return [];
    return requiredSteps()
      .map((step) => ({ step, index: STEPS.indexOf(step) }))
      .filter(({ step }) => !step.isComplete(draft));
  }, [draft]);

  if (!draft) return <StepSkeleton />;

  const alreadyPending = draft.state === "PENDING" || submitted;
  const cover = draft.images?.find((image) => image.isMain) ?? draft.images?.[0];
  const policy = policyByValue(draft.cancellationPolicy);

  async function onSubmit() {
    if (gaps.length > 0) {
      goTo(gaps[0].index);
      return;
    }
    const ok = await save(async (id) => submitForReview(id, legacyStep(TOTAL_STEPS - 1)), {
      reload: true,
    });
    if (ok) setSubmitted(true);
  }

  if (alreadyPending) {
    return (
      <div className="py-24 text-center">
        <span className="inline-grid place-items-center w-72 h-72 rounded-full bg-green-light">
          <i className="icon-Success text-36 text-success" />
        </span>
        <h2 className="text-20 font-b text-black mt-20">اقامتگاه شما ثبت شد</h2>
        <p className="text-14 leading-26 font-l text-gray-77828F mt-8 max-w-[420px] mx-auto">
          کارشناسان لیدوما آن را بررسی می‌کنند و نتیجه را به شما اطلاع می‌دهیم. تا آن زمان
          می‌توانید اطلاعات را ویرایش کنید.
        </p>
        {draft.reference && (
          <p className="text-12 font-m text-gray-77828F mt-12">کد پیگیری: {draft.reference}</p>
        )}
        <div className="flex items-center justify-center gap-x-12 mt-24">
          <Link
            href="/residences/list"
            className="h-[48px] px-24 rounded-12 bg-primary-main text-14 font-b text-black flex items-center"
          >
            اقامتگاه‌های من
          </Link>
          <button
            type="button"
            onClick={() => goTo(0)}
            className="h-[48px] px-24 rounded-12 border border-gray-DBDFE5 text-14 font-m text-black"
          >
            ویرایش اطلاعات
          </button>
        </div>
      </div>
    );
  }

  const rows: [string, React.ReactNode][] = [
    ["نوع", draft.region || "—"],
    [
      "شهر",
      draft.location
        ? `${draft.location.parent?.name ? draft.location.parent.name + "، " : ""}${draft.location.name}`
        : "—",
    ],
    [
      "ظرفیت",
      draft.capacity
        ? `${faDigits(draft.capacity)} نفر${
            draft.maxCapacity && draft.maxCapacity > draft.capacity
              ? ` (تا ${faDigits(draft.maxCapacity)} نفر)`
              : ""
          }`
        : "—",
    ],
    ["اتاق", draft.rooms?.length ? `${faDigits(draft.rooms.length)} اتاق` : "—"],
    ["نرخ پایه", draft.weekPrice ? `${grouped(draft.weekPrice)} تومان` : "—"],
    [
      "نرخ نفر اضافه",
      draft.extraGuestsPrice ? `${grouped(draft.extraGuestsPrice)} تومان` : "—",
    ],
    ["امکانات", `${faDigits(draft.amenities?.length ?? 0)} مورد`],
    [
      "پذیرش و تخلیه",
      draft.checkinFrom && draft.checkout
        ? `از ${faDigits(draft.checkinFrom)} تا ${faDigits(draft.checkout)}`
        : "—",
    ],
    ["قانون لغو", policy?.label ?? draft.cancellationPolicy ?? "—"],
  ];

  return (
    <StepLayout
      onNext={onSubmit}
      busy={saveState === "saving"}
      nextLabel={gaps.length > 0 ? "تکمیل موارد باقی‌مانده" : "ثبت نهایی اقامتگاه"}
      footerNote={
        gaps.length === 0 ? (
          <p className="text-12 font-l text-gray-77828F text-center">
            پس از ثبت، اقامتگاه برای بررسی کارشناس ارسال می‌شود.
          </p>
        ) : null
      }
    >
      {gaps.length > 0 && (
        <div className="mb-20">
          <Callout tone="warning">
            <p className="font-m mb-6">برای ثبت نهایی، این موارد باقی مانده است:</p>
            <ul className="flex flex-col gap-y-4">
              {gaps.map(({ step, index }) => (
                <li key={step.key}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className="text-13 font-m text-blue-main underline"
                  >
                    {step.short} — {step.title}
                  </button>
                </li>
              ))}
            </ul>
          </Callout>
        </div>
      )}

      {/* The card as a guest would meet it in search results. */}
      <Section title="پیش‌نمایش" description="اقامتگاه شما در نتایج جست‌وجو این‌طور دیده می‌شود.">
        <article className="rounded-16 overflow-hidden border border-gray-DBDFE5">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover.url}
              alt={draft.name || "تصویر اقامتگاه"}
              className="w-full aspect-[16/10] object-cover"
            />
          ) : (
            <div className="w-full aspect-[16/10] bg-gray-F3F5F7 grid place-items-center">
              <div className="text-center">
                <i className="icon-Photo text-32 text-gray-A9B1BC" />
                <p className="text-12 font-l text-gray-77828F mt-6">بدون تصویر</p>
              </div>
            </div>
          )}
          <div className="p-16">
            <h3 className="text-16 font-b text-black">{draft.name || "بدون نام"}</h3>
            {draft.location && (
              <p className="flex items-center gap-x-4 text-12 font-l text-gray-77828F mt-4">
                <i className="icon-Location text-14" />
                {draft.location.parent?.name ? `${draft.location.parent.name}، ` : ""}
                {draft.location.name}
              </p>
            )}
            {draft.weekPrice ? (
              <p className="text-14 font-b text-black mt-10">
                {grouped(draft.weekPrice)}{" "}
                <span className="text-12 font-l text-gray-77828F">تومان / هر شب</span>
              </p>
            ) : null}
          </div>
        </article>
      </Section>

      <Section title="خلاصه اطلاعات">
        <dl className="rounded-16 border border-gray-DBDFE5 divide-y divide-gray-F3F5F7">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-x-16 px-16 py-12">
              <dt className="text-13 font-l text-gray-77828F shrink-0">{label}</dt>
              <dd className="text-13 font-m text-black text-left">{value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      {draft.description && (
        <Section title="درباره اقامتگاه">
          <p className="text-13 leading-24 font-l text-black whitespace-pre-line">
            {draft.description}
          </p>
        </Section>
      )}

      <Callout tone="info">
        بررسی معمولاً یک تا سه روز کاری طول می‌کشد. اگر موردی لازم باشد، کارشناس با شما تماس
        می‌گیرد.
      </Callout>
    </StepLayout>
  );
}
