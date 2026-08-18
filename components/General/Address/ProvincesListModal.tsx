import { useQuery } from "@tanstack/react-query";
import { getProvincesAndCities } from "api/address";
import { IProvincesAndCities } from "interfaces/Address";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import SearchBox from "components/General/SearchBox";
import ModalWrapper from "../core/ModalWrapper";
import { new_res_lat_long_enum } from "@/constants/new_res_lat_long";

function ProvincesListModal({
  isModalOpen,
  handleClose,
  // selectedProvince,
  setSelectedProvince,
  handleAfterSelect,
  setSelectedCity,
  provinceInputName,
  cityInputName,
  formik,
}: {
  isModalOpen: boolean;
  handleClose: () => void;
  setSelectedProvince?: // required in case 'formik' is NOT provided.
  Dispatch<
    SetStateAction<
      | {
          id: number;
          name: string;
        }
      | undefined
    >
  >;
  handleAfterSelect: () => void;
  setSelectedCity?: Dispatch<SetStateAction<string | undefined>>; // required in case 'formik' is NOT provided.
  provinceInputName?: string; // required in case 'formik' is provided.
  cityInputName?: string; // required in case 'formik' is provided.
  formik?: any;
}) {
  const [provincesAndCities, setProvincesAndCities] = useState<IProvincesAndCities[]>();

  const [provinceSearchText, setProvinceSearchText] = useState<string>("");

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
      headerTitle="انتخاب استان"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      headerExtraEl={
        <div className="px-20 mt-16">
          <SearchBox
            inputName={"provinces-search"}
            placeholder={"جستجوی استان ها"}
            value={provinceSearchText}
            onChange={(value) => setProvinceSearchText(value)}
          />
        </div>
      }
      bodyContainerClassname="!pt-136 md:!pt-0"
      modalClassname="md:!w-[560px]"
    >
      <div className="pb-40 md:pb-0">
        {isLoading || !provincesAndCities ? (
          <TinyLoader />
        ) : (
          provincesAndCities
            ?.filter((el) => el.name.includes(provinceSearchText))
            ?.map((province, i: number) => {
              return (
                <div
                  onClick={() => {
                    if (!!setSelectedProvince && !!setSelectedCity) {
                      setSelectedProvince({ id: province.id, name: province.name });
                      localStorage.setItem(
                        new_res_lat_long_enum.NEW_RES_PROVINCE_LAT,
                        province.latitude
                      );
                      localStorage.setItem(
                        new_res_lat_long_enum.NEW_RES_PROVINCE_LONG,
                        province.longitude
                      );
                      // reset the selected city -- maybe user has changed the previously selected province
                      setSelectedCity(undefined);
                    }

                    if (!!formik) {
                      formik?.setFieldValue(provinceInputName, {
                        id: province.id,
                        name: province.name,
                      });
                      // reset the selected city -- maybe user has changed the previously selected province
                      formik?.setFieldValue(cityInputName, undefined);
                    }

                    handleClose();
                    handleAfterSelect();
                  }}
                  key={province.id}
                  className={`
                  py-16 text-14 leading-24 text-black font-r
                  border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] last:border-b-none
                `}
                >
                  {province.name}
                </div>
              );
            })
        )}
      </div>
    </ModalWrapper>
  );
}

export default ProvincesListModal;
