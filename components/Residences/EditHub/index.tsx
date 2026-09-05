import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { STEPS, DEFAULT_NAME, MIN_IMAGES } from "../SubmitWizard/steps";
import { STEP_COMPONENTS } from "../SubmitWizard/stepComponents";
import { WizardProvider, useWizard } from "../SubmitWizard/useWizard";
import { StepBlocked } from "../SubmitWizard/Shell";
import { PendingEditsCard } from "../SubmitWizard/PendingEdits";
import { Callout, faDigits, grouped, StepSkeleton } from "../SubmitWizard/ui";
import { SECTION_LABEL, SECTION_STEP_INDEX, type Draft } from "@/api/Residences/hostWizard";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

/**
 * ویرایش اقامتگاه — one page, every part of a listing.
 *
 * The wizard is the right shape for building a listing once: ten screens in an
 * order, each gated on the last. It is the wrong shape for changing the
 * checkout time of a listing that has been live for a year, which is what a
 * host actually comes here to do — under the wizard that meant walking, or
 * guessing a `?step=` number, and the step rail kept insisting there was a
 * next step when there was only an errand.
 *
 * So the same ten forms are reached from a hub instead: every section listed
 * with what it currently says, each one opened, saved and closed on its own.
 * Nothing here re-implements a form — the steps are rendered exactly as the
 * wizard renders them, in `mode="edit"` (see useWizard), which is what turns
 * «ذخیره و ادامه» into «ذخیره تغییرات» and «بعدی» into «back to this list».
 */

const has = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== "";

/** What each row says under its title: the current value, in the fewest words
 * that still tell a host whether they need to open it. */
function summarize(key: string, draft: Draft): string {
  switch (key) {
    case "details": {
      const type = TYPE_LABEL[draft.type] ?? "—";
      return [type, draft.region].filter(has).join("، ") || "تکمیل نشده";
    }
    case "specs":
      return has(draft.name) && draft.name !== DEFAULT_NAME ? (draft.name as string) : "بدون نام";
    case "address": {
      const city = [draft.location?.parent?.name, draft.location?.name].filter(Boolean).join("، ");
      return [city, draft.address].filter(has).join(" — ") || "ثبت نشده";
    }
    case "capacity": {
      const rooms = draft.rooms?.filter((r) => r.name !== "فضای مشترک").length ?? 0;
      const guests = draft.capacity ? `${faDigits(draft.capacity)} نفر` : "ظرفیت ثبت نشده";
      // A middle dot between two Persian numerals reads as a digit group
      // separator; a comma does not.
      return rooms > 0 ? `${guests}، ${faDigits(rooms)} اتاق` : guests;
    }
    case "amenities": {
      const count = draft.amenities?.length ?? 0;
      return count > 0 ? `${faDigits(count)} مورد انتخاب شده` : "هنوز انتخاب نشده";
    }
    case "pricing":
      return draft.weekPrice
        ? `${grouped(draft.weekPrice)} تومان در شب`
        : "نرخی ثبت نشده";
    case "images": {
      const count = draft.images?.length ?? 0;
      if (count === 0) return "بدون تصویر";
      return count < MIN_IMAGES
        ? `${faDigits(count)} تصویر — دست‌کم ${faDigits(MIN_IMAGES)} تا لازم است`
        : `${faDigits(count)} تصویر`;
    }
    case "documents": {
      const done = [draft.hostNationalCardUrl, draft.documentUrl].filter(has).length;
      return done === 2 ? "بارگذاری شده" : done === 0 ? "بارگذاری نشده" : "ناقص";
    }
    case "rules": {
      const checkin = draft.checkinFrom ? `ورود ${draft.checkinFrom}` : null;
      const checkout = draft.checkout ? `خروج ${draft.checkout}` : null;
      return [checkin, checkout].filter(Boolean).join("، ") || "ثبت نشده";
    }
    default:
      return "";
  }
}

const TYPE_LABEL: Record<string, string> = {
  SUIT: "ویلا و سوئیت",
  BOOMGARDI: "بوم‌گردی",
  HOTEL: "هتل",
};

/** The hub's own grouping. The wizard's order is a path through a form; this
 * is how a host thinks about their listing when something needs changing. */
const GROUPS: { title: string; keys: string[] }[] = [
  { title: "معرفی اقامتگاه", keys: ["details", "specs", "address"] },
  { title: "فضا و امکانات", keys: ["capacity", "amenities"] },
  { title: "نرخ و قوانین", keys: ["pricing", "rules"] },
  { title: "تصاویر و مدارک", keys: ["images", "documents"] },
];

