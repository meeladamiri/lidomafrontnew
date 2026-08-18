import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import OneNightPriceFilterInner from "../OneNightPriceFilter/OneNightPriceFilterInner";
import { useRouter } from "next/router";
import ResidenceTypeFilterInner from "../ResidenceTypeFilter/ResidenceTypeFilterInner";
import ResidenceRegion from "./ResidenceRegion";
import ResidenceRules from "./ResidenceRules";
// import ResidenceAverageRating from "./ResidenceAverageRating";
// import FastAndNationalCard from "./FastAndNationalCard";
// import dynamic from "next/dynamic";
// import { getTargetPathname } from "@/utilities/SearchPage/getTargetPathname";
import RoomsCount from "./RoomsCount";
import ResidenceAmenities from "./ResidenceAmenities";
import GeneralFiltersModalActions from "./GeneralFiltersModalActions";
import { preserveNonGeneralFiltersQueryParams } from "@/utilities/SearchPage/preserveNonGeneralFiltersQueryParams";
import { preservingURLRouteParameters } from "@/utilities/SearchPage/preservingURLRouteParameters";
import { deleteAllGeneralFilters } from "@/utilities/SearchPage/deleteAllGeneralFilters";
// import { I_Residence_display_type } from "@/interfaces/Residences";
import PageTitle from "@/components/General/PageTitle";
import { residences_amenities } from "@/constants/search/residences_amenities";
import { residences_types } from "@/constants/search/residences_types";
import { residences_regions } from "@/constants/search/residences_regions";
import { residences_rule } from "@/constants/search/residences_rule";

// const HotelStars = dynamic(() => import("./HotelStars"), {
//   ssr: true,
// });

function GeneralFiltersModal({
  showGeneralFiltersModal,
  setShowGeneralFiltersModal,
}: {
  showGeneralFiltersModal: boolean;
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  // Start of OneNightPrice Filter
  const [tmpOneNightPrice, setTmpOneNightPrice] = useState<[number, number]>();
  useEffect(() => {
    const oneNightPriceFromURL: [number, number] | undefined =
      !!router.query.min_price && !!router.query.max_price
        ? [Number(router.query.min_price as string), Number(router.query.max_price as string)]
        : undefined;

    setTmpOneNightPrice(oneNightPriceFromURL);
  }, [router.query.min_price, router.query.max_price]);
  // End of OneNightPrice Filter

  // Start of RoomsCount Filter
  const [tmpRoomsCount, setTmpRoomsCount] = useState<number>(0);
  useEffect(() => {
    if (!!router?.query?.rooms_count) {
      setTmpRoomsCount(Number(router?.query?.rooms_count as string));
    }
  }, [router?.query?.rooms_count]);
  // End of RoomsCount Filter

  const [tmpTickedResidenceAmenitiesIds, setTmpTickedResidenceAmenitiesIds] = useState<string[]>(
    []
  );
  const [tmpResidenceTypes, setTmpResidenceTypes] = useState<string[]>([]);
  const [tmpResidenceRegions, setTmpResidenceRegions] = useState<string[]>([]);
  const [tickedResidenceRulesId, setTickedResidenceRulesId] = useState<string[]>([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(router.asPath.split("?")[1]);

    const filterParams = (obj: Record<string, string>) =>
      Object.keys(obj)
        .filter((key) => queryParams.get(key) === "1")
        .map((key) => key);

    setTmpTickedResidenceAmenitiesIds(filterParams(residences_amenities));
    setTmpResidenceTypes(filterParams(residences_types));
    setTmpResidenceRegions(filterParams(residences_regions));
    setTickedResidenceRulesId(filterParams(residences_rule));
  }, [router.asPath]);

  function applyGeneralFiltersToURL() {
    let newParams = new URLSearchParams();

    newParams = preserveNonGeneralFiltersQueryParams(newParams, router);
    newParams = preservingURLRouteParameters(newParams, router);

    if (!!tmpOneNightPrice) {
      newParams.append("min_price", tmpOneNightPrice[0].toString());
      newParams.append("max_price", tmpOneNightPrice[1].toString());
    }

    if (!!tmpRoomsCount) {
      newParams.append("rooms_count", tmpRoomsCount.toString());
    }

    if (tickedResidenceRulesId.length !== 0) {
      tickedResidenceRulesId.forEach((resRule) => {
        newParams.append(resRule, "1");
      });
    }

    if (tmpTickedResidenceAmenitiesIds.length !== 0) {
      tmpTickedResidenceAmenitiesIds.forEach((resAmenityId) => {
        newParams.append(resAmenityId, "1");
      });
    }

    if (tmpResidenceRegions.length !== 0) {
      tmpResidenceRegions.forEach((resRegion) => {
        newParams.append(resRegion, "1");
      });
    }

    if (tmpResidenceTypes.length !== 0) {
      tmpResidenceTypes.forEach((resType) => {
        newParams.append(resType, "1");
      });
    }

    router.push({ pathname: router?.pathname, query: newParams.toString() }, undefined, {
      shallow: true,
    });
  }

  return (
    <ModalWrapper
      headerTitle="فیلترها"
      onClose={() => {
        setShowGeneralFiltersModal(false);
      }}
      open={showGeneralFiltersModal}
      bodyContainerClassname="md:!pb-0"
      modalClassname="md:!w-[480px] md:!h-[80%]"
    >
      <div className="pb-60 md:pb-40">
        <div className="pb-16 border-b-1 border-solid border-b-gray-EDEDF2 mb-16">
          <PageTitle
            title="قیمت برای هر شب"
            icon={<i className="icon-Pay text-24" />}
            containerClassname="mb-24"
          />
          <OneNightPriceFilterInner
            selectedMinValue={tmpOneNightPrice?.[0]}
            selectedMaxValue={tmpOneNightPrice?.[1]}
            setSelectedRangeValue={setTmpOneNightPrice}
          />
        </div>

        <div className="pb-16 border-b-1 border-solid border-b-gray-EDEDF2 mb-16">
          <RoomsCount tmpRoomsCount={tmpRoomsCount} setTmpRoomsCount={setTmpRoomsCount} />
        </div>

        <div className="pb-16 border-b-1 border-solid border-b-gray-EDEDF2 mb-16">
          <ResidenceTypeFilterInner
            selectedResidenceTypes={tmpResidenceTypes}
            setSelectedResidenceTypes={setTmpResidenceTypes}
          />
        </div>

        <div className="pb-16 border-b-1 border-solid border-b-gray-EDEDF2 mb-16">
          <ResidenceRegion
            tmpResidenceRegions={tmpResidenceRegions}
            setTmpResidenceRegions={setTmpResidenceRegions}
          />
        </div>

        <div className="pb-16 border-b-1 border-solid border-b-gray-EDEDF2 mb-16">
          <ResidenceRules
            tickedResidenceRulesId={tickedResidenceRulesId}
            setTickedResidenceRulesId={setTickedResidenceRulesId}
          />
        </div>

        <ResidenceAmenities
          tmpTickedResidenceAmenitiesIds={tmpTickedResidenceAmenitiesIds}
          setTmpTickedResidenceAmenitiesIds={setTmpTickedResidenceAmenitiesIds}
        />
      </div>

      {/* ACTIONS */}
      <GeneralFiltersModalActions
        onApplyFiltersClick={() => {
          applyGeneralFiltersToURL();
          setShowGeneralFiltersModal(false);
        }}
        onDeleteAllFiltersClick={() => {
          deleteAllGeneralFilters(router);
          setShowGeneralFiltersModal(false);
        }}
      />
    </ModalWrapper>
  );
}

export default GeneralFiltersModal;
