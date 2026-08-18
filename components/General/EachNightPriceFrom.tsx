import dynamic from "next/dynamic";
// import Image from "next/image";

const PercentBox = dynamic(() => import("./PercentBox"), {
  ssr: true,
});

function EachNightPriceFromWithDiscount({
  discountP,
  price,
  nowruzPrice,
}: {
  discountP?: number;
  price: number;
  nowruzPrice?: number;
}) {
  return (
    <div className="text-14 leading-24 text-black font-m flex items-center gap-x-4">
      {/* <Image alt="نوروز" src="/assets/non-icomoon-icons/nowruz.svg" width={28} height={28} /> */}
      <p className="text-12 text-gray-6C6A7D leading-14 font-r">هر شب از :</p>
      {!!discountP && (
        <div className="text-12 leading-21 text-gray-77828F font-l line-through ml-4 flex items-center gap-x-4">
          <p>{price?.toLocaleString()}</p>
          <p>تومان</p>
        </div>
      )}
      <div className="flex items-center gap-x-4">
        <p>{(!!discountP ? price - price * (discountP / 100) : price)?.toLocaleString()}</p>
        <p>تومان</p>
      </div>
      {!!discountP && (
        <PercentBox
          value={discountP}
          // className="mr-8"
        />
      )}
    </div>
  );
}
export default EachNightPriceFromWithDiscount;
