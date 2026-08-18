import Image from "next/image";

function LastMomentForToday() {
  return (
    <div className="pl-12 pr-5 py-4 gap-x-8 bg-red-light border-error-light border-1 border-solid rounded-full flex items-center">
      <Image src={"/assets/non-icomoon-icons/stopwatch.svg"} width={14} height={15} alt="" />

      <span className="text-12 leading-16 text-black font-l">لحظه آخری برای امروز</span>
    </div>
  );
}

export default LastMomentForToday;
