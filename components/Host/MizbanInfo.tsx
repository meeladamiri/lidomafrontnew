import Image from "next/image";

const MizbanInfo = ({
  mizbanName,
  mizbanImage,
  containerClassname = "",
}: {
  mizbanName: string;
  mizbanImage: string;
  containerClassname?: string;
}) => {
  return (
    <header className={`flex items-center gap-x-12 ${containerClassname}`}>
      <div className="w-48 h-48 relative shrink-0">
        <Image
          src={mizbanImage || "/assets/default-profile.svg"}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-full"
          alt="آواتار میزبان"
        />
      </div>

      <div className="flex flex-col items-start">
        <h2 className="text-16 leading-24 text-black font-m mb-8">{mizbanName}</h2>
        <span className="bg-[#007AFF1F] px-7 py-5 rounded-[156px] gap-x-3 flex justify-center items-center">
          <Image
            src="/assets/non-icomoon-icons/confirmed4.svg"
            width={14}
            height={14}
            alt="میزبان تایید شده"
          />
          <span className="text-11 leading-14 text-black font-r">تأیید شده</span>
        </span>
      </div>
    </header>
  );
};

export default MizbanInfo;
