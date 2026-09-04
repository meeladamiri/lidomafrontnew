import { useMediaQuery } from "@/utilities/useMediaQuery";
import SearchResidenceCard from "./SearchResidenceCard";
import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";

function RenderResidences({ residencesList }: { residencesList: IProduct_SearchResidences[] }) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      {residencesList?.map((product, idx: number) => (
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
            stay={product.stay}
            isFull={product.is_full}
            resPureNameAlone={product.name2}
          />
        </li>
      ))}
    </>
  );
}

export default RenderResidences;
