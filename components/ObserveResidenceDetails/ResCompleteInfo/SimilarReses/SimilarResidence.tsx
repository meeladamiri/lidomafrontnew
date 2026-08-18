import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
const ResRate = dynamic(() => import("@/components/General/ResRate"), {
  ssr: true,
});

function SimilarResidence({
  image,
  name,
  score,
  howManyComments,
  price,
  link,
}: {
  image: string;
  name: string;
  score: number;
  howManyComments: number;
  price: number;
  link: string;
}) {
  return (
    <Link prefetch={false} passHref href={link} className="w-full">
      <div className="relative w-full h-[200px] mb-8">
        <Image
          src={image}
          alt={name}
          className="rounded-12"
          fill
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <div className="flex items-center gap-x-4 justify-between">
        <p className="text-14 leading-24 text-black font-r OnlyOneLineAndEndWithElipsis">{name}</p>

        {(!!howManyComments || !!score) && (
          <ResRate average_rating={score} reviews_count={howManyComments} />
        )}
      </div>

      <p className="text-13 leading-16 text-black font-r mt-12">
        <span className="text-gray-565659 text-11 leading-14 font-r">هر شب از : </span>
        {price.toLocaleString()} تومان
      </p>
    </Link>
  );
}

export default SimilarResidence;
