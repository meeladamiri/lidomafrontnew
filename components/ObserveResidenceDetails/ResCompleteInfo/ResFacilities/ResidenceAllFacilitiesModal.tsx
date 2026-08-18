import ModalWrapper from "components/General/core/ModalWrapper";
import { IFeature } from "@/interfaces/observe_residence";
import FacilityItem from "./FacilityItem";
import { Dispatch, SetStateAction } from "react";
import { IShowFacilityDetails } from "./FacilityDetailsBottomSheet";

function ResidenceAllFacilitiesModal({
  isModalOpen,
  handleClose,
  data,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  data: {
    setShowFacilityDetailsBottomSheet: Dispatch<SetStateAction<IShowFacilityDetails>>;
    allFacilities: (IFeature & {
      extra_features: {
        [key: string]: string;
      };
    })[];
  };
}) {
  return (
    <ModalWrapper
      headerTitle="امکانات اقامتگاه"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname="md:!w-[568px]"
    >
      <div>
        {data.allFacilities.map((facilitiy, i) => {
          return (
            <div key={i} className="pb-12 pt-12 border-b-1 border-solid border-b-gray-DBDFE5">
              <FacilityItem
                name={facilitiy.name}
                icon={facilitiy.icon_url}
                hasDetails={Object.keys(facilitiy.extra_features).length > 0}
                setShowFacilityDetailsBottomSheet={data.setShowFacilityDetailsBottomSheet}
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
            </div>
          );
        })}
      </div>
    </ModalWrapper>
  );
}

export default ResidenceAllFacilitiesModal;
