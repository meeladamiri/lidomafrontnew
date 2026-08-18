// import Star from "components/General/Rating/Star";
import dynamic from "next/dynamic";
const Star = dynamic(() => import("components/General/Rating/Star"), {
  ssr: false,
});

function CustomRating({
  percentage,
  howManyStars = 5,
  spaceBetween = 4, // in pixels
  color,
  trailColor,
  width,
  height,
  onChange,
  readOnly = true,
}: {
  percentage: number;
  howManyStars?: number;
  spaceBetween?: number;
  color?: string;
  trailColor?: string;
  width?: number;
  height?: number;
  onChange?: (newValue: number) => void;
  readOnly?: boolean;
}) {
  const fixedPercentage = percentage.toFixed(2);

  const [integralPart, fractionalPart] = fixedPercentage.split(".");

  return (
    <>
      <div
        className="flex flex-row-reverse gap-x-4 items-center"
        style={{
          columnGap: `${spaceBetween}px`,
        }}
      >
        {Array.from({ length: howManyStars }).map((_, index) => {
          return (
            <Star
              key={index}
              index={index}
              color={color}
              trailColor={trailColor}
              onClick={() => {
                if (!!onChange && !readOnly) {
                  onChange(index + 1);
                }
              }}
              readOnly={readOnly}
              width={width}
              height={height}
              percentage={
                index < Number(integralPart)
                  ? "100"
                  : index === Number(integralPart)
                  ? fractionalPart
                  : "0"
              }
            />
          );
        })}
      </div>
    </>
  );
}

export default CustomRating;
