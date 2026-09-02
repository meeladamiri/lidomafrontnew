import React, { useEffect, useState } from "react";
import { uploadDocuments } from "@/api/Residences/hostWizard";
import { StepLayout } from "../Shell";
import { useWizard } from "../useWizard";
import { Callout, Spinner, StepSkeleton, faDigits } from "../ui";
import { humanSize, shrink, validate } from "../imageTools";

/**
 * Step eight: proof that the place is yours to let.
 *
 * Three files, one request. The owner's card is only asked for when the owner
 * is somebody else, because asking every host for a document two thirds of
 * them do not have is how a step gets abandoned.
 *
 * These are identity documents. The screen says who sees them, and nothing
 * here is mirrored into localStorage — the rescue copy the other steps keep
 * would be a copy of a national ID card sitting in a browser profile.
 */

type Slot = "hostNationalCard" | "document" | "ownerNationalCard";

const SLOTS: {
  key: Slot;
  label: string;
  hint: string;
  required: boolean;
  icon: string;
  urlField: "hostNationalCardUrl" | "documentUrl" | "ownerNationalCardUrl";
}[] = [
  {
    key: "hostNationalCard",
    label: "کارت ملی میزبان",
    hint: "تصویر روی کارت ملی خودتان، خوانا و بدون انعکاس نور.",
    required: true,
    icon: "icon-BirthCertificate",
    urlField: "hostNationalCardUrl",
  },
  {
    key: "document",
    label: "سند مالکیت یا اجاره‌نامه",
    hint: "صفحه‌ای که نشانی و نام مالک در آن دیده می‌شود.",
    required: true,
    icon: "icon-Attach",
    urlField: "documentUrl",
  },
  {
    key: "ownerNationalCard",
    label: "کارت ملی مالک",
    hint: "فقط اگر مالک اقامتگاه شخص دیگری است.",
    required: false,
    icon: "icon-BirthCertificate",
    urlField: "ownerNationalCardUrl",
  },
];

export default function DocumentsStep() {
  const { draft, save, saveState, next, setDirty } = useWizard();
  const [files, setFiles] = useState<Partial<Record<Slot, File>>>({});
  const [errors, setErrors] = useState<Partial<Record<Slot, string>>>({});
  const [previews, setPreviews] = useState<Partial<Record<Slot, string>>>({});
  const [percent, setPercent] = useState(0);
  const [attempted, setAttempted] = useState(false);

  useEffect(
    () => () => {
      Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url));
    },
    [previews]
  );

  useEffect(() => {
    setDirty(Object.keys(files).length > 0);
  }, [files, setDirty]);

  function pick(slot: Slot, file: File | undefined) {
    if (!file) return;
    const problem = validate(file);
    if (problem) {
      setErrors((previous) => ({ ...previous, [slot]: problem }));
      return;
    }
    setErrors((previous) => ({ ...previous, [slot]: undefined }));
    setFiles((previous) => ({ ...previous, [slot]: file }));
    setPreviews((previous) => {
      if (previous[slot]) URL.revokeObjectURL(previous[slot] as string);
      return { ...previous, [slot]: URL.createObjectURL(file) };
    });
  }

  const storedUrl = (slot: (typeof SLOTS)[number]) =>
    (draft?.[slot.urlField] as string | null) || null;

  const missing = SLOTS.filter(
    (slot) => slot.required && !files[slot.key] && !storedUrl(slot)
  );

  async function onNext() {
    setAttempted(true);
    if (missing.length > 0) return;

    // Nothing new to send: the documents already on the listing are enough.
    if (Object.keys(files).length === 0) {
      next();
      return;
    }

    setPercent(0);
    const prepared: Partial<Record<Slot, File>> = {};
    for (const [slot, file] of Object.entries(files) as [Slot, File][]) {
      prepared[slot] = await shrink(file);
    }

    const ok = await save(
      async (id) => uploadDocuments(id, prepared, setPercent),
      { reload: true }
    );
    if (ok) {
      setFiles({});
      setDirty(false);
      next();
    }
  }

  if (!draft) return <StepSkeleton />;

  return (
    <StepLayout
      onNext={onNext}
      busy={saveState === "saving"}
      footerNote={
        attempted && missing.length > 0 ? (
          <p role="alert" className="text-12 font-m text-error-light text-center">
            {missing.map((slot) => slot.label).join(" و ")} هنوز بارگذاری نشده است.
          </p>
        ) : percent > 0 && percent < 100 && saveState === "saving" ? (
          <div className="h-4 rounded-full bg-gray-DBDFE5 overflow-hidden">
            <div
              className="h-full bg-primary-main transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        ) : null
      }
    >
      <Callout tone="info">
        این مدارک فقط برای احراز مالکیت است و در صفحه‌ی عمومی اقامتگاه نمایش داده نمی‌شود. تنها
        کارشناسان لیدوما به آن دسترسی دارند.
      </Callout>

      <div className="flex flex-col gap-y-12 mt-16">
        {SLOTS.map((slot) => {
          const chosen = files[slot.key];
          const stored = storedUrl(slot);
          const preview = previews[slot.key] || stored;
          const showMissing = attempted && slot.required && !chosen && !stored;

          return (
            <div
              key={slot.key}
              className={`rounded-16 border p-14 transition-colors ${
                showMissing || errors[slot.key]
                  ? "border-error-light"
                  : chosen || stored
                    ? "border-primary-main bg-primary-light/20"
                    : "border-gray-DBDFE5"
              }`}
            >
              <div className="flex items-start gap-x-12">
                <span className="w-48 h-48 shrink-0 rounded-10 bg-gray-F3F5F7 overflow-hidden grid place-items-center">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <i className={`${slot.icon} text-20 text-gray-A9B1BC`} />
                  )}
                </span>

                <div className="grow min-w-0">
                  <p className="text-14 font-m text-black">
                    {slot.label}
                    {!slot.required && (
                      <span className="text-12 font-l text-gray-77828F mr-6">(اختیاری)</span>
                    )}
                  </p>
                  <p className="text-12 leading-20 font-l text-gray-77828F mt-2">{slot.hint}</p>

                  {errors[slot.key] ? (
                    <p role="alert" className="text-12 font-m text-error-light mt-6">
                      {errors[slot.key]}
                    </p>
                  ) : chosen ? (
                    <p className="text-12 font-m text-primary-dark mt-6">
                      <i className="icon-Tick text-12 ml-4" />
                      انتخاب شد · {humanSize(chosen.size)}
                    </p>
                  ) : stored ? (
                    <p className="text-12 font-m text-success mt-6">
                      <i className="icon-Success text-12 ml-4" />
                      قبلاً بارگذاری شده
                    </p>
                  ) : null}
                </div>

                <label className="shrink-0 self-center">
                  <span className="h-[36px] px-14 rounded-10 border border-gray-DBDFE5 text-12 font-m text-black flex items-center cursor-pointer transition-colors hover:border-primary-main">
                    {chosen || stored ? "تغییر" : "انتخاب"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => pick(slot.key, e.target.files?.[0])}
                    aria-label={slot.label}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {saveState === "saving" && (
        <p className="flex items-center justify-center gap-x-8 text-12 font-l text-gray-77828F mt-16">
          <Spinner className="!w-16 !h-16" />
          در حال بارگذاری {faDigits(percent)}٪
        </p>
      )}
    </StepLayout>
  );
}
