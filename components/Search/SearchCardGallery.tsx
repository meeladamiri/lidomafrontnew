import Image from "next/image";
import dynamic from "next/dynamic";
import { getBlurHash } from "@/utilities/getBlurHash";

// The slider is client-only. Swiper's `virtual` module renders nothing on the
// server, which is why a page of twenty cards used to reach the browser with
// two <img> tags in it and none of the listing photos.
const CardSwiper = dynamic(() => import("./SearchCardSwiper"), { ssr: false });

/**
 * A listing card's photos.
 *
 * The first photo is a plain server-rendered <Image>: it is in the HTML, it is
 * what a crawler indexes, it is what paints for LCP, and it is what someone
 * without JavaScript sees. The slider mounts on top of it afterwards and takes
 * over — it requests the same optimised URL for its first slide, so that is a
 * cache hit rather than a second download.
 *
 * `priority` is passed for the cards in the first row. `loading="lazy"` on the
 * image that turns out to be the LCP element delays the very thing being
 * measured, so the top of the grid opts out of it.
 */
function SearchCardGallery({
  images,
  name,
  priority = false,
  isOffscreen,
}: {
  images: string[];
  name: string;
  priority?: boolean;
  isOffscreen: boolean;
}) {
  const list = (images || []).filter(Boolean);
  const first = list[0];

  return (
    <>
      {!!first && (
        <Image
          src={first}
          // The listing's own title, not a generic string: this is the text a
          // crawler and a screen reader get for the photo.
          alt={name}
          width={400}
          height={280}
          // The card is full width on phones, a third on tablet and a quarter
          // on desktop, capped by the 1328px container. Saying 100vw here made
          // every phone-sized card download a 1080px-wide rendition.
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 33vw, (max-width: 1328px) 25vw, 332px"
          placeholder="blur"
          blurDataURL={getBlurHash(first)}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full rounded-12 object-cover"
        />
      )}

      {list.length > 1 && <CardSwiper images={list} name={name} isOffscreen={isOffscreen} />}
    </>
  );
}

export default SearchCardGallery;
