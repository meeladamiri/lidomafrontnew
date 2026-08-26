import ModalWrapper from "@/components/General/core/ModalWrapper";
import { Dispatch, SetStateAction } from "react";
import WhereYouWannaGoTextField from "./WhereYouWannaGoTextField";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import SquareSkeleton from "@/components/General/Skeletons/Square";
import { ICityOrProvince, getPopularDestinations } from "@/api/Search/getPopularDestination";
import { getProvincesAndCities } from "@/api/address";
import { IProvincesAndCities } from "@/interfaces/Address";
import ProvinceOrCityItem from "./ProvinceOrCityItem";
import { useRouter } from "next/router";
import { useGetCityIdMutation } from "Hooks/SearchPages/useGetCityIdMutation";
import {
  ISearchKeywordResultsData,
  getSearchKeywordResults,
} from "@/api/Search/getSearchKeywordResults";
import SearchedDestinationItem from "@/components/Home/PopularDestinations/SearchedDestinationItem";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

function WhereYouWannaGoModal({
  showWhereYouWannaGoModal,
  setShowWhereYouWannaGoModal,
  searchText,
  setSearchText,
  setSelectedProvince,
  setShowCitiesListModal,
}: {
  showWhereYouWannaGoModal: boolean;
  setShowWhereYouWannaGoModal: Dispatch<SetStateAction<boolean>>;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  setSelectedProvince: Dispatch<
    SetStateAction<
      | {
          id: number;
          name: string;
        }
      | undefined
    >
  >;
  setShowCitiesListModal: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const getCityIdMutation = useGetCityIdMutation();
  const { data, isLoading } = useQuery(["getPopularDestinations"], getPopularDestinations);

  const { data: provincesAndCitiesData, isLoading: provincesAndCitiesIsLoading } = useQuery(
    ["getProvincesAndCities"],
    getProvincesAndCities
  );

  function handleNavigate({ cityOrProvinceName }: { cityOrProvinceName: string }) {
    router.push({
      pathname: "/search/[id]",
      query: { id: cityOrProvinceName },
    });

    setShowWhereYouWannaGoModal(false);
  }

  const {
    data: searchKeywordResultsData,
    // isSuccess: searchKeywordResultsIsSuccess,
    // isLoading: searchKeywordResultsIsLoading,
  } = useQuery(
    ["getPopularDestinations", searchText],
    () => {
      return getSearchKeywordResults({ name: searchText });
    },
    {
      enabled: !!searchText,
    }
  );

  return (
    <ModalWrapper
      headerTitle="کجا میخوای بری ؟"
      onClose={() => {
        setShowWhereYouWannaGoModal(false);
      }}
      open={showWhereYouWannaGoModal}
      headerExtraEl={
        <div className="px-20 mt-16">
          <WhereYouWannaGoTextField
            readonly={false}
            value={searchText}
            onChange={(value) => setSearchText(value)}
          />
        </div>
      }
      bodyContainerClassname="!pt-[143px] md:!pt-0"
      modalClassname="md:!w-[560px]"
    >
      <div className="pb-40 md:pb-0">
        <div>
          {!searchText ? (
            <>
              <div className="mb-24">
                <h1 className="text-16 leading-24 text-black font-m mb-16">شهر های پر طرفدار</h1>

                <div className="Make_swiper_slide_width_auto">
                  <Swiper
                    slidesPerView={"auto"}
                    freeMode={true}
                    slideToClickedSlide={false}
                    spaceBetween={12}
                    mousewheel={true}
                    pagination={false}
                  >
                    {isLoading
                      ? Array.from({ length: 5 }).map((_, i) => (
                          <SwiperSlide key={i}>
                            <SquareSkeleton
                              heightClass="h-[96px]"
                              widthClass="w-[86px]"
                              borderRadiusClass="rounded-8"
                              marginsClassnames="mb-8"
                            />

                            <SquareSkeleton
                              heightClass="h-[20px]"
                              widthClass="w-[60%]"
                              borderRadiusClass="rounded-2"
                            />
                          </SwiperSlide>
                        ))
                      : (data?.params?.cities as ICityOrProvince[])?.map((city, i) => (
                          <SwiperSlide key={i}>
                            <div
                              className="group cursor-pointer"
                              onClick={() => {
                                handleNavigate({ cityOrProvinceName: city.title_en });
                              }}
                            >
                              <div className="w-[86px] h-[96px] mb-8 relative">
                                <Image
                                  src={city.image}
                                  fill
                                  style={{
                                    objectFit: "cover",
                                  }}
                                  alt=""
                                  className="rounded-8"
                                />
                              </div>

                              <p className="text-14 leading-20 text-black font-m group-hover:text-primary-main">
                                {city.name}
                              </p>
                            </div>
                          </SwiperSlide>
                        ))}
                  </Swiper>
                </div>

                <h1 className="text-16 leading-28 text-black font-m mb-16 mt-24">
                  استان های پر طرفدار
                </h1>

                <div className="Make_swiper_slide_width_auto">
                  <Swiper
                    slidesPerView={"auto"}
                    freeMode={true}
                    slideToClickedSlide={false}
                    spaceBetween={8}
                    mousewheel={true}
                    pagination={false}
                  >
                    {isLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <SwiperSlide key={i}>
                            <SquareSkeleton
                              heightClass="h-34"
                              widthClass="w-[82px]"
                              borderRadiusClass="rounded-full"
                            />
                          </SwiperSlide>
                        ))
                      : (data?.params?.provinces as ICityOrProvince[])?.map((province, i) => (
                          <SwiperSlide key={i}>
                            <div
                              onClick={() => {
                                handleNavigate({ cityOrProvinceName: province.title_en });
                              }}
                              className="px-24 py-6 rounded-full border-1 border-solid border-gray-CACFD3 text-14 leading-20 text-black font-r"
                            >
                              {province.name}
                            </div>
                          </SwiperSlide>
                        ))}
                  </Swiper>
                </div>
              </div>

              <div>
                <h1 className="text-16 leading-28 text-black font-m mb-28">
                  لیست شهرها و استان ها
                </h1>

                {provincesAndCitiesIsLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SquareSkeleton
                      key={i}
                      heightClass="h-48"
                      widthClass="w-full"
                      borderRadiusClass="rounded-2"
                      marginsClassnames="mb-12"
                    />
                  ))
                ) : (
                  <div>
                    {(provincesAndCitiesData?.params?.states as IProvincesAndCities[])
                      ?.filter((state) => state.name.includes(searchText))
                      ?.map((state, idx) => {
                        return (
                          <ProvinceOrCityItem
                            key={idx}
                            isCity={false}
                            provinceId={state.id}
                            name={state.name}
                            cityCount={state?.cities?.length}
                            setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
                            setShowCitiesListModal={setShowCitiesListModal}
                            setSelectedProvince={setSelectedProvince}
                          />
                        );
                      })}
                    {(provincesAndCitiesData?.params?.states as IProvincesAndCities[])
                      ?.map((state) => state.cities)
                      ?.flat(1)
                      ?.filter((cityName) => cityName.includes(searchText))
                      ?.map((cityName, index) => {
                        return (
                          <ProvinceOrCityItem
                            key={`${cityName}-${index}`}
                            isCity={true}
                            name={cityName}
                            setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
                            setShowCitiesListModal={setShowCitiesListModal}
                            setSelectedProvince={setSelectedProvince}
                            onClickOfCity={() => {
                              // navigae to that route -- possibly there is no pathname already
                              getCityIdMutation.mutate({
                                cityName,
                                onSuccessCb(cityOrProvinceName) {
                                  handleNavigate({ cityOrProvinceName });
                                },
                              });
                            }}
                          />
                        );
                      })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div>
              {(searchKeywordResultsData?.params as ISearchKeywordResultsData)?.categories
                ?.sort((a, b) => a.score - b.score)
                ?.map((item, idx) => {
                  return (
                    <SearchedDestinationItem
                      itemType={item.type}
                      isRes={false}
                      key={`${item.id}-${idx}`}
                      id={item.id}
                      name={item.name}
                      onItemClick={() => {
                        handleNavigate({ cityOrProvinceName: item.title_en });
                        // setSelectedCityOrProvince({
                        //   id: item.id,
                        //   name: item.name,
                        // });
                        // setSearchCityOrProvinceText(item.name);
                        // if (!!onSelectOfCityOrProvinceCb) {
                        //   onSelectOfCityOrProvinceCb();
                        // }
                      }}
                      resCounts={item.count}
                    />
                  );
                })}
              {(searchKeywordResultsData?.params as ISearchKeywordResultsData)?.residences
                ?.sort((a, b) => a.score - b.score)
                ?.map((item, idx) => {
                  return (
                    <SearchedDestinationItem
                      itemType={null}
                      isRes={true}
                      key={`${item.id}-${idx}`}
                      id={item.id}
                      name={item.name}
                      onItemClick={() => {
                        router.push(
                          `${getPropertyPageUrl({
                            residenceId: item.id,
                          })}`
                        );

                        // setShowCitiesDropdown(false);
                        // if (!!setShowMainSearchBox) {
                        //   setShowMainSearchBox(false);
                        // }

                        setShowWhereYouWannaGoModal(false);

                        // setSelectedCityOrProvince({
                        //   id: item.id,
                        //   name: item.name,
                        // });

                        // setSearchCityOrProvinceText(item.name);

                        // if (!!onSelectOfCityOrProvinceCb) {
                        //   onSelectOfCityOrProvinceCb();
                        // }
                      }}
                      // resCounts={item.count}
                    />
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

export default WhereYouWannaGoModal;
