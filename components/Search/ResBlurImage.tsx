import Image from "next/image";
// import { blurHashToDataURL } from "@/utilities/blurhashDataURL";
import { getBlurHash } from "@/utilities/getBlurHash";

interface I_ResBlurImage {
  img: string;
  name: string;
  isOffscreen: boolean;
  i: number;
}

function ResBlurImage({ img, name, isOffscreen, i }: I_ResBlurImage) {
  // Was Math.random(), which picked a different placeholder on the server than
  // on the client — React saw the prop change on every card image and failed
  // hydration for the whole list. See `getBlurHash`.
  const image_blurHash = getBlurHash(img || name);

  return (
    <Image
      src={img}
      alt={name}
      fill
      style={{
        objectFit: "cover",
      }}
      // NOT unoptimized: Liara object storage 404s any request whose
      // User-Agent contains "Mozilla" (bot/hotlink protection), so the
      // browser can never fetch these directly — they must go through
      // Next's image optimizer, which fetches server-side.
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
