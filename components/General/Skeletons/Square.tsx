interface ISquareSkeleton {
  widthClass?: string;
  heightClass?: string;
  borderRadiusClass?: string;
  marginsClassnames?: string;
  extraClassnames?: string;
}

// Note: Can be used for rectangle shape also.
function SquareSkeleton({
  widthClass,
  heightClass,
  borderRadiusClass,
  marginsClassnames,
  extraClassnames,
}: ISquareSkeleton) {
  return (
    <div
      className={`
        animate-pulse
        ${widthClass || "w-48"}
        ${heightClass || "h-48"}
        ${marginsClassnames || ""}
        ${extraClassnames || ""}
    `}
    >
      <div
        className={`
              w-full h-full
              bg-gray-E9EdF1
              ${borderRadiusClass || "rounded-8"}
        `}
      ></div>
    </div>
  );
}

export default SquareSkeleton;
