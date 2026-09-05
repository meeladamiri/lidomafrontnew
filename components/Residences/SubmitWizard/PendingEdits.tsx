import { useState } from "react";
import BottomSheet from "components/General/core/BottomSheet";
import {
  PENDING_STEP_INDEX,
  PENDING_STEP_LABEL,
  type PendingChanges,
  type PendingGallery,
} from "@/api/Residences/hostWizard";
import { faDigits } from "./ui";

/**
 * «درخواست‌های ویرایش» — what the host changed on a live listing and an admin
 * has not ruled on yet.
 *
 * The banner it replaces said only that *something* was in review, which left
 * a host who edited three screens last week with no way to remember what. So
 * this counts the items, and opening it names each one and what it would
 * become — the proposed value, not a diff, because the host is the one who
 * proposed it and already knows what it used to say.
 */

const FIELD_LABEL: Record<string, string> = {
  name: "نام اقامتگاه",
  hostSuggestedName: "نام پیشنهادی",
  description: "توضیحات",
  region: "منطقه",
  floor: "طبقه",
  totalArea: "متراژ زمین",
  foundationArea: "متراژ بنا",
  capacity: "ظرفیت استاندارد",
  maxCapacity: "حداکثر ظرفیت",
  weekPrice: "نرخ روزهای عادی",
  weekendPrice: "نرخ آخر هفته",
  peakPrice: "نرخ ایام پیک",
  extraPrice: "نرخ نفر اضافه",
  extraGuestsPrice: "نرخ مهمان اضافه",
  weeklyDiscount: "تخفیف هفتگی",
  monthlyDiscount: "تخفیف ماهانه",
  rulesDesc: "توضیح قوانین",
  checkinFrom: "شروع ورود",
  checkinTo: "پایان ورود",
  checkout: "ساعت خروج",
  minReservableDays: "حداقل شب اقامت",
  cancellationPolicy: "قانون کنسلی",
  amenities: "امکانات",
  rules: "قوانین",
  other: "سایر امکانات",
  documentUrl: "سند اقامتگاه",
  hostNationalCardUrl: "کارت ملی میزبان",
  ownerNationalCardUrl: "کارت ملی مالک",
};

const GUEST_UNIT_FIELDS = new Set(["capacity", "maxCapacity"]);
const PRICE_FIELDS = new Set([
  "weekPrice",
  "weekendPrice",
  "peakPrice",
  "extraPrice",
  "extraGuestsPrice",
  "extraGuestsPeakPrice",
]);

function describeValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "خالی شود.";
  if (Array.isArray(value)) return `${faDigits(String(value.length))} مورد انتخاب شود.`;
  if (typeof value === "boolean") return value ? "فعال شود." : "غیرفعال شود.";
  if (typeof value === "number") {
    const digits = faDigits(value.toLocaleString("fa-IR"));
    if (GUEST_UNIT_FIELDS.has(field)) return `${digits} نفر شود.`;
    if (PRICE_FIELDS.has(field)) return `${digits} تومان شود.`;
    return `${digits} شود.`;
  }
  const text = String(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

/** Keys that carry step bookkeeping rather than anything a host chose. */
const IGNORED_FIELDS = new Set(["step", "scopeIds"]);

interface PendingItem {
  stepKey: string;
  label: string;
  detail: string;
}

function galleryItems(gallery: PendingGallery): PendingItem[] {
  const items: PendingItem[] = [];
  if (gallery.add?.length) {
    items.push({
      stepKey: "gallery",
      label: "تصاویر",
      detail: `${faDigits(String(gallery.add.length))} تصویر جدید اضافه شود.`,
    });
  }
  if (gallery.removeIds?.length) {
    items.push({
      stepKey: "gallery",
      label: "تصاویر",
      detail: `${faDigits(String(gallery.removeIds.length))} تصویر حذف شود.`,
    });
  }
  if (gallery.main !== undefined && gallery.main !== null) {
    items.push({ stepKey: "gallery", label: "تصویر اصلی", detail: "تصویر اصلی عوض شود." });
  }
  if (gallery.order?.length && !gallery.add?.length && !gallery.removeIds?.length) {
    items.push({ stepKey: "gallery", label: "ترتیب تصاویر", detail: "ترتیب تصاویر عوض شود." });
  }
  return items;
}

export function pendingItemsOf(pending: PendingChanges | null | undefined): PendingItem[] {
  if (!pending) return [];

  return Object.entries(pending).flatMap(([stepKey, payload]) => {
    if (!payload) return [];
    if (stepKey === "gallery") return galleryItems(payload as PendingGallery);

    return Object.entries(payload as Record<string, unknown>)
      .filter(([field]) => !IGNORED_FIELDS.has(field))
      .map(([field, value]) => ({
        stepKey,
        label: FIELD_LABEL[field] ?? PENDING_STEP_LABEL[stepKey] ?? field,
        detail: describeValue(field, value),
      }));
  });
}

function ReviewBadge() {
  return (
    <span className="shrink-0 rounded-50 bg-warning bg-opacity-20 px-10 py-2 text-11 leading-18 font-m text-[#9A6800]">
      در انتظار بررسی
    </span>
  );
}

/** The inline marker that sits on the step a pending change belongs to. */
export function PendingStepPill({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-x-8 rounded-12 bg-warning bg-opacity-10 px-12 py-8 text-right"
    >
      <span className="flex items-center gap-x-8 text-12 leading-20 font-m text-[#9A6800]">
        <i aria-hidden="true" className="icon-Timer text-16" />
        درانتظار بررسی کارشناس
      </span>
      <i aria-hidden="true" className="icon-FlashLeft text-16 text-[#9A6800]" />
    </button>
  );
}

export function PendingEditsCard({
  pending,
  onGoToStep,
}: {
  pending: PendingChanges | null;
  onGoToStep: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const items = pendingItemsOf(pending);
  if (items.length === 0) return null;

  return (
    <>
      <div className="rounded-16 border-1 border-solid border-warning border-opacity-40 bg-warning bg-opacity-5 px-14 py-12">
        <div className="flex items-center justify-between gap-x-10">
          <div className="flex items-start gap-x-10">
            <i aria-hidden="true" className="icon-Edit mt-2 text-18 text-[#9A6800]" />
            <div>
              <p className="text-14 leading-24 font-m text-black">درخواست‌های ویرایش</p>
              <p className="text-12 leading-20 font-r text-gray-77828F">
                {faDigits(String(items.length))} آیتم درحال بررسی
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex shrink-0 items-center gap-x-4 text-12 leading-20 font-m text-primary-dark"
          >
            جزئیات
            <i aria-hidden="true" className="icon-FlashLeft text-14" />
          </button>
        </div>

        <p className="mt-8 text-11 leading-18 font-r text-gray-77828F">
          تا زمان تأیید کارشناس، نسخه‌ی قبلی روی سایت به مهمان‌ها نشان داده می‌شود.
        </p>
      </div>

      <BottomSheet
        open={open}
        handleClose={() => setOpen(false)}
        headerTitle="درخواست های ویرایش"
        body={({ handleSmoothClose }) => (
          <ul className="flex flex-col gap-y-10 px-16 pb-24">
            {items.map((item, index) => {
              const stepIndex = PENDING_STEP_INDEX[item.stepKey];
              return (
                <li
                  key={`${item.stepKey}-${item.label}-${index}`}
                  className="rounded-14 border-1 border-solid border-gray-F0F0F0 bg-white px-14 py-12"
                >
                  <div className="flex items-center justify-between gap-x-10">
                    <span className="text-14 leading-24 font-m text-black">{item.label}</span>
                    <ReviewBadge />
                  </div>
                  <p className="mt-4 text-12 leading-20 font-r text-gray-77828F">{item.detail}</p>

                  {stepIndex !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSmoothClose();
                        onGoToStep(stepIndex);
                      }}
                      className="mt-8 text-12 leading-20 font-m text-primary-dark underline"
                    >
                      مشاهده‌ی این بخش
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      />
    </>
  );
}
