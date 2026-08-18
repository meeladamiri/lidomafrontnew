import "leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction, useState } from "react";
import { IRAN_Lat_Long } from "constants/Residences/Submit/Steps/Step_8";
import { MapContainer } from "react-leaflet";
import InsideMapContainer from "./InsideMapContainer";
import classes from "@/styles/TheSearchMap.module.css";
import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";

import dynamic from "next/dynamic";
import SearchMapHeader from "./SearchMapHeader";
import SearchMapFooter from "./SearchMapFooter";

const ResidencePopupInfoMobile = dynamic(() => import("./ResidencePopupInfoMobile"), {
  ssr: true,
});

const TheSearchMap = ({
  mapClassname,
  setShowShareBottomSheet,
  setShowSearchMapModal,
  setShowGeneralFiltersModal,
}: {
  mapClassname?: string;
  setShowShareBottomSheet: Dispatch<SetStateAction<IShare>>;
  setShowSearchMapModal: Dispatch<SetStateAction<boolean>>;
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [selectedRes, setSelectedRes] = useState<IProduct_SearchResidences>();

  return (
    <>
      <div className={`relative h-full ${classes.TheSearchMap}`}>
        <MapContainer
          center={[IRAN_Lat_Long.lat, IRAN_Lat_Long.long]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: "100%" }}
          zoomControl={true}
          className={mapClassname || ""}
          tap
        >
          <SearchMapHeader
            setShowSearchMapModal={setShowSearchMapModal}
            setShowGeneralFiltersModal={setShowGeneralFiltersModal}
          />

          <InsideMapContainer
            setShowShareBottomSheet={setShowShareBottomSheet}
            selectedRes={selectedRes}
            setSelectedRes={setSelectedRes}
          />
        </MapContainer>

        {!!selectedRes && !isDesktop && (
          <ResidencePopupInfoMobile
            name={selectedRes?.name}
            bedN={selectedRes?.rooms_count}
            city={selectedRes?.city}
            maxCapacity={selectedRes?.max_capacity}
            price={selectedRes?.min_price || 0}
            province={selectedRes?.province}
            referenceCode={selectedRes?.reference}
            discountP={selectedRes?.discount}
            neighborhood={selectedRes?.neighborhood}
            average_rating={selectedRes?.average_rating}
            reviews_count={selectedRes?.reviews_count}
            isFastEnabled={selectedRes?.is_fast}
            isLastMomentForToday={selectedRes?.is_offer}
            image={selectedRes?.main_image}
            residenceId={selectedRes?.id}
            displayType={selectedRes?.display_type}
          />
        )}

        <SearchMapFooter setShowSearchMapModal={setShowSearchMapModal} />
      </div>
    </>
  );
};

export default TheSearchMap;
