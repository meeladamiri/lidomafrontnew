import { useQuery } from "@tanstack/react-query";
import { getProvincesAndCities } from "api/address";
import { IProvincesAndCities } from "interfaces/Address";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import ModalWrapper from "../core/ModalWrapper";
import { TinyLoader } from "../Loader/TinyLoader";
import SearchBox from "../SearchBox";

function CitiesListModal({
  isModalOpen,
  handleClose,
  // selectedCity,
  selectedProvince,
  setSelectedCity,
  handleGoBack,
  provinceInputName,
  cityInputName,
  formik,
  onSelectOfCityCb,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  selectedProvince?: // required in case 'formik' is NOT provided.
  | {
        id: number;
        name: string;
      }
    | undefined;
  setSelectedCity?: Dispatch<SetStateAction<string | undefined>>; // required in case 'formik' is NOT provided.
  handleGoBack: () => void;
  provinceInputName?: string; // required in case 'formik' is provided.
  cityInputName?: string; // required in case 'formik' is provided.
  formik?: any;
  onSelectOfCityCb?: (selectedCityName: string) => void;
}) {
  const [provincesAndCities, setProvincesAndCities] = useState<IProvincesAndCities[]>();

  const [citySearchText, setCitySearchText] = useState<string>("");

  const { isLoading, data, isSuccess } = useQuery(["getProvincesAndCities"], () => {
    return getProvincesAndCities();
  });

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        setProvincesAndCities(data?.params?.states);
      }
    }
  }, [data]);

  // useEffect(() => {
  //   if (isModalOpen) {
  //     document.body.classList.add("overflow-hidden");
  //     document.body.style.height = "100vh";
  //   } else {
  //     document.body.classList.remove("overflow-hidden");
  //     document.body.style.height = "";
  //   }

  //   return () => {
  //     document.body.classList.remove("overflow-hidden");
  //     document.body.style.height = "";
  //   };
  // }, [isModalOpen]);

  return (
    <ModalWrapper
      headerTitle="انتخاب شهر"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      headerExtraEl={
        <div className="px-20 mt-16">
          <SearchBox
            inputName={"cities-search"}
            placeholder={"جستجوی شهر ها"}
            value={citySearchText}
            onChange={(value) => setCitySearchText(value)}
          />
        </div>
      }
      bodyContainerClassname="!pt-136 md:!pt-0"
      modalClassname="md:!w-[560px]"
      customOnBackClick={() => {
        handleClose();
        handleGoBack();
      }}
      // headerHasGoBackBtn={true}
    >
      {isLoading || !provincesAndCities ? (
        <TinyLoader />
      ) : (
        provincesAndCities
          .find((province: IProvincesAndCities) => {
            if (!!formik) {
              return province.id === formik.values[provinceInputName as string]?.id;
            } else {
              return province.id === selectedProvince?.id;
            }
          })
          ?.cities?.filter((city: string) => city.includes(citySearchText))
          ?.map((cityName: string, i: number) => {
            return (
              <div
                onClick={() => {
                  if (!!setSelectedCity) {
                    setSelectedCity(cityName);
                  }

                  if (formik) {
                    formik.setFieldValue(cityInputName, cityName);
                  }

                  if (!!onSelectOfCityCb) {
                    onSelectOfCityCb(cityName);
                  }

                  handleClose();
                }}
                key={cityName + i}
                className={`
                  py-16 text-14 leading-24 text-black font-r
                  border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] last:border-b-none
                `}
              >
                {cityName}
              </div>
            );
          })
      )}
    </ModalWrapper>
  );
}

export default CitiesListModal;
