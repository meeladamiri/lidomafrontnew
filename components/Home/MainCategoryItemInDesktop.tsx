import Image, { StaticImageData } from "next/image";
import Link from "next/link";

function MainCategoryItemInDesktop({
  image,
  categoryName,
  link,
}: {
  image: StaticImageData;
  categoryName: string;
  link: string;
}) {
  return (
    <Link
      prefetch={false}
      passHref
      href={link}
      className="flex flex-col justify-center items-center w-full group"
    >
      <div className="w-40 h-40 mb-8 relative">
        <Image
          src={image}
          fill
          style={{ objectFit: "cover", borderRadius: "16px" }}
          alt={categoryName}
          priority
          sizes="100vw"
        />
      </div>
      <p className="text-center text-16 leading-24 text-black font-m mb-8 group-hover:text-primary-main">
        {categoryName}
      </p>
    </Link>
  );
}
export default MainCategoryItemInDesktop;
