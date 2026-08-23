import { IFeature } from "@/interfaces/observe_residence";
import { useEffect, useState } from "react";
import { IShowFacilityDetails } from "./FacilityDetailsBottomSheet";
import FacilityItem from "./FacilityItem";
import { Button } from "../../../General/core/Button";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import dynamic from "next/dynamic";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import Divider from "@/components/General/Divider";
import { useMediaQuery } from "@/utilities/useMediaQuery";
const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), {
  ssr: true,
});
const FacilityDetailsBottomSheet = dynamic(() => import("./FacilityDetailsBottomSheet"), {
  ssr: true,
});
const ResidenceAllFacilitiesModal = dynamic(() => import("./ResidenceAllFacilitiesModal"), {
  ssr: true,
});

const facilityDetailsInitialValues: IShowFacilityDetails = {
  show: false,
  payload: {
    title: "",
    description: "",
    data: [],
  },
};

function ResFacilities() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  const { data } = useGetObserveResidence();

  const [showFacilityDetailsBottomSheet, setShowFacilityDetailsBottomSheet] =
    useState<IShowFacilityDetails>(facilityDetailsInitialValues);

  const [showResidenceAllFacilitiesModal, setShowResidenceAllFacilitiesModal] =
    useState<boolean>(false);

  // Derived directly (not useEffect+state) so the facilities list is part of
  // the server-rendered HTML — it's SEO-relevant content.
  const eligibleFacilitiesToBeListed: (IFeature & {
    extra_features: { [key: string | "توضیحات"]: string };
  })[] =
    data?.status === "success"
      ? (data?.params?.features || [])
          .filter(
            (feature: IFeature) =>
              (feature.category === "امکانات" || feature.category === "امکانات بوم گردی") &&
              feature.value === "دارد"
          )
          .map((facilitiy: IFeature) => ({
            ...facilitiy,
            extra_features:
              !!data?.params?.residence_info?.extra_features?.[facilitiy.id] &&
              typeof data?.params?.residence_info?.extra_features?.[facilitiy.id] === "object" &&
              Object.keys(data?.params?.residence_info?.extra_features?.[facilitiy.id]).length > 0
                ? data?.params?.residence_info?.extra_features?.[facilitiy.id]
                : {},
          }))
      : [];

  return (
    <>
      <section className="pb-24">
        <header>
          <h2 className="text-16 leading-22 text-black font-m mb-24">
            {`امکانات ${data?.params?.residence_info?.residence_type}`}
          </h2>
        </header>

        <div className="grid grid-cols-3">
          <ul className="col-span-full md:col-span-2 grid grid-cols-2 md:gap-x-120 gap-y-16 md:gap-y-24">
            {eligibleFacilitiesToBeListed.slice(0, isDesktop ? 12 : 6).map((facilitiy, i) => {
              return (
                <FacilityItem
                  key={i}
                  className="col-span-full md:col-span-1"
                  name={facilitiy.name}
                  icon={facilitiy.icon_url}
                  hasDetails={Object.keys(facilitiy.extra_features).length > 0}
                  setShowFacilityDetailsBottomSheet={setShowFacilityDetailsBottomSheet}
                  data={
                    Object.keys(facilitiy.extra_features).length > 0
                      ? Object.entries(facilitiy?.extra_features).map(([k, v], i) => {
                          return {
                            name: k,
                            value: v,
                          };
                        })
                      : []
                  }
                />
              );
            })}
          </ul>
        </div>

        {data?.params?.features?.filter(
          (feature: IFeature) =>
            (feature.category === "امکانات" || feature.category === "امکانات بوم گردی") &&
            feature.value === "دارد"
        ).length > (isDesktop ? 12 : 6) && (
          <Button
            variant="outlined"
            color="grey"
            className="mt-24 md:w-[240px]"
            isFullWidth
            onClick={() => setShowResidenceAllFacilitiesModal(true)}
            leftIcon={<i className="icon-Forward" />}
          >
            مشاهده همه امکانات
          </Button>
        )}
      </section>

      <Divider className="mb-24" />

      {!!showFacilityDetailsBottomSheet.show && (
        <BottomSheet
          open={!!showFacilityDetailsBottomSheet.show}
          handleClose={() => setShowFacilityDetailsBottomSheet(facilityDetailsInitialValues)}
          headerTitle={showFacilityDetailsBottomSheet.payload.title}
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <FacilityDetailsBottomSheet
                handleSmoothClose={handleSmoothClose}
                payload={showFacilityDetailsBottomSheet.payload}
              />
            );
          }}
        />
      )}

      {!!showResidenceAllFacilitiesModal && (
        <ResidenceAllFacilitiesModal
          isModalOpen={showResidenceAllFacilitiesModal}
          handleClose={() => setShowResidenceAllFacilitiesModal(false)}
          data={{
            setShowFacilityDetailsBottomSheet,
            allFacilities: eligibleFacilitiesToBeListed,
          }}
        />
      )}
    </>
  );
}
export default ResFacilities;
