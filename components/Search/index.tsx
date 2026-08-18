import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ISearchResidences_ServerResp } from "@/interfaces/Search/SearchResp";
import FiltersSection from "./Filters/FiltersSectionIndex";
import ContentHeader from "./ContentHeader";
import dynamic from "next/dynamic";
import { SearchResidenceCardSkeleton } from "./Skeletons/SearchResidenceCardSkeleton";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import SearchMap from "./SearchMap";
import { useSearchResidences } from "Hooks/SearchPages/useSearchResidences";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { Moment } from "moment-jalaali";
import RenderResidences from "./RenderResidences";
// import LazyLoad from "react-lazyload";
import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
// import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
import { search_pages_pageSize } from "@/constants/search_pages_pageSize";
// import { useSearchMetas } from "Hooks/SearchPages/useSearchMetas";
import { useSearchData } from "Hooks/SearchPages/useSearchData";
// import Head from "next/head";
import { renderSearchPagination } from "@/utilities/renderSearchPagination";
import RelatedSearches from "../General/RelatedSearches";
import AboutInSearch from "./AboutInSearch";
const Pagination = dynamic(() => import("../General/Pagination/Pagination"), {
  ssr: true,
});
const CallSupportBottomSheet = dynamic(
  () => import("@/components/Support/CallSupportBottomSheet"),
  {
    ssr: true,
  }
);
const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), {
  ssr: true,
});
const WhereYouWannaGoModals = dynamic(
  () => import("./WhereYouWannaGoSearchBox/WhereYouWannaGoModals"),
  {
    ssr: true,
  }
);
const ChooseNumberOfPeopleBottomSheet = dynamic(
  () => import("./Filters/PeopleNumberFilter/ChooseNumberOfPeopleBottomSheet"),
  {
    ssr: true,
  }
);
const OneNightPriceFilterBottomSheet = dynamic(
  () => import("./Filters/OneNightPriceFilter/OneNightPriceFilterBottomSheet"),
  {
    ssr: true,
  }
);
const ResidenceTypeFilterBottomSheet = dynamic(
  () => import("./Filters/ResidenceTypeFilter/ResidenceTypeFilterBottomSheet"),
  {
    ssr: true,
  }
);
const SearchMapModal = dynamic(() => import("./SearchMap/SearchMapModal"), {
  ssr: true,
});
const WhereYouWannaGo = dynamic(() => import("./WhereYouWannaGo"), {
  ssr: true,
});
const NoResidenceFound = dynamic(() => import("./NoResidenceFound"), {
  ssr: true,
});
const GeneralFiltersModal = dynamic(() => import("./Filters/GeneralFilters/GeneralFiltersModal"), {
  ssr: true,
});
const ChooseEnterAndExitDaysCalendarModal = dynamic(
  () => import("@/components/ObserveResidenceDetails/ChooseEnterAndExitDaysCalendarModal"),
  {
    ssr: false,
  }
);

