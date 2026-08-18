import Image from "next/image";
// import { blurHashToDataURL } from "@/utilities/blurhashDataURL";
import all_blur_hashes_data from "@/constants/all_blur_hashes";

interface I_ResBlurImage {
  img: string;
  name: string;
  isOffscreen: boolean;
  i: number;
}

function ResBlurImage({ img, name, isOffscreen, i }: I_ResBlurImage) {
  const rand_number = Math.floor(Math.random() * all_blur_hashes_data.length);
  const image_blurHash = all_blur_hashes_data[rand_number];

  return (
    <Image
      src={img}
      alt={name}
      fill
      style={{
        objectFit: "cover",
      }}
      unoptimized
      placeholder="blur"
      blurDataURL={image_blurHash}
      className={`h-[240px] md:h-[280px]`}
      // priority={isOffscreen ? false : i === 0 ? true : false}
      loading={
        // isOffscreen ? "lazy" : i === 0 ? "eager" : "lazy"
        i === 0 && !isOffscreen ? "eager" : "lazy"
      }
      sizes="(max-width: 768px) 25vw,
                      (max-width: 1023px) 33vw,
                      (max-width: 1216px) 25vw,
                      25vw"
    />
  );
}

export default ResBlurImage;
