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
          width={220}
          height={280}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
          placeholder="blur"
        />
        <div className="absolute z-1 bottom-8">
          {/* Was a second <Link> to the same href, nested inside the card link.
              The HTML parser is not allowed to nest anchors, so it hoisted the
              inner one out — the browser's DOM no longer matched what React had
              rendered and hydration of the whole page failed, throwing away the
              server HTML and re-rendering the entire tree on the client. */}
          <h3 className="block text-19 leading-26 font-m text-white mb-8">{name}</h3>

          <p className="text-13 leading-16 font-r text-white">{desc}</p>
        </div>
      </Link>
    </div>
  );
}
export default AwayFromCitiesStressItem;
