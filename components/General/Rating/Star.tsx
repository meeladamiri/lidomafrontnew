import { monotonicFactory } from "ulid";

const ulid = monotonicFactory();

function Star({
  percentage,
  index,
  color = "#FFC120",
  trailColor = "rgba(25, 59, 103, 0.05)",
  width = 14,
  height = 13,
  onClick,
  readOnly = true,
}: {
  percentage: string;
  index: number | string;
  color?: string;
  trailColor?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  readOnly?: boolean;
}) {
  const generatedId = ulid(150000);
  // const starPercentageRef = useRef<string>(percentage);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 14 13"
      fill="none"
      onClick={() => {
        if (!!onClick && !readOnly) {
          onClick();
        }
      }}
      className={`${!readOnly ? "cursor-pointer" : ""}`}
      // className="hover:bg-[#FFC020]"
      // onMouseEnter={() => {
      //   starPercentageRef.current = "100";
      // }}
      // onMouseLeave={() => {
      //   starPercentageRef.current = "50";
      // }}
    >
      <defs>
        <style>
          {`.main-class-${generatedId} {
              fill: url(#progress-${generatedId});
            }`}
        </style>
        <linearGradient id={`progress-${generatedId}`} x1={"0%"} y1="0%" x2={"100%"} y2="0%">
          <stop
            offset={`${percentage}%`}
            stopColor={color} // the fill color of the star (ex: yellow)
          />

          <stop offset="0%" stopColor={trailColor} />
        </linearGradient>
      </defs>
      <path
        d="M6.66688 10.8336L2.55222 12.997L3.33822 8.41496L0.00488281 5.17029L4.60488 4.50363L6.66222 0.334961L8.71955 4.50363L13.3195 5.17029L9.98622 8.41496L10.7722 12.997L6.66688 10.8336Z"
        className={`main-class-${generatedId}`}
      />
      <path
        d="M6.66688 10.8336L2.55222 12.997L3.33822 8.41496L0.00488281 5.17029L4.60488 4.50363L6.66222 0.334961L8.71955 4.50363L13.3195 5.17029L9.98622 8.41496L10.7722 12.997L6.66688 10.8336Z"
        fillOpacity="1"
      />
    </svg>
  );
}

export default Star;
