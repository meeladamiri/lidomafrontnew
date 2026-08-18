import Image from "next/image";

function IsOfferComp() {
  return (
    <>
      <div className="flex items-center gap-x-8 mb-8">
        <Image
          src="/assets/non-icomoon-icons/last-moment.svg"
          width={25}
          height={24}
          alt="لحظه آخری فعال"
        />
        <p className="text-14 leading-24 text-black font-r">لحظه آخری</p>
      </div>

      <p className="text-12 leading-21 text-black font-l">
        این اقامتگاه برای امشب خالی و تخفیف دار است و بدون نیاز به تائید میزبان می باشد.
      </p>
    </>
  );
}

export default IsOfferComp;