function StatusBadge({ draft }: { draft: Draft }) {
  const openDefects = draft.defects?.filter((d) => !d.resolvedAt) ?? [];

  // Opacity steps here have to be ones Tailwind actually generates — `15` is
  // not on the default scale, and a class that does not exist leaves the pill
  // fully saturated, which put same-colour text on a solid background.
  const badge = draft.suspendedAt
    ? { text: "معلق شده", className: "bg-warning bg-opacity-20 text-[#9A6800]" }
    : openDefects.length > 0
      ? { text: "دارای نقص", className: "bg-error-light bg-opacity-10 text-error-light" }
      : draft.state === "DEACTIVATED"
        ? { text: "غیرفعال", className: "bg-gray-F3F5F7 text-gray-77828F" }
        : draft.state === "PENDING"
          ? { text: "در انتظار تایید", className: "bg-warning bg-opacity-20 text-[#9A6800]" }
          : draft.state === "DRAFT"
            ? { text: "پیش‌نویس", className: "bg-gray-F3F5F7 text-gray-77828F" }
            : draft.published
              ? { text: "فعال", className: "bg-success bg-opacity-10 text-[#0A8F0A]" }
              : { text: "نمایش داده نمی‌شود", className: "bg-gray-F3F5F7 text-gray-77828F" };

  return (
    <span className={`shrink-0 rounded-50 px-12 py-4 text-12 leading-20 font-m ${badge.className}`}>
      {badge.text}
    </span>
  );
}

function ListingHeader({ draft }: { draft: Draft }) {
  const cover = draft.images?.[0]?.url;
  const code = draft.reference?.startsWith("ODOO-")
    ? Number(draft.reference.slice(5)) || draft.id
    : draft.id;

  return (
    <div className="rounded-20 border border-gray-DBDFE5 bg-white p-14 md:p-16">
      <div className="flex items-start gap-x-14">
        <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-14 overflow-hidden bg-gray-F3F5F7 grid place-items-center">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <i aria-hidden="true" className="icon-Photo text-24 text-gray-A9B1BC" />
          )}
        </div>

        <div className="min-w-0 grow">
          <div className="flex items-start justify-between gap-x-10">
            <h1 className="text-16 md:text-18 leading-28 font-b text-black truncate">
              {has(draft.name) && draft.name !== DEFAULT_NAME ? draft.name : "اقامتگاه بدون نام"}
            </h1>
            <StatusBadge draft={draft} />
          </div>

          <p className="text-12 leading-20 font-l text-gray-77828F mt-4">
            کد {faDigits(code)}
            {draft.location?.name ? `، ${draft.location.name}` : ""}
          </p>

          <div className="grid grid-cols-2 gap-8 mt-10 md:flex md:flex-wrap md:items-center">
            {draft.published && (
              <Link
                href={getPropertyPageUrl({ residenceId: code })}
                prefetch={false}
                className="h-[36px] px-12 rounded-10 border border-gray-DBDFE5 text-12 font-m text-black inline-flex items-center justify-center gap-x-6 hover:border-gray-A9B1BC transition-colors"
              >
                <i aria-hidden="true" className="icon-See text-14" />
                مشاهده در سایت
              </Link>
            )}
            <Link
              href="/residences/calendar"
              prefetch={false}
              className="h-[32px] px-12 rounded-10 border border-gray-DBDFE5 text-12 font-m text-black inline-flex items-center gap-x-6 hover:border-gray-A9B1BC transition-colors"
            >
              <i aria-hidden="true" className="icon-Calendar text-14" />
              تقویم و نرخ روزانه
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Suspension and defects, said once at the top — the same three things the
 * wizard's banner says, minus the «درخواست بررسی مجدد» flow, which lives with
 * the defects it belongs to. */
