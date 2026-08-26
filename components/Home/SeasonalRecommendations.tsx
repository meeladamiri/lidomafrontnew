import Image from "next/image";
import PageTitle from "components/General/PageTitle";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import Link from "next/link";

function SeasonalRecommendation({
  // average,
  content,
  id,
  image,
  name,
  href,
}: {
  // average: number;
  content: string;
  id: number;
  image: string;
  name: string;
  href: string;
}) {
  return (
    <Link
      passHref
      prefetch={false}
      href={href || "/search"}
      className="flex items-center gap-x-12 w-full text-black"
    >
      <div className="w-56 h-56 relative">
        <Image src={image} fill style={{ objectFit: "cover" }} alt={name} className="rounded-8" />
      </div>
      <div>
        <p className="text-16 leading-24 font-r mb-12">{name}</p>
        <p className="flex items-center gap-x-4">
          <span className="text-12 leading-16 text-black font-l">{content}</span>
          {/* <span className="text-12 leading-16 text-black font-l">میانگین هر شب :</span> */}
          {/* <span className="text-12 leading-20 text-black font-r">
            {average?.toLocaleString("en-US")} تومان
          </span> */}
        </p>
      </div>
    </Link>
  );
}

function SeasonalRecommendations({
  data,
}: {
  data: {
    // average: number;
    id: number;
    image: string;
    name: string;
    content: string;
    href: string;
  }[];
}) {
  return (
    <>
      <PageTitle title="پیشنهادات فصل" containerClassname="mb-16" />

      <div className="hidden md:grid grid-cols-4 gap-x-24 gap-y-24">
        {data.map((sr: any, i: number) => {
          return (
            <div className="col-span-1" key={i}>
              <SeasonalRecommendation
                // average={sr.average}
                id={sr.id}
                image={sr.image}
                name={sr.name}
                content={sr.content}
                href={sr.href}
              />
            </div>
          );
        })}
      </div>

      <div className="md:hidden Make_swiper_slide_width_auto">
        <Swiper
          slidesPerView={"auto"}
          freeMode={true}
          slideToClickedSlide={false}
          spaceBetween={24}
          mousewheel={true}
          pagination={false}
        >
          <SwiperSlide>
            {data.slice(0, 4).map((sr, index: number) => {
              return (
                <div className="w-[254px] mb-16 last:mb-0 shrink-0" key={index}>
                  <SeasonalRecommendation
                    // average={sr.average}
                    id={sr.id}
                    image={sr.image}
                    name={sr.name}
                    content={sr.content}
                    href={sr.href}
                  />
                </div>
              );
            })}
          </SwiperSlide>

          <SwiperSlide>
            {data.slice(4, 8).map((sr, index: number) => {
              return (
                <div className="w-[254px] mb-16 last:mb-0 shrink-0" key={index}>
                  <SeasonalRecommendation
                    // average={sr.average}
                    id={sr.id}
                    image={sr.image}
                    name={sr.name}
                    content={sr.content}
                    href={sr.href}
                  />
                </div>
              );
            })}
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
}
export default SeasonalRecommendations;
