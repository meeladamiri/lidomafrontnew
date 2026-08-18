import Image, { StaticImageData } from "next/image";
import Link from "next/link";

function FavouriteDestinationItem({
  name,
  // desc,
  linkToGo,
  image,
}: {
  name: string;
  // desc: string;
  linkToGo: string;
  image: StaticImageData;
}) {
  return (
    <div className="w-full h-[160px] relative mb-8 rounded-16 overflow-hidden">
      {/* Wrap only the image and text in separate links if needed */}
      <Link prefetch={false} href={linkToGo} passHref className="block w-full h-full relative">
        <Image src={image} fill style={{ objectFit: "cover" }} alt={name} className="rounded-16" />
        <div className="absolute inset-0 z-1 bg-gradient-to-t from-black bg-opacity-80 via-transparent to-transparent"></div>
      </Link>

      <div className="absolute z-1 bottom-8 p-14">
        {/* Separate the link for the name */}
        <Link
          prefetch={false}
          href={linkToGo}
          passHref
          className="block text-21 leading-28 font-m text-white"
        >
          {name}
        </Link>
      </div>
    </div>
  );
}
export default FavouriteDestinationItem;
