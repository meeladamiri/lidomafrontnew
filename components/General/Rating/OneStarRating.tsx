function OneStarRating({
  rating,
  ratingNumberClassname = "",
  containerClassname = "",
}: {
  rating: number;
  ratingNumberClassname?: string;
  containerClassname?: string;
}) {
  return (
    <div className={`flex items-baseline ${containerClassname}`}>
      <p className={`ml-4 text-21 leading-28 text-black font-m ${ratingNumberClassname}`}>
        {rating}
      </p>
      <i className="icon-StarFill text-warning text-20"></i>
    </div>
  );
}

export default OneStarRating;
