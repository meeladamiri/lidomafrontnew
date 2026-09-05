interface ICircleSkeleton {
  widthClass?: string;
  heightClass?: string;
}

// Note: Can be used for ellipse shape also.
function CircleSkeleton({ widthClass, heightClass }: ICircleSkeleton) {
  return (
    <div
      className={`
        animate-pulse
        ${widthClass || "w-48"}
        ${heightClass || "h-48"}
      `}
    >
      <div
        className={`
            w-full h-full
            bg-gray-E9EdF1
            rounded-full
      `}
      ></div>
    </div>
  );
}
export default CircleSkeleton;
