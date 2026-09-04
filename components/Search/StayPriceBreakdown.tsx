import { useState } from "react";
import dynamic from "next/dynamic";
import type { StayQuote } from "@/components/General/EachNightPriceFrom";

const BottomSheet = dynamic(() => import("../General/core/BottomSheet"), { ssr: true });
const DynamicPriceDetailsBottomSheet = dynamic(
  () => import("../General/PriceDetails/PriceDetailsBottomSheets/DynamicPriceDetailsBottomSheet"),
  { ssr: true }
);

/**
 * "جمع مبلغ برای N شب، M نفر" — the old pattern, restored.
 *
 * It used to be `FinalCheckoutTotal`, which repriced the stay a second time
 * on the client from `IPrices` — a shape the search list hardcodes to zero
 * for everything but the base week/weekend rate, because fetching the peak
 * rate, the extra-guest rate and every discount for every listing on a page
 * of results is wasted work on the far more common search with no dates
 * picked. So that second price was never the peak rate, never a discount,
 * never an extra guest — while the per-night line above it, priced once on
 * the server by the same function the booking box uses, was. Two totals on
 * one card, quietly disagreeing.
 *
 * This reads the one total that was already right. The breakdown sheet reads
 * categories of that same calculation instead of reproducing it.
 */
function StayPriceBreakdown({ stay }: { stay: StayQuote }) {
  const [open, setOpen] = useState(false);
  const { breakdown } = stay;

  return (
    <>
      {/*
        A `<div>`, not a `<button>` — the whole card is already an anchor
        (whole-card-is-a-link), and a `<button>` nested inside an `<a>` is
        invalid HTML that some browsers resolve unpredictably. Matches the
        pattern the like button on this same card already uses.
      */}
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="w-full bg-gray-F4F5F6 rounded-8 py-4 px-8 flex items-center justify-between mt-8 cursor-pointer"
      >
        <div className="flex items-center gap-x-4">
          <span className="text-11 text-black font-r">
            جمع مبلغ برای {stay.guests} نفر <span>{stay.nights}</span> شب:
          </span>
          <span className="text-13 text-black font-m">{stay.total?.toLocaleString("en-US")} تومان</span>
        </div>
        <i aria-hidden="true" className="icon-Warning text-blue-main text-20" />
      </div>

      {open && (
        // Not a portal — this renders where it is mounted, i.e. still inside
        // the card's own `<a>`. Without stopping the click here, tapping a
        // row in the sheet bubbles up to that anchor and opens the listing.
        <div onClick={(e) => e.stopPropagation()}>
          <BottomSheet
            open={open}
            handleClose={() => setOpen(false)}
            headerTitle="جزئیات قیمت"
            body={({ handleSmoothClose }) => (
              <DynamicPriceDetailsBottomSheet
                handleSmoothClose={handleSmoothClose}
                dynamicKeyValuePairs={[
                  { k: `${breakdown.weekdayNights} شب وسط هفته :`, v: breakdown.weekdayTotal },
                  { k: `${breakdown.weekendNights} شب آخر هفته :`, v: breakdown.weekendTotal },
                  { k: `${breakdown.peakNights} شب ایام پیک :`, v: breakdown.peakTotal },
                  {
                    k: `نرخ ${breakdown.extraGuests} نفر اضافه، ${stay.nights} شب :`,
                    v: breakdown.extraGuestsTotal,
                  },
                  { k: "تخفیف :", v: -breakdown.discountAmount },
                ]}
              />
            )}
          />
        </div>
      )}
    </>
  );
}

export default StayPriceBreakdown;
