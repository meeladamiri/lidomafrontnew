import Image from "next/image";
import { getBlurHash } from "@/utilities/getBlurHash";
import Link from "next/link";

function HomePageBanner({
  mobile_image,
  pc_image,
  linkTo,
}: {
  mobile_image: string;
  pc_image: string;
  linkTo: string;
}) {
  // const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <Link
      prefetch={false}
      passHref
      href={linkTo}
      // h-[205px] sm:h-[245px] md:h-[326px]
      className="block relative"
    >
      <div className="relative w-full h-full md:hidden block">
        <Image
          src={mobile_image}
          width={460}
          height={460}
          style={{ objectFit: "contain" }}
          alt={linkTo}
          className="rounded-12 md:rounded-16"
          placeholder="blur"
          blurDataURL={getBlurHash(mobile_image)}
        />
      </div>

      <div className="relative w-full h-full md:block hidden">
        <Image
          src={pc_image}
          width={1440}
          height={400}
          style={{ objectFit: "contain" }}
          alt={linkTo}
          className="rounded-12 md:rounded-16"
          placeholder="blur"
          blurDataURL={getBlurHash(pc_image)}
        />
      </div>
    </Link>
  );
}

export default HomePageBanner;
