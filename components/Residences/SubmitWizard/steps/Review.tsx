import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitForReview } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { legacyStep, requiredSteps, STEPS, TOTAL_STEPS } from "../steps";
import { useWizard } from "../useWizard";
import { policyLabel } from "../cancellation";
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
  const { draft, save, saveState, goTo, reload, residenceId, hasFailedSave } = useWizard();
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

  async function onSubmit() {
    // An earlier step's write is still outstanding. Submitting now would hand
    // a reviewer a listing missing whatever that step held.
    if (hasFailedSave) return;
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
          کارشناسان لیدوما آن را بررسی می‌کنند و نتیجه را به شما اطلاع می‌دهیم. تا آن زمان می‌توانید
          اطلاعات را ویرایش کنید.
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

  /**
   * Every line says where it came from, and goes back there.
   *
   * A summary that can only be read sends a host who spots a wrong price
   * hunting through ten steps for the one that owns it. The step key is the
   * same one the rail uses, so a row can never point at a screen that has
   * moved.
   */
  const stepIndex = (key: string) => STEPS.findIndex((s) => s.key === key);

  const rows: { label: string; value: React.ReactNode; step: string }[] = [
    { label: "نام", value: draft.name || "—", step: "specs" },
    { label: "نوع و منطقه", value: draft.region || "—", step: "details" },
    {
      label: "شهر",
      value: draft.location
        ? `${draft.location.parent?.name ? draft.location.parent.name + "، " : ""}${
            draft.location.name
          }`
        : "—",
      step: "address",
    },
    { label: "نشانی", value: draft.address || "—", step: "address" },
    {
      label: "ظرفیت",
      value: draft.capacity
        ? `${faDigits(draft.capacity)} نفر${
            draft.maxCapacity && draft.maxCapacity > draft.capacity
              ? ` (تا ${faDigits(draft.maxCapacity)} نفر)`
              : ""
          }`
        : "—",
      step: "capacity",
    },
    {
      label: "اتاق",
      value: draft.rooms?.length ? `${faDigits(draft.rooms.length)} اتاق` : "—",
      step: "capacity",
    },
    {
      label: "امکانات",
      value: `${faDigits(draft.amenities?.length ?? 0)} مورد`,
      step: "amenities",
    },
    {
      label: "نرخ پایه",
      value: draft.weekPrice ? `${grouped(draft.weekPrice)} تومان` : "—",
      step: "pricing",
    },
    {
      label: "نرخ نفر اضافه",
      value: draft.extraGuestsPrice ? `${grouped(draft.extraGuestsPrice)} تومان` : "—",
      step: "pricing",
    },
    {
      label: "تصاویر",
      value: `${faDigits(draft.images?.length ?? 0)} تصویر`,
      step: "images",
    },
    {
      label: "مدارک",
      value: draft.hostNationalCardUrl && draft.documentUrl ? "بارگذاری شده" : "ناقص",
      step: "documents",
    },
    {
      label: "پذیرش و تخلیه",
      value:
        draft.checkinFrom && draft.checkout
          ? `از ${faDigits(draft.checkinFrom)} تا ${faDigits(draft.checkout)}`
          : "—",
      step: "rules",
    },
    { label: "قانون لغو", value: policyLabel(draft.cancellationPolicy), step: "rules" },
  ];

  return (
    <StepLayout
      onNext={onSubmit}
      busy={saveState === "saving"}
      nextDisabled={hasFailedSave}
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

      <Section title="خلاصه اطلاعات" description="هر سطر را از همین‌جا می‌توانید ویرایش کنید.">
        <dl className="rounded-16 border border-gray-DBDFE5 divide-y divide-gray-F3F5F7">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-x-12 px-16 py-12">
              <dt className="text-13 font-l text-gray-77828F shrink-0">{row.label}</dt>
              <dd className="flex items-center gap-x-10 min-w-0">
                <span className="text-13 font-m text-black text-left truncate">{row.value}</span>
                <button
                  type="button"
                  onClick={() => goTo(stepIndex(row.step))}
                  aria-label={`ویرایش ${row.label}`}
                  className="w-28 h-28 shrink-0 rounded-8 grid place-items-center text-gray-A9B1BC hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
                >
                  <i className="icon-Edit text-16" />
                </button>
              </dd>
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
