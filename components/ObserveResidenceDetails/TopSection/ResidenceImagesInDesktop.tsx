import dynamic from "next/dynamic";
import { getBlurHash } from "@/utilities/getBlurHash";
import Image from "next/image";
import { useState } from "react";
import { Button } from "../../General/core/Button";
import { T_image } from "@/interfaces/observe_residence";

const CustomLightbox = dynamic(() => import("@/components/General/CustomLightbox/CustomLightbox"), {
  ssr: true,
});

function ResidenceImagesInDesktop({ images, name }: { images: T_image[]; name: string }) {
  const [indexBeingHovered, setIndexBeingHovered] = useState<number | null>(null);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);

  if (images?.length === 0) return null;

  return (
    <div className="w-full h-[420px] relative">
      <div className="w-full h-full grid grid-cols-12 gap-x-12">
        {/* right section */}
        <figure
          className={`${
            images?.length === 1 ? "col-span-full" : "col-span-6"
          } relative overflow-hidden rounded-12`}
        >
          <Image
            priority
            src={images?.[0]?.url}
            fill
            style={{ objectFit: "cover" }}
            alt={name}
            placeholder="blur"
            blurDataURL={getBlurHash(images?.[0]?.url)}
            className={`rounded-12 cursor-pointer transition-all duration-300 ${
              indexBeingHovered === null ? "" : indexBeingHovered === 0 ? "scale-105" : "opacity-60"
            }`}
            onClick={() => setShowLightbox(true)}
            onMouseEnter={() => setIndexBeingHovered(0)}
            onMouseLeave={() => setIndexBeingHovered(null)}
          />
        </figure>

        {/* left section */}
        <div
          className={`${
            images?.length === 1 ? "hidden" : "col-span-6"
          } relative overflow-hidden rounded-12`}
        >
          {images?.length === 2 ? (
            <Image
              priority
              src={images[1].url}
              fill
              style={{ objectFit: "cover" }}
              alt={name}
              placeholder="blur"
              blurDataURL={getBlurHash(images[1].url)}
              className={`rounded-12 cursor-pointer transition-all duration-300 ${
                indexBeingHovered === null
                  ? ""
                  : indexBeingHovered === 1
                  ? "scale-105"
                  : "opacity-60"
              }`}
              onClick={() => setShowLightbox(true)}
              onMouseEnter={() => setIndexBeingHovered(1)}
              onMouseLeave={() => setIndexBeingHovered(null)}
            />
          ) : images?.length === 3 ? (
            <div className="grid grid-cols-1 gap-y-12 h-full">
              <div className="col-span-full relative overflow-hidden rounded-12">
                <Image
                  priority
                  src={images[1].url}
                  fill
                  style={{ objectFit: "cover" }}
                  placeholder="blur"
                  blurDataURL={getBlurHash(images[1].url)}
                  alt={name}
                  className={`rounded-12 cursor-pointer transition-all duration-300 ${
                    indexBeingHovered === null
                      ? ""
                      : indexBeingHovered === 1
                      ? "scale-105"
                      : "opacity-60"
                  }`}
                  onClick={() => setShowLightbox(true)}
                  onMouseEnter={() => setIndexBeingHovered(1)}
                  onMouseLeave={() => setIndexBeingHovered(null)}
                />
              </div>
              <div className="col-span-full relative overflow-hidden rounded-12">
                <Image
                  priority
                  src={images[2].url}
                  fill
                  style={{ objectFit: "cover" }}
                  alt={name}
                  placeholder="blur"
                  blurDataURL={getBlurHash(images[2].url)}
                  className={`rounded-12 cursor-pointer transition-all duration-300 ${
                    indexBeingHovered === null
                      ? ""
                      : indexBeingHovered === 2
                      ? "scale-105"
                      : "opacity-60"
                  }`}
                  onClick={() => setShowLightbox(true)}
                  onMouseEnter={() => setIndexBeingHovered(2)}
                  onMouseLeave={() => setIndexBeingHovered(null)}
                />
              </div>
            </div>
          ) : images?.length === 4 ? (
            <div className="grid grid-cols-2 gap-x-12 gap-y-12 h-full">
              <div className="col-span-1 relative overflow-hidden rounded-12">
                <Image
                  priority
                  src={images[1].url}
                  fill
                  style={{ objectFit: "cover" }}
                  alt={name}
                  placeholder="blur"
                  blurDataURL={getBlurHash(images[1].url)}
                  className={`rounded-12 cursor-pointer transition-all duration-300 ${
                    indexBeingHovered === null
                      ? ""
                      : indexBeingHovered === 1
                      ? "scale-105"
                      : "opacity-60"
                  }`}
                  onClick={() => setShowLightbox(true)}
                  onMouseEnter={() => setIndexBeingHovered(1)}
                  onMouseLeave={() => setIndexBeingHovered(null)}
                />
              </div>
              <div className="col-span-1 relative overflow-hidden rounded-12">
                <Image
                  priority
                  src={images[2].url}
                  fill
                  style={{ objectFit: "cover" }}
                  alt={name}
                  placeholder="blur"
                  blurDataURL={getBlurHash(images[2].url)}
                  className={`rounded-12 cursor-pointer transition-all duration-300 ${
                    indexBeingHovered === null
                      ? ""
                      : indexBeingHovered === 2
                      ? "scale-105"
                      : "opacity-60"
                  }`}
                  onClick={() => setShowLightbox(true)}
                  onMouseEnter={() => setIndexBeingHovered(2)}
                  onMouseLeave={() => setIndexBeingHovered(null)}
                />
              </div>
              <div className="col-span-full relative overflow-hidden rounded-12">
                <Image
                  priority
                  src={images[3].url}
                  fill
                  style={{ objectFit: "cover" }}
                  alt={name}
                  placeholder="blur"
                  blurDataURL={getBlurHash(images[3].url)}
                  className={`rounded-12 cursor-pointer transition-all duration-300 ${
                    indexBeingHovered === null
                      ? ""
                      : indexBeingHovered === 3
                      ? "scale-105"
                      : "opacity-60"
                  }`}
                  onClick={() => setShowLightbox(true)}
                  onMouseEnter={() => setIndexBeingHovered(3)}
                  onMouseLeave={() => setIndexBeingHovered(null)}
                />
              </div>
            </div>
          ) : images?.length >= 5 ? (
            <div className="grid grid-cols-2 gap-x-12 gap-y-12 h-full">
              {images.slice(1, 5).map((item, idx) => {
                return (
                  <div key={idx} className="col-span-1 relative overflow-hidden rounded-12">
                    <Image
                      src={images[idx + 1].url}
                      fill
                      priority
                      style={{ objectFit: "cover" }}
                      alt={name}
                      placeholder="blur"
                      blurDataURL={getBlurHash(images[idx + 1].url)}
                      className={`rounded-12 cursor-pointer transition-all duration-300 ${
                        indexBeingHovered === null
                          ? ""
                          : indexBeingHovered === idx + 1
                          ? "scale-105"
                          : "opacity-60"
                      }`}
                      onClick={() => setShowLightbox(true)}
                      onMouseEnter={() => setIndexBeingHovered(idx + 1)}
                      onMouseLeave={() => setIndexBeingHovered(null)}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {images?.length > 5 && (
        <div className="absolute left-16 bottom-16 md:block hidden">
          <Button color="white" onClick={() => setShowLightbox(true)}>
            مشاهده همه تصاویر
          </Button>
        </div>
      )}

      {!!showLightbox && (
        <CustomLightbox
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          images={images}
        />
      )}
    </div>
  );
}

export default ResidenceImagesInDesktop;
