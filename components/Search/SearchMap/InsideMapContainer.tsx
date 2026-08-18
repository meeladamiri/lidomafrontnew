import {
  IProduct_SearchResidences,
  ISearchResidences_ServerResp,
} from "@/interfaces/Search/SearchResp";
import { useSearchResidences } from "Hooks/SearchPages/useSearchResidences";
import { icon, latLngBounds } from "leaflet";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useMap, TileLayer, Marker, Popup } from "react-leaflet";
import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import classes from "styles/map-loader.module.css";
// import MarkerClusterGroup from "react-leaflet-markercluster";
const ResidencePopupInfoDesktop = dynamic(() => import("./ResidencePopupInfoDesktop"), {
  ssr: true,
});

function InsideMapContainer({
  setShowShareBottomSheet,
  selectedRes,
  setSelectedRes,
}: {
  setShowShareBottomSheet: Dispatch<SetStateAction<IShare>>;
  selectedRes: IProduct_SearchResidences | undefined;
  setSelectedRes: Dispatch<SetStateAction<IProduct_SearchResidences | undefined>>;
}) {
  const map = useMap();

  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const { data, isLoading, isFetching } = useSearchResidences();

  const ICON = icon({
    iconUrl: "/assets/map/map-pin.svg",
    iconSize: [72, 72],
  });

  var ICON_ACTIVE = icon({
    iconUrl: "/assets/map/map-pin-active.svg",
    iconSize: [72, 72],
  });

  useEffect(() => {
    if (!!data && data?.status === "success" && data?.params?.products?.length > 0) {
      let markerBounds = latLngBounds([]);
      const markers =
        (data?.params as ISearchResidences_ServerResp)?.products?.filter(
          (el) => !!el?.latitude && !!el?.longitude
        ) || [];
      if (markers?.length > 0) {
        markers.forEach((marker) => {
          markerBounds.extend([Number(marker.latitude), Number(marker.longitude)]);
        });
        map.fitBounds(markerBounds.pad(0.2));
      }
    }
  }, [data, map]);

  return (
    <>
      <TileLayer
        url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
        // Use type assertion to tell TypeScript that the maxAge option is valid
        {...({ maxAge: 7 * 24 * 60 * 60 * 1000 } as any)}
      />

      {(isLoading || isFetching) && (
        <div className="z-[1000] bg-[#0000001a] fixed top-0 right-0 left-0 bottom-0">
          <div className="w-full h-full flex items-center justify-center">
            <div className={`${classes["shapes-5"]}`}></div>
          </div>
        </div>
      )}

      {(data?.params as ISearchResidences_ServerResp)?.products
        ?.filter((el) => !!el?.latitude && !!el?.longitude)
        ?.map((product, idx: number) => {
          return (
            <Marker
              key={`${product?.id}-${idx}`}
              position={[Number(product?.latitude), Number(product?.longitude)]}
              icon={!!selectedRes && selectedRes.id === product.id ? ICON_ACTIVE : ICON}
              draggable={false}
              eventHandlers={{
                click(e) {
                  setSelectedRes(product);
                },
              }}
            >
              {!!isDesktop && (
                <Popup className="w-auto">
                  <ResidencePopupInfoDesktop
                    name={product?.name}
                    bedN={product?.rooms_count}
                    city={product?.city}
                    maxCapacity={product?.max_capacity}
                    price={product?.min_price || 0}
                    province={product?.province}
                    referenceCode={product?.reference}
                    discountP={product?.discount}
                    neighborhood={product?.neighborhood}
                    average_rating={product?.average_rating}
                    reviews_count={product?.reviews_count}
                    isFastEnabled={product?.is_fast}
                    isLastMomentForToday={product?.is_offer}
                    image={product?.main_image}
                    residenceId={product?.id}
                    displayType={product?.display_type}
                    setShowShareBottomSheet={setShowShareBottomSheet}
                    resPureNameAlone={product?.name2}
                  />
                </Popup>
              )}
            </Marker>
          );
        })}
    </>
  );
}

export default InsideMapContainer;
