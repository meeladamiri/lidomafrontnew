type IDivider = {
  height?: string;
  bg?: string;
  className?: string;
};

function Divider({ height, bg, className }: IDivider) {
  return (
    <hr
      className={`
          w-full
          ${className || ""}
          md:border-b-1 md:border-solid md:border-b-gray-CACFD3
          md:!bg-none md:!h-auto
      `}
      style={{
        background:
          bg || "linear-gradient(0deg, rgba(25, 59, 103, 0.05), rgba(25, 59, 103, 0.05)), #FFFFFF",
        height: height || "10px",
      }}
    ></hr>
  );
}

export default Divider;
