function SearchedDestinationItem({
  itemType,
  name,
  id,
  isRes,
  //   image,
  onItemClick,
  resCounts,
}: {
  itemType: "city" | "province" | "country" | "region" | "village" | "neighborhood" | null;
  name: string;
  id: number;
  isRes: boolean;
  //   image: string;
  onItemClick: () => void;
  resCounts?: number;
}) {
  return (
    <div
      className="flex items-center justify-between pb-8 last:pb-0 border-b-1 border-solid border-b-gray-CACFD3 last:border-b-0 mb-12 last:mb-0 cursor-pointer group"
      onClick={() => {
        onItemClick();
      }}
    >
      <div className="flex items-center gap-x-12">
        {/* <div className="w-40 h-40 relative">
          <Image src={image} fill style={{ objectFit: "cover" }} alt="" className="rounded-8" />
        </div> */}

        <p className="text-14 leading-20 text-black font-r group-hover:text-primary-main">
          {isRes
            ? "اقامتگاه"
            : itemType === "city"
            ? "شهر"
            : itemType === "province"
            ? "استان"
            : itemType === "country"
            ? "کشور"
            : itemType === "region"
            ? "منطقه"
            : itemType === "village"
            ? "روستا"
            : itemType === "neighborhood"
            ? "محله"
            : ""}{" "}
          {name}
        </p>
      </div>

      {!isRes && !!resCounts && (
        <p className="text-12 leading-16 text-gray-616E7C font-l">{resCounts} اقامتگاه</p>
      )}
    </div>
  );
}

export default SearchedDestinationItem;
