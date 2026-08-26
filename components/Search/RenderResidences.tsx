import { useMediaQuery } from "@/utilities/useMediaQuery";
import SearchResidenceCard from "./SearchResidenceCard";
import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";
// import { useRouter } from "next/router";
// import LazyLoad from "react-lazyload";

function RenderResidences({
  residencesList,
  peak_dates,
}: {
  residencesList: IProduct_SearchResidences[];
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  // const router = useRouter();

  return (
    <>
      {residencesList?.map((product, idx: number) => {
        return (
          <li key={`${product.id}-${idx}`} className="col-span-full sm:col-span-4 md:col-span-3">
            <SearchResidenceCard
              name={product.name}
              provice={product.province}
              city={product.city}
              neighborhood={product.neighborhood || ""}
              rating={product.average_rating}
              commentsN={product.reviews_count}
              price={product.min_price || 0}
              nowruzPrice={product.nowruz_price || 0}
              bedN={product.rooms_count}
              referenceCode={product.reference}
              maxCapacity={product.max_capacity}
              images={product.images}
              mainImage={product?.main_image}
              residenceId={product.id}
              isFastEnabled={product.is_fast}
              discountP={product.discount}
              isLastMomentForToday={product.is_offer}
              proviceId={product.province_id}
              cityId={product.city_id}
              displayType={product.display_type}
              isOffscreen={!!isDesktop ? idx >= 8 : idx >= 2}
              // The first row. Whichever of these turns out to be the LCP
              // element, it should not be waiting behind loading="lazy".
              priority={idx < 4}
              stay={(product as any).stay}
              isFull={product.is_full}
              resPureNameAlone={product.name2}
              prices={product.prices}
              capacity={product.capacity}
              peak_dates={peak_dates}
            />
          </li>
        );
        // if (!!router.pathname.startsWith("/boomgardi")) {
        //   return (
        //     <div key={`${product.id}-${idx}`} className="col-span-full sm:col-span-4 md:col-span-3">
        //       <SearchResidenceCard
        //         name={product.name}
        //         provice={product.province}
        //         city={product.city}
        //         neighborhood={product.neighborhood || ""}
        //         rating={product.average_rating}
        //         commentsN={product.reviews_count}
        //         price={product.min_price || 0}
        //         bedN={product.rooms_count}
        //         referenceCode={product.reference}
        //         maxCapacity={product.max_capacity}
        //         images={product.images}
        //         mainImage={product?.main_image}
        //         residenceId={product.id}
        //         isFastEnabled={product.is_fast}
        //         discountP={product.discount}
        //         isLastMomentForToday={product.is_offer}
        //         proviceId={product.province_id}
        //         cityId={product.city_id}
        //         displayType={product.display_type}
        //         isOffscreen={
        //           // !!isDesktop ? idx >= 8 : idx >= 2
        //           false // Not needed in Comp actually
        //         }
        //         isFull={product.is_full}
        //         resPureNameAlone={product.name2}
        //       />
        //     </div>
        //   );
        // }
        // return (
        //   <LazyLoad
        //     height={362}
        //     once
        //     offset={48}
        //     key={`${product.id}-${idx}`}
        //     className="col-span-full sm:col-span-4 md:col-span-3"
        //   >
        //     <SearchResidenceCard
        //       name={product.name}
        //       provice={product.province}
        //       city={product.city}
        //       neighborhood={product.neighborhood || ""}
        //       rating={product.average_rating}
        //       commentsN={product.reviews_count}
        //       price={product.min_price || 0}
        //       bedN={product.rooms_count}
        //       referenceCode={product.reference}
        //       maxCapacity={product.max_capacity}
        //       images={product.images}
        //       mainImage={product?.main_image}
        //       residenceId={product.id}
        //       isFastEnabled={product.is_fast}
        //       discountP={product.discount}
        //       isLastMomentForToday={product.is_offer}
        //       proviceId={product.province_id}
        //       cityId={product.city_id}
        //       displayType={product.display_type}
        //       isOffscreen={
        //         // !!isDesktop ? idx >= 8 : idx >= 2
        //         false // Not needed in Comp actually
        //       }
        //       isFull={product.is_full}
        //       resPureNameAlone={product.name2}
        //     />
        //   </LazyLoad>
        // );
      })}
    </>
  );
}

export default RenderResidences;
