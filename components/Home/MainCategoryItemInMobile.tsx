import Image from "next/image";
import Link from "next/link";

function MainCategoryItemInMobile({
  icon,
  nameOfCategory,
  link,
}: {
  icon: string;
  nameOfCategory: string;
  link: string;
}) {
  return (
    <Link
      prefetch={false}
      passHref
      href={link}
      className="w-full flex flex-col gap-y-8 items-center text-black bg-gray-F4F5F6 rounded-16 py-18"
    >
      <div className="w-32 h-32 relative">
        <Image
          src={icon}
          fill
          style={{ objectFit: "cover" }}
          alt={nameOfCategory}
          priority
          // placeholder="blur"
        />
      </div>

      <p className="text-14 leading-24 font-r">{nameOfCategory}</p>
    </Link>
  );
}

export default MainCategoryItemInMobile;
