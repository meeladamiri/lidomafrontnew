import { Dispatch, SetStateAction } from "react";

function ProvinceOrCityItem({
  isCity,
  name,
  cityCount,
  provinceId,
  setShowWhereYouWannaGoModal,
  setShowCitiesListModal,
  setSelectedProvince,
  onClickOfCity,
}: {
  isCity: boolean;
  name: string;
  provinceId?: number; // must be provided when 'isCity == false';
  cityCount?: number; // must be provided when 'isCity == false';
  setShowWhereYouWannaGoModal: Dispatch<SetStateAction<boolean>>;
  setShowCitiesListModal: Dispatch<SetStateAction<boolean>>;
  setSelectedProvince: Dispatch<
    SetStateAction<
      | {
          id: number;
          name: string;
        }
      | undefined
    >
  >;
  onClickOfCity?: () => void; // must be provided when 'isCity == true';
}) {
  return (
    <div
      onClick={() => {
        if (!isCity) {
          setSelectedProvince({
            id: provinceId as number,
            name: name,
          });
          // close this modal
          setShowWhereYouWannaGoModal(false);
          //   open up cities modal
          setShowCitiesListModal(true);
        } else {
          if (!!onClickOfCity) {
            onClickOfCity();
          }
        }
      }}
      className="group flex items-center justify-between cursor-pointer pb-12 last:pb-0 mb-12 last:mb-0 border-b-1 border-b-gray-CACFD3 border-solid last:border-b-0"
    >
      <p className="text-14 leading-20 text-black font-r group-hover:text-primary-main">{name}</p>
      {!isCity && (
        <div className="flex items-center gap-x-8">
          <p className="text-12 leading-16 text-gray-616E7C font-l">{cityCount} شهر</p>

          <i className="icon-FlashLeft text-24 group-hover:text-primary-main" />
        </div>
      )}
    </div>
  );
}

export default ProvinceOrCityItem;
