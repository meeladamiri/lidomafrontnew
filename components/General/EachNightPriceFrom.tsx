import dynamic from "next/dynamic";
// import Image from "next/image";

const PercentBox = dynamic(() => import("./PercentBox"), {
  ssr: true,
});

export interface StayQuote {
  nights: number;
  total: number;
  perNight: number;
  discountPercent: number;
  guests: number;
  breakdown: {
    weekdayNights: number;
    weekdayTotal: number;
    weekendNights: number;
    weekendTotal: number;
    peakNights: number;
    peakTotal: number;
    extraGuests: number;
    extraGuestsTotal: number;
    discountAmount: number;
  };
}

/**
 * The price on a listing card.
 *
 * Two modes. With no dates chosen it is the "from" price, as before. Once the
 * reader has picked dates the card quotes *their* stay: the per-night figure
 * for those nights and the total for all of them, priced by the same
 * calculation the booking box uses. Showing the base week rate against a chosen
 * date range quotes a number the reader will not be charged.
 */
function EachNightPriceFromWithDiscount({
  discountP,
  price,
  nowruzPrice,
  stay,
}: {
  discountP?: number;
  price: number;
  nowruzPrice?: number;
  stay?: StayQuote | null;
}) {
  if (stay && stay.nights > 0) {
    return (
      <div className="text-14 leading-24 text-black font-m">
        <div className="flex items-center gap-x-4">
          <p>{stay.perNight?.toLocaleString("en-US")}</p>
          <p>تومان</p>
          <p className="text-12 text-gray-6C6A7D leading-14 font-r">هر شب</p>
          {!!stay.discountPercent && <PercentBox value={stay.discountPercent} />}
        </div>
      </div>
    );
  }

  return (
    <div className="text-14 leading-24 text-black font-m flex items-center gap-x-4">
      {/* <Image alt="نوروز" src="/assets/non-icomoon-icons/nowruz.svg" width={28} height={28} /> */}
      <p className="text-12 text-gray-6C6A7D leading-14 font-r">هر شب از :</p>
      {!!discountP && (
        <div className="text-12 leading-21 text-gray-77828F font-l line-through ml-4 flex items-center gap-x-4">
          <p>{price?.toLocaleString("en-US")}</p>
          <p>تومان</p>
        </div>
      )}
      <div className="flex items-center gap-x-4">
        <p>{(!!discountP ? price - price * (discountP / 100) : price)?.toLocaleString("en-US")}</p>
        <p>تومان</p>
      </div>
      {!!discountP && (
        <PercentBox
          value={discountP}
          // className="mr-8"
        />
      )}
    </div>
  );
}
export default EachNightPriceFromWithDiscount;
