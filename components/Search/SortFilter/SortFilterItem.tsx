function SortFilterItem({
  onClick,
  filterName,
  selectedItem,
}: {
  onClick: () => void;
  filterName: string;
  selectedItem: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        relative shrink-0
          cursor-pointer
           flex items-center justify-center
          ${
            !!selectedItem
              ? "bg-primary-main bg-opacity-[16%] text-[#015046] px-12 py-6 h-28 rounded-[156px]"
              : "text-gray-3E3F42"
          }
        `}
    >
      <span className="text-13 leading-16 font-r">{filterName}</span>
    </button>
  );
}

export default SortFilterItem;
