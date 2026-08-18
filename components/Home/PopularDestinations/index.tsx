import { useQuery } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";
import PopularDestinationItem from "./PopularDestinationItem";
import { ICityOrProvince, getPopularDestinations } from "@/api/Search/getPopularDestination";
import {
  ISearchKeywordResultsData,
  getSearchKeywordResults,
} from "@/api/Search/getSearchKeywordResults";
import SearchedDestinationItem from "./SearchedDestinationItem";
import { useRouter } from "next/router";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

function PopularDestinations({
  selectedCityOrProvince,
  setSelectedCityOrProvince,
  onSelectOfCityOrProvinceCb,
  searchCityOrProvinceText,
  setSearchCityOrProvinceText,
  fillInputsFromUrl,
  setShowCitiesDropdown,
  setShowMainSearchBox,
  wrapperClassname,
}: {
  selectedCityOrProvince: string;
  setSelectedCityOrProvince: Dispatch<SetStateAction<string>>;
  onSelectOfCityOrProvinceCb: () => void;
  searchCityOrProvinceText: string;
  setSearchCityOrProvinceText: Dispatch<SetStateAction<string>>;
  fillInputsFromUrl?: boolean;
  setShowCitiesDropdown: Dispatch<SetStateAction<boolean>>;
  setShowMainSearchBox?: Dispatch<SetStateAction<boolean>>;
  wrapperClassname?: string;
}) {
  const router = useRouter();
  const { data, isLoading } = useQuery(["getPopularDestinations"], () => {
    return getPopularDestinations();
  });

  const {
    data: searchKeywordResultsData,
    // isSuccess: searchKeywordResultsIsSuccess,
    // isLoading: searchKeywordResultsIsLoading,
  } = useQuery(
    ["getPopularDestinations", searchCityOrProvinceText],
    () => {
      return getSearchKeywordResults({ name: searchCityOrProvinceText });
    },
    {
      enabled: !!searchCityOrProvinceText,
    }
  );

  return (
    <div
      className={`h-[295px] absolute z-2 -bottom-8 right-0 translate-y-full w-320 bg-white px-24 py-16 rounded-16 shadow-[0px_8px_32px_rgba(24,39,58,0.15)] ${wrapperClassname}`}
    >
      {!searchCityOrProvinceText && (
        <h2 className="text-14 leading-20 text-black font-m mb-16">مقصد های محبوب</h2>
      )}

      <div className="h-[calc(100%-36px)] overflow-y-auto">
        {isLoading ? (
          <TinyLoader />
        ) : !!searchCityOrProvinceText ? (
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
                      setSelectedCityOrProvince(item.title_en);

                      setSearchCityOrProvinceText(item.name);

                      if (!!onSelectOfCityOrProvinceCb) {
                        onSelectOfCityOrProvinceCb();
                      }
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

                      setShowCitiesDropdown(false);
                      if (!!setShowMainSearchBox) {
                        setShowMainSearchBox(false);
                      }
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
        ) : (
          <div>
            {data?.params?.cities
              ?.filter((el: any) => (el?.name as string).includes(searchCityOrProvinceText))
              ?.map((item: ICityOrProvince, index: number) => {
                return (
                  <PopularDestinationItem
                    itemType={"city"}
                    image={item.image}
                    key={`${item.id}-${index}`}
                    id={item.id}
                    name={item.name}
                    onItemClick={() => {
                      setSelectedCityOrProvince(item.title_en);

                      setSearchCityOrProvinceText(item.name);

                      if (!!onSelectOfCityOrProvinceCb) {
                        onSelectOfCityOrProvinceCb();
                      }
                    }}
                    resCounts={item.count}
                  />
                );
              })}
            {data?.params?.provinces
              ?.filter((el: any) => (el?.name as string).includes(searchCityOrProvinceText))
              ?.map((item: ICityOrProvince, index: number) => {
                return (
                  <PopularDestinationItem
                    itemType={"province"}
                    image={item.image}
                    key={`${item.id}-${index}`}
                    id={item.id}
                    name={item.name}
                    onItemClick={() => {
                      setSelectedCityOrProvince(item.title_en);

                      setSearchCityOrProvinceText(item.name);

                      if (!!onSelectOfCityOrProvinceCb) {
                        onSelectOfCityOrProvinceCb();
                      }
                    }}
                    resCounts={item.count}
                  />
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
export default PopularDestinations;
