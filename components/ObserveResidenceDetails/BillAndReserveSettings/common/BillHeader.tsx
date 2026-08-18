import dynamic from "next/dynamic";
const PercentBox = dynamic(() => import("../../../General/PercentBox"), {
  ssr: true,
});
const ResRate = dynamic(() => import("../../../General/ResRate"), {
  ssr: true,
});

function BillHeader({
  discount,
  original_price,
  average_rating,
  reviews_count,
}: {
  discount: number | undefined;
  original_price: number;
  average_rating: number;
  reviews_count: number;
}) {
  return (
    <div className="mb-16 flex items-start justify-between">
      <div>
        {!!discount && (
          <div className="flex items-center gap-x-8 mb-10">
            <PercentBox value={discount} />
            <p className="text-12 leading-16 text-gray-959FA7 font-l line-through">
              {original_price?.toLocaleString()} تومان
            </p>
          </div>
        )}

        <p className="flex items-center gap-x-4">
          <span className="text-14 leading-20 text-gray-959FA7 font-r">هر شب از :</span>
          <span className="text-16 leading-24 text-black font-m">
            {(!discount
              ? original_price
              : original_price - original_price * (discount / 100)
            )?.toLocaleString()}{" "}
            تومان
          </span>
        </p>
      </div>

      {(!!average_rating || !!reviews_count) && (
        <ResRate average_rating={average_rating} reviews_count={reviews_count} />
      )}
    </div>
  );
}

export default BillHeader;
