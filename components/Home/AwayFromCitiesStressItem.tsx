import Image, { StaticImageData } from "next/image";
import Link from "next/link";

function AwayFromCitiesStressItem({
  name,
  desc,
  linkToGo,
  image,
}: {
  name: string;
  desc: string;
  linkToGo: string;
  image: StaticImageData;
}) {
  return (
    <div className="">
      <Link
        prefetch={false}
        passHref
        href={linkToGo}
        className="block w-full h-[280px] relative mb-8 p-14 rounded-16 overflow-hidden"
      >
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-black bg-opacity-80 via-transparent to-transparent"></div>
        <Image
          src={image}
          fill
          style={{ objectFit: "cover" }}
          alt={name}
          className=""
          placeholder="blur"
        />
        <div className="absolute z-1 bottom-8">
          <Link
            prefetch={false}
            passHref
            href={linkToGo}
            className="block text-19 leading-26 font-m text-white mb-8"
          >
            {name}
          </Link>

          <p className="text-13 leading-16 font-r text-white">{desc}</p>
        </div>
      </Link>
    </div>
  );
}
export default AwayFromCitiesStressItem;
