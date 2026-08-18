import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
// NOTE: DON'T dynamic import this one -- it causes a tangible delay in loading the modal. and we don't want that.
import CitiesListModal from "@/components/General/Address/CitiesListModal";
import { useGetCityIdMutation } from "Hooks/SearchPages/useGetCityIdMutation";

const WhereYouWannaGoModal = dynamic(() => import("./WhereYouWannaGoModal"), {
  ssr: true,
});

function WhereYouWannaGoModals({
  showWhereYouWannaGoModal,
  setShowWhereYouWannaGoModal,
  showCitiesListModal,
  setShowCitiesListModal,
}: {
  showWhereYouWannaGoModal: boolean;
  setShowWhereYouWannaGoModal: Dispatch<SetStateAction<boolean>>;
  showCitiesListModal: boolean;
  setShowCitiesListModal: Dispatch<SetStateAction<boolean>>;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<{ id: number; name: string }>();
  const router = useRouter();

  const getCityIdMutation = useGetCityIdMutation();

  return (
    <>
      {!!showWhereYouWannaGoModal && (
        <WhereYouWannaGoModal
          showWhereYouWannaGoModal={showWhereYouWannaGoModal}
          setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
          searchText={searchText}
          setSearchText={setSearchText}
          setSelectedProvince={setSelectedProvince}
          setShowCitiesListModal={setShowCitiesListModal}
        />
      )}
      {!!showCitiesListModal && (
        <CitiesListModal
          isModalOpen={showCitiesListModal}
          handleClose={() => setShowCitiesListModal(false)}
          selectedProvince={selectedProvince}
          onSelectOfCityCb={(selectedCityName) => {
            // navigae to that route -- possibly there is no pathname already
            getCityIdMutation.mutate({
              cityName: selectedCityName,
              onSuccessCb(cityOrProvinceName: string) {
                router.push({
                  pathname: "/search/[id]",
                  query: { id: cityOrProvinceName },
                });

                setShowCitiesListModal(false);
              },
            });
          }}
          handleGoBack={() => setShowWhereYouWannaGoModal(true)}
        />
      )}
    </>
  );
}

export default WhereYouWannaGoModals;
