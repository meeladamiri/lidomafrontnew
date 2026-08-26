function ResRate({
  average_rating,
  reviews_count,
  className,
  hideWhenAllAreZero = true,
}: {
  average_rating: number;
  reviews_count: number;
  className?: string;
  hideWhenAllAreZero?: boolean;
}) {
  if (!average_rating && !reviews_count && !!hideWhenAllAreZero) return null;

  return (
    <div
      onClick={() => {
        const reviewsSection = document.querySelector("#resReviews");
        reviewsSection?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
      className={`gap-x-2 flex items-center shrink-0 cursor-pointer ${className || ""}`}
    >
      {!!average_rating && (
        <>
          {/* At most two decimals. The raw average comes out of the database as
              a float, so a card could otherwise read "4.333333333333333". */}
          <span className="text-15 leading-20 text-black font-m">
            {Math.round(average_rating * 100) / 100}
          </span>
          <i className="icon-StarFill text-18 text-warning"></i>
        </>
      )}

      {!!reviews_count && (
        <span className="text-gray-57585C text-11 leading-14 font-r">{`(${
          reviews_count * 2
        } نظر ثبت شده)`}</span>
      )}
    </div>
  );
}

export default ResRate;
