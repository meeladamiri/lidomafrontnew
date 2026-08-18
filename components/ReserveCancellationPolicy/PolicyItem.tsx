// import Image from "next/image";
// import reserveRuleBorder from "../../public/assets/cancel-reserve-rule-border.svg";
// import reserveRuleBorderMobile from "../../public/assets/cancel-reserve-rule-border-mobile.svg";

type policyItem = {
  title?: string;
  befor72: string;
  befor24: string;
  entry: string;
  longtermReserve: string;
  peakDays: string;
};
const PolicyItem = ({ title, befor72, befor24, entry, longtermReserve, peakDays }: policyItem) => {
  return (
    <>
      {/* <h2 className="text-14 font-bold mt-20 mb-30">{title}</h2> */}
      <div className="flex flex-col">
        {/* <div className="flex mb-12"> */}
        {/* <div className="grow-0">
            <Image
              src={reserveRuleBorderMobile}
              className="md:hidden"
              alt="مقررات لغو رزرو اقامتگاه ها"
            />
            <Image
              src={reserveRuleBorder}
              className="hidden md:block"
              alt="مقررات لغو رزرو اقامتگاه ها"
            />
          </div> */}
        <div className="flex flex-col pr-16 grow">
          <div className="relative border-r-2 pr-16 border-gray-C4CAD3">
            <span className="block text-14 font-m mb-8">تا 72 ساعت مانده به شروع اقامت</span>
            <span className="block text-12 font-light mb-16 leading-24">{befor72}</span>
            <div className="absolute -right-7 top-1/3 -translate-y-1/3 bg-black rounded-[50%] h-12 w-12"></div>
          </div>
          <div className="relative border-r-2 pr-16 border-gray-C4CAD3">
            <span className="block text-14 font-m mb-8">کمتر از 72 ساعت مانده به شروع اقامت</span>
            <span className="block text-12 font-light mb-16 leading-24">{befor24}</span>
            <div className="absolute -right-7 top-1/3 -translate-y-1/3 bg-black rounded-[50%] h-12 w-12"></div>
          </div>
          <div className="relative border-r-2 pr-16 border-gray-C4CAD3">
            <span className="block text-14 font-m mb-8">روز شروع اقامت به بعد</span>
            <span className="block text-12 font-light mb-16 leading-[26px]">{entry}</span>
            <div className="absolute -right-7 top-1/3 -translate-y-1/3 bg-black rounded-[50%] h-12 w-12"></div>
          </div>
          <div className="relative border-r-2 pr-16 border-gray-C4CAD3">
            <span className="block text-14 font-m mb-8">رزرو های بلند مدت (بیشتر از 14 روز)</span>
            <span className="block text-12 font-light mb-16 leading-24">{longtermReserve}</span>
            <div className="absolute -right-7 top-1/3 -translate-y-1/3 bg-black rounded-[50%] h-12 w-12"></div>
          </div>
          <div className="relative border-r-2 pr-16 border-gray-C4CAD3">
            <span className="block text-14 font-m mb-8">
              ایام پیک (مانند تعطیلات رسمی، نوروز و بین تعطیلات)
            </span>
            <span className="block text-12 font-light">{peakDays}</span>
            <div className="absolute -right-7 top-1/3 -translate-y-1/3 bg-red-main rounded-[50%] h-12 w-12"></div>
          </div>
        </div>
        {/* </div> */}
        {/* <div className="rounded-50 bg-gray-EBF4FF p-10 text-12 font-normal text-center">
          کارمزد لیدوماتریپ: 10% بابت رزرو + 10% بابت لغو
        </div> */}
      </div>
    </>
  );
};
export default PolicyItem;