function Search() {
  const router = useRouter();
  const [fetchTriggeredByPagination, setFetchTriggeredByPagination] = useState<boolean>(false);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [showCallSupportBottomSheet, setShowCallSupportBottomSheet] = useState<boolean>(false);
  const [showSearchMapModal, setShowSearchMapModal] = useState<boolean>(false);

  const [showGeneralFiltersModal, setShowGeneralFiltersModal] = useState<boolean>(false);
  const [showChooseEnterAndExitDaysCalendarModal, setShowChooseEnterAndExitDaysCalendarModal] =
    useState<boolean>(false);
  const [tmpSelectedRanges, setTmpSelectedRanges] = useState<
    [
      Moment, // start day of range
      Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
    ][]
  >([]);
  const [showChooseNumberOfPeopleBottomSheet, setShowChooseNumberOfPeopleBottomSheet] =
    useState<boolean>(false);
  const [showOneNightPriceFilterBottomSheet, setShowOneNightPriceFilterBottomSheet] =
    useState<boolean>(false);
  const [showResidenceTypeFilterBottomSheet, setShowResidenceTypeFilterBottomSheet] =
    useState<boolean>(false);

  const { data, isLoading, isFetching, isInitialLoading } = useSearchResidences();

  // const { data: searchMetasData } = useSearchMetas();
  const {
    data: searchPageData,
    isLoading: searchPageDataIsLoading,
    isFetching: searchPageDataIsFetching,
  } = useSearchData();

  const [showWhereYouWannaGoModal, setShowWhereYouWannaGoModal] = useState<boolean>(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState<boolean>(false);

  const router_pathname = router.pathname;

  useEffect(() => {
    if (!!data) {
      if (data?.status === "error") {
        // nothing felan
      } else {
        if (!!fetchTriggeredByPagination) {
          setFetchTriggeredByPagination(false);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <>
      {/* {!router.pathname.startsWith("/search") &&
        !router.pathname.startsWith("/boomgardi") &&
        !router.pathname.startsWith("/hotel") &&
        !router.pathname.startsWith("/tags") && (
          <Head> */}
      {/* <title>
              {!searchMetasData
                ? "جستجو | لیدوما تریپ در حال بارگذاری نتایج ..."
                : searchMetasData?.params?.meta_title ||
                  searchMetasData?.params?.page_title ||
                  searchMetasData?.params?.meta_keywords ||
                  searchMetasData?.params?.meta_description}
            </title>
            {!!searchMetasData?.params?.canonical_url && ( */}
      {/* <link
                rel="canonical"
                // href={`https://lidomatrip.com${searchMetasData?.params?.canonical_url}`}
                href={`https://lidomatrip.com${router?.asPath}`}
              /> */}
      {/* )} */}
      {/* {!!searchMetasData?.params?.meta_title && (
              <meta name="title" content={searchMetasData?.params?.meta_title} />
            )}
            {!!searchMetasData?.params?.meta_description && (
              <meta name="description" content={searchMetasData?.params?.meta_description} />
            )} */}
      {/* </Head>
        )} */}

      <div>
        <div
          id="FiltersSectionWrapper"
          className="fixed right-0 left-0 top-[56px] md:!top-72 md:py-12 pb-10 border-b-1 border-solid border-b-gray-F2F2F7 bg-white !bg-opacity-95 backdrop-blur-xl z-[3] transition-all duration-500 ease-in-out"
        >
          <div
            className="CustomContainer2 md:hidden"
            onClick={() => setShowWhereYouWannaGoModal(true)}
          >
            {!isDesktop && (
              <WhereYouWannaGo setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal} />
            )}
          </div>
          <FiltersSection
            setShowGeneralFiltersModal={setShowGeneralFiltersModal}
            showChooseEnterAndExitDaysCalendarModal={showChooseEnterAndExitDaysCalendarModal}
            setShowChooseEnterAndExitDaysCalendarModal={setShowChooseEnterAndExitDaysCalendarModal}
            tmpSelectedRanges={tmpSelectedRanges}
            setTmpSelectedRanges={setTmpSelectedRanges}
            setShowChooseNumberOfPeopleBottomSheet={setShowChooseNumberOfPeopleBottomSheet}
            setShowOneNightPriceFilterBottomSheet={setShowOneNightPriceFilterBottomSheet}
            setShowResidenceTypeFilterBottomSheet={setShowResidenceTypeFilterBottomSheet}
          />
        </div>

        {/* content */}
        <div
          id="SearchPageContent"
          className="pt-[193px] md:!pt-120 CustomContainer2 transition-all duration-500 ease-in-out"
        >
          <ContentHeader
            counterIsLoading={isLoading || (isFetching && !fetchTriggeredByPagination)}
            nameIsLoading={searchPageDataIsLoading || searchPageDataIsFetching}
            count={(data?.params as ISearchResidences_ServerResp)?.count}
            name={!!searchPageData?.params?.page_title ? searchPageData?.params?.page_title : ""}
          />

          <section className="">
            {/* cart mapping wrapper */}
            {isLoading || isFetching ? (
              <div className="grid grid-cols-12 gap-x-16 gap-y-24">
                {Array.from({ length: search_pages_pageSize }).map((_, i) => (
                  <div className="col-span-full sm:col-span-4 md:col-span-3" key={i}>
                    <SearchResidenceCardSkeleton />
                  </div>
                ))}
              </div>
            ) : (data?.params as ISearchResidences_ServerResp)?.products?.length === 0 ? (
              <NoResidenceFound />
            ) : (
              <ul className="grid grid-cols-12 gap-x-16 gap-y-24">
                <RenderResidences
                  residencesList={(data?.params as ISearchResidences_ServerResp)?.products}
                  peak_dates={data?.params?.peak_dates}
                />
              </ul>
            )}

            {!!renderSearchPagination(
              !!router?.query?.page ? Number(router?.query?.page) : 1,
              search_pages_pageSize,
              (data?.params as ISearchResidences_ServerResp)?.count
            ) && (
              <nav className="mt-24 md:mt-40 md:w-[280px] mx-auto">
                <Pagination
                  className={`flex items-center justify-center`}
                  currentPage={!!router?.query?.page ? Number(router?.query?.page) : 1}
                  siblingCount={!!isDesktop ? 1 : 0}
                  totalCount={(data?.params as ISearchResidences_ServerResp)?.count}
                  pageSize={search_pages_pageSize}
                  onPageChange={(page: number) => {
                    removeSomeQueryParameters_Then_AddSomeQueryParameters(
                      router,
                      ["page"],
                      [["page", page]],
                      undefined,
                      false
                    );
                    setFetchTriggeredByPagination(true);
                  }}
                />

                {/* <Button
                  variant="outlined"
                  color="black"
                  isFullWidth
                  onClick={() => {
                    // setPageSize((prev) => prev + 20);
                    removeSomeQueryParameters_Then_AddSomeQueryParameters(
                      router,
                      ["page"],
                      [["page", !!router?.query?.page ? Number(router?.query?.page) + 1 : 2]],
                      undefined,
                      false
                    );
                    setFetchTriggeredByPagination(true);
                  }}
                  rightIcon={<i className="icon-Plus hidden md:block text-20 text-black" />}
                  isLoading={isFetching || isLoading}
                  loadingText="در حال دریافت اطلاعات"
                  loadingTextClassName="ml-8 text-primary-main"
                >
                  مشاهده نتایج بیشتر
                </Button> */}
              </nav>
            )}

            <aside
              id="SearchPage-BottomFloater"
              className="fixed left-20 right-20 md:sticky bottom-78 md:!bottom-40 z-2 transition-all duration-500 ease-in-out"
            >
              <SearchMap
                showSearchMapModal={showSearchMapModal}
                setShowSearchMapModal={setShowSearchMapModal}
                setShowCallSupportBottomSheet={setShowCallSupportBottomSheet}
              />
            </aside>
          </section>
        </div>
        {router_pathname !== "/alternatives/[alt_order]" &&
          router_pathname !== "/crm/city/[lead_id]" && (
            <section className="bg-gray-F0F0F0 border-gray-E5E5E6 pt-20 mt-24 pb-[100px] md:pb-40">
              <RelatedSearches tags={searchPageData?.params?.related_tags} />

              {!!searchPageData?.params?.description &&
                (data?.params as ISearchResidences_ServerResp)?.products?.length !== 0 && (
                  <>
                    {/* <LazyLoad height={320} once offset={150}> */}
                    <AboutInSearch
                      title={searchPageData?.params?.content_title || ""}
                      description={searchPageData?.params?.description}
                    />
                    {/* </LazyLoad> */}
                  </>
                )}
            </section>
          )}
      </div>

      {!!showChooseEnterAndExitDaysCalendarModal && (
        <ChooseEnterAndExitDaysCalendarModal
          isModalOpen={showChooseEnterAndExitDaysCalendarModal}
          handleClose={() => setShowChooseEnterAndExitDaysCalendarModal(false)}
          min_reservable_days={undefined}
          discounted_days={[]}
          fast_days={[]}
          filled_dates={[]}
          noCoOperation={false}
          peak_dates={[]}
          reserved_dates={[]}
          special_dates={[]}
          prices={{}}
          selectedRanges={tmpSelectedRanges}
          setSelectedRanges={setTmpSelectedRanges}
          onSubmit={(givenSelectedRanges: [Moment, Moment][]) => {
            removeSomeQueryParameters_Then_AddSomeQueryParameters(
              router,
              ["start", "end"],
              [
                ["start", givenSelectedRanges[0][0].format("jYYYY/jMM/jDD")],
                ["end", givenSelectedRanges?.[0]?.[1].format("jYYYY/jMM/jDD")],
              ]
            );

            setShowChooseEnterAndExitDaysCalendarModal(false);
          }}
        />
      )}

      {!!showChooseNumberOfPeopleBottomSheet && (
        <BottomSheet
          open={showChooseNumberOfPeopleBottomSheet}
          handleClose={() => setShowChooseNumberOfPeopleBottomSheet(false)}
          headerTitle="تعداد نفرات"
          body={({ handleSmoothClose }) => {
            return <ChooseNumberOfPeopleBottomSheet handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}

      {!!showOneNightPriceFilterBottomSheet && (
        <BottomSheet
          open={showOneNightPriceFilterBottomSheet}
          handleClose={() => setShowOneNightPriceFilterBottomSheet(false)}
          headerTitle="قیمت برای هر شب"
          body={({ handleSmoothClose }) => {
            return <OneNightPriceFilterBottomSheet handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}

      {!!showResidenceTypeFilterBottomSheet && (
        <BottomSheet
          open={showResidenceTypeFilterBottomSheet}
          handleClose={() => setShowResidenceTypeFilterBottomSheet(false)}
          headerTitle="نوع اقامتگاه"
          body={({ handleSmoothClose }) => {
            return <ResidenceTypeFilterBottomSheet handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}

      {!!showSearchMapModal && (
        <SearchMapModal
          showSearchMapModal={showSearchMapModal}
          setShowSearchMapModal={setShowSearchMapModal}
          setShowGeneralFiltersModal={setShowGeneralFiltersModal}
        />
      )}

      {!!showGeneralFiltersModal && (
        <GeneralFiltersModal
          showGeneralFiltersModal={showGeneralFiltersModal}
          setShowGeneralFiltersModal={setShowGeneralFiltersModal}
        />
      )}

      {(!!showCitiesListModal || !!showWhereYouWannaGoModal) && !isDesktop && (
        <WhereYouWannaGoModals
          setShowCitiesListModal={setShowCitiesListModal}
          setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
          showCitiesListModal={showCitiesListModal}
          showWhereYouWannaGoModal={showWhereYouWannaGoModal}
        />
      )}

      {!isDesktop && !!showCallSupportBottomSheet && (
        <BottomSheet
          open={showCallSupportBottomSheet}
          handleClose={() => setShowCallSupportBottomSheet(false)}
          headerTitle="تماس با پشتیبانی"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return <CallSupportBottomSheet handleSmoothClose={handleSmoothClose} />;
          }}
        />
      )}
    </>
  );
}

export default Search;