function StatusNotes({ draft, onGoToStep }: { draft: Draft; onGoToStep: (i: number) => void }) {
  const openDefects = draft.defects?.filter((d) => !d.resolvedAt && !d.reviewRequestedAt) ?? [];

  return (
    <div className="flex flex-col gap-y-10">
      {!!draft.suspendedAt && (
        <Callout tone="error">
          این اقامتگاه توسط کارشناس معلق شده و در سایت نمایش داده نمی‌شود.
          {draft.suspensionReason ? ` دلیل: ${draft.suspensionReason}` : ""}
        </Callout>
      )}

      {openDefects.length > 0 && (
        <Callout tone="warning">
          <div className="flex flex-col gap-y-8">
            <span className="font-m">
              کارشناس {faDigits(openDefects.length)} نقص روی این اقامتگاه ثبت کرده است.
            </span>
            <ul className="flex flex-col gap-y-6">
              {openDefects.map((defect) => {
                const stepIndex = SECTION_STEP_INDEX[defect.section];
                return (
                  <li
                    key={defect.id}
                    className="flex items-start justify-between gap-x-10 text-12 leading-20"
                  >
                    <span>
                      <b className="font-m">{SECTION_LABEL[defect.section]}</b>
                      {defect.severity === "MANDATORY" && (
                        <span className="text-error-light"> (اجباری)</span>
                      )}
                      {" — "}
                      {defect.description}
                    </span>
                    {stepIndex !== undefined && (
                      <button
                        type="button"
                        onClick={() => onGoToStep(stepIndex)}
                        className="shrink-0 font-m text-primary-dark underline"
                      >
                        رفع نقص
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Callout>
      )}

      {!!draft.pendingChangesSubmittedAt && (
        <PendingEditsCard pending={draft.pendingChanges} onGoToStep={onGoToStep} />
      )}
    </div>
  );
}

function SectionRow({
  index,
  draft,
  onOpen,
}: {
  index: number;
  draft: Draft;
  onOpen: () => void;
}) {
  const step = STEPS[index];
  const complete = step.isComplete(draft);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full flex items-center gap-x-12 px-14 py-13 text-right transition-colors hover:bg-gray-F8F8F8 focus-visible:outline-none focus-visible:bg-gray-F8F8F8"
    >
      <span className="w-40 h-40 shrink-0 rounded-12 bg-gray-F3F5F7 grid place-items-center">
        <i aria-hidden="true" className={`${step.icon} text-20 text-gray-77828F`} />
      </span>

      <span className="min-w-0 grow">
        <span className="flex items-center gap-x-8">
          <span className="text-14 leading-24 font-m text-black">{step.short}</span>
          {!complete && !step.optional && (
            <span className="shrink-0 rounded-50 bg-warning bg-opacity-20 px-8 py-1 text-11 leading-18 font-m text-[#9A6800]">
              ناقص
            </span>
          )}
        </span>
        <span className="block truncate text-12 leading-20 font-l text-gray-77828F mt-2">
          {summarize(step.key, draft)}
        </span>
      </span>

      <i aria-hidden="true" className="icon-FlashLeft shrink-0 text-16 text-gray-A9B1BC" />
    </button>
  );
}

function Hub() {
  const { draft, goTo } = useWizard();
  if (!draft) return <StepSkeleton />;

  return (
    <div className="flex flex-col gap-y-16 pb-40">
      <ListingHeader draft={draft} />

      <StatusNotes draft={draft} onGoToStep={goTo} />

      {GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="text-13 leading-22 font-m text-gray-77828F mb-8 px-2">{group.title}</h2>
          <div className="rounded-20 border border-gray-DBDFE5 bg-white overflow-hidden divide-y divide-gray-F3F5F7">
            {group.keys.map((key) => {
              const index = STEPS.findIndex((s) => s.key === key);
              if (index === -1) return null;
              return (
                <SectionRow key={key} index={index} draft={draft} onOpen={() => goTo(index)} />
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function EditBody() {
  const { openSection, index, isLoading, loadError, reload, draft, residenceId } = useWizard();

  if (residenceId && isLoading && !draft) return <StepSkeleton />;

  if (residenceId && loadError) {
    return (
      <StepBlocked
        message="اطلاعات این اقامتگاه بارگذاری نشد. ممکن است حذف شده باشد یا متعلق به حساب دیگری باشد."
        onRetry={() => void reload()}
      />
    );
  }

  if (!openSection) return <Hub />;

  const Step = STEP_COMPONENTS[index] ?? STEP_COMPONENTS[0];
  // Keyed by section so one section's form state never leaks into the next.
  return <Step key={openSection} />;
}

export default function EditResidence() {
  const router = useRouter();

  const residenceId = useMemo(() => {
    const raw = Number(router.query?.id);
    return Number.isFinite(raw) && raw > 0 ? raw : undefined;
  }, [router.query?.id]);

  // The route param arrives on the client after hydration.
  if (!residenceId) return <StepSkeleton />;

  return (
    <WizardProvider mode="edit" residenceId={residenceId}>
      <div className="px-16 md:px-0 pt-16 md:pt-0 max-w-[720px] mx-auto">
        <EditBody />
      </div>
    </WizardProvider>
  );
}
