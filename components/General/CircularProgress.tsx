function CircularProgress({ perc, startDeg = 0 }: { perc: number; startDeg?: number }) {
  if (perc > 100) perc = 100;
  if (perc < 0) perc = 0;

  const deg = perc * 3.6;

  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* grayish background */}
      <div className="w-48 h-48 rounded-full bg-[#1C2E4599]">
        {/* yellowish circular progress */}
        <div
          className="w-full h-full rounded-full"
          style={{
            backgroundImage:
              deg <= 180
                ? "linear-gradient(" +
                  (90 + deg) +
                  "deg, transparent 50%, #A2ECFB 50%),linear-gradient(90deg, #A2ECFB 50%, transparent 50%)"
                : "linear-gradient(" +
                  (deg - 90) +
                  "deg, transparent 50%, #39B4CC 50%),linear-gradient(90deg, #A2ECFB 50%, transparent 50%)",
            transform: "rotate(" + startDeg + "deg)",
          }}
        >
          <div
            id="circle"
            className="circle"
            style={{
              transform: "rotate(" + -startDeg + "deg)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default CircularProgress;
