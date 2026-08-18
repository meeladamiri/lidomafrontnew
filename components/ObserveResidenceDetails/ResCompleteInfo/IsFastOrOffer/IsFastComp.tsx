import Image from "next/image";

function IsFastComp() {
  return (
    <div className="flex items-center gap-x-10">
      <Image
        src="/assets/non-icomoon-icons/glassyStar.svg"
        width={32}
        height={32}
        alt="رزرو آنی فعال"
      />
      <div>
        <p className="text-14 leading-24 text-black font-r mb-4">رزرو آنی</p>

        <p className="text-12 leading-21 text-black font-l">
          رزرو این اقامتگاه به صورت آنی و بدون نیاز به تأیید میزبان می باشد
        </p>
      </div>
    </div>
  );
}

export default IsFastComp;
