import { useMutation, useQuery } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IResidenceExactAdress } from "interfaces/Residences/Submit";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { new_res_lat_long_enum } from "@/constants/new_res_lat_long";
import StepTitle from "../../StepTitle";
import { useRouter } from "next/router";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { Button } from "@/components/General/core/Button";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { getAllowedValues } from "@/api/Residences/getAllowedValues";
import { useResidenceDraft } from "../../useWizard";
const ProjectMap = dynamic(() => import("components/Map"), {
  ssr: false,
});
const HelpSidebarContent = dynamic(
  () => import("@/components/Residences/Submit/HelpBtn/HelpSidebarContent"),
  {
    ssr: true,
  }
);
const SidebarWrapper = dynamic(() => import("@/components/General/Sidebar/SidebarWrapper"), {
  ssr: true,
});

function Step8() {
  const router = useRouter();
  const [showHelpSidebar, setShowHelpSidebar] = useState<boolean>(false);
  const [userLat, setUserLat] = useState<number>();
  const [userLang, setUserLang] = useState<number>();

  const [newResLatLng, setNewResLatLng] = useState<{
    lat: number | string;
    lng: number | string;
  }>();

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        if (!!residenceSubmittedData?.params?.residence_info) {
          const residenceExactAdress: IResidenceExactAdress =
            residenceSubmittedData?.params?.residence_info;
          if (!!residenceExactAdress.latitude && !!residenceExactAdress.longitude) {
            setUserLat(Number(residenceExactAdress.latitude) || undefined);
            setUserLang(Number(residenceExactAdress.longitude) || undefined);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  useEffect(() => {
    const new_res_lat = localStorage.getItem(new_res_lat_long_enum.NEW_RES_PROVINCE_LAT);
    const new_res_long = localStorage.getItem(new_res_lat_long_enum.NEW_RES_PROVINCE_LONG);
    if (!!new_res_lat && !!new_res_long) {
      setNewResLatLng({
        lat: new_res_lat,
        lng: new_res_long,
      });
    }
  }, []);

  const { isLoading: getAllowedValuesIsLoading, data: allowedValuesData } = useQuery(
    ["getAllowedValues", router?.query?.step],
    () => getAllowedValues({ step: Number(router?.query?.step as string) })
  );

  const submitStep8Mutation = useMutation(
    ({
      productId,
      latitude,
      longitude,
    }: {
      productId: number;
      latitude: number | undefined;
      longitude: number | undefined;
    }) => {
      return submitStep({
        step: 8,
        productId,
        data: {
          latitude: latitude || null,
          longitude: longitude || null,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();

          // Lets clear the rough lat and lng of the residecne from localStorage
          localStorage.removeItem(new_res_lat_long_enum.NEW_RES_PROVINCE_LAT);
          localStorage.removeItem(new_res_lat_long_enum.NEW_RES_PROVINCE_LONG);

          router.push(`?step=${9}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep8Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      latitude: userLat,
      longitude: userLang,
    });
  }

  return (
    <div className="h-full md:pb-64">
      {getResidenceSubmittedDataIsLaoding ? (
        <TinyLoader />
      ) : (
        <>
          <div className="md:pb-80">
            <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0 hidden md:flex" />

            <div className="h-screen w-screen fixed top-0 right-0 left-0 bottom-0 md:static md:w-full md:h-[536px]">
              <ProjectMap
                userLat={userLat}
                userLang={userLang}
                setUserLat={setUserLat}
                setUserLang={setUserLang}
                showZoomControl={false}
                getUserLocationBtnClassname="!bottom-[88px] md:!bottom-20"
                name="reslatlng"
                mapClassname="md:rounded-16"
                automaticallyNavigateToCustomLatLng={newResLatLng}
              />
            </div>

            {!!showHelpSidebar && (
              <SidebarWrapper
                isSidebarOpen={showHelpSidebar}
                setIsSidebarOpen={setShowHelpSidebar}
                content={({ handleSidebarClose }: { handleSidebarClose: THandleSidebarClose }) => (
                  <HelpSidebarContent handleSidebarClose={handleSidebarClose} />
                )}
              />
            )}
          </div>

          <BottomActionsWrapper isSaving={submitStep8Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
            <div className="w-full grid grid-cols-4 gap-x-10">
              <div
                className={`
    ${!!allowedValuesData?.params?.help_text ? "col-span-1 md:hidden" : "hidden"}
  `}
              >
                <Button isFullWidth color="grey" onClick={() => setShowHelpSidebar(true)}>
                  راهنما
                </Button>
              </div>
              <div
                className={`
    ${!!allowedValuesData?.params?.help_text ? "col-span-3 md:col-span-full" : "col-span-full"}
  `}
              >
                <Button
                  isLoading={submitStep8Mutation.isLoading}
                  loadingText="در حال ذخیره…"
                  leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
                  isFullWidth
                  onClick={onSubmitClick}
                >
                  ذخیره و ادامه
                </Button>
              </div>
            </div>
          </BottomActionsWrapper>
        </>
      )}
    </div>
  );
}

export default Step8;
