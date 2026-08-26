import Image from "next/image";
import villaSuitMain from "../../public/assets/home/villa-main.webp";
import MainSearchBox from "../General/MainSearchBox";
import { useState } from "react";
function HeroSectionDesktop({
  title,
  tagline,
}: {
  title?: string | null;
  tagline?: string | null;
}) {
  const [isLoading, setLoading] = useState(true);

  return (
    <>
      <Image
        src={villaSuitMain}
        // width={1990}
        // height={800}
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
        alt="اجاره ویلا و سوئیت در سراسر ایران"
        priority
        sizes="100vw"
        placeholder="blur"
        className={`
        duration-300 ease-in-out group-hover:opacity-75
        ${isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"})`}
        onLoadingComplete={() => setLoading(false)}
        // blurDataURL={
        //   all_blur_hashes_data[Math.floor(Math.random() * all_blur_hashes_data.length)]
        // }
        // blurDataURL="data:image/webp;base64,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"
      />
      {/* <div className="absolute top-0 left-0 h-full w-full bg-[#73340c] bg-opacity-30 z-1"></div> */}
      <div className="absolute bottom-[70px] right-[240px] z-1">
        <p className="text-right text-22 leading-26 font-r text-white mb-16">
          {tagline || "هرجا بری باهاتیم..."}
        </p>
        {/* Visual heading only — the real H1 is hoisted into HeroSection so the
            two breakpoints cannot each contribute one. */}
        <p className="text-28 leading-28 font-r text-white text-center mb-16">{title}</p>
      </div>
      <div className="top-72 absolute right-0 left-0 z-1 md:pt-24">
        <div>
          <MainSearchBox noCoOperation={false} />
        </div>
      </div>
    </>
  );
}

export default HeroSectionDesktop;
