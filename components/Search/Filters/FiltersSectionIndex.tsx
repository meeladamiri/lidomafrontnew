import CalendarFilter from "./CalendarFilter";
import GeneralFilters from "./GeneralFilters";
import PeopleNumberFilter from "./PeopleNumberFilter";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";
const ResidenceTypeFilter = dynamic(() => import("./ResidenceTypeFilter"), {
  ssr: true,
});
const OneNightPriceFilter = dynamic(() => import("./OneNightPriceFilter"), {
  ssr: true,
});

function FiltersSection({
  setShowGeneralFiltersModal,
  setShowChooseEnterAndExitDaysCalendarModal,
  tmpSelectedRanges,
  setTmpSelectedRanges,
  setShowChooseNumberOfPeopleBottomSheet,
  setShowOneNightPriceFilterBottomSheet,
  setShowResidenceTypeFilterBottomSheet,
}: {
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
  showChooseEnterAndExitDaysCalendarModal: boolean;
  setShowChooseEnterAndExitDaysCalendarModal: Dispatch<SetStateAction<boolean>>;
  tmpSelectedRanges: [
    moment.Moment, // start day of range
    moment.Moment | null // end day of range ('null' in case the start day is selected but the end day is not.)
  ][];
  setTmpSelectedRanges: Dispatch<SetStateAction<[moment.Moment, moment.Moment | null][]>>;
  setShowChooseNumberOfPeopleBottomSheet: Dispatch<SetStateAction<boolean>>;
  setShowOneNightPriceFilterBottomSheet: Dispatch<SetStateAction<boolean>>;
  setShowResidenceTypeFilterBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <nav>
      <div className="CustomContainer2">
        <ul className="flex items-center gap-x-8 md:gap-x-10 hideScrollbar overflow-x-scroll md:overflow-x-visible">
          <li>
            <CalendarFilter
              setShowChooseEnterAndExitDaysCalendarModal={
                setShowChooseEnterAndExitDaysCalendarModal
              }
              tmpSelectedRanges={tmpSelectedRanges}
              setTmpSelectedRanges={setTmpSelectedRanges}
              noCoOperation={false}
            />
          </li>
          <li>
            <PeopleNumberFilter
              setShowChooseNumberOfPeopleBottomSheet={setShowChooseNumberOfPeopleBottomSheet}
            />
          </li>
          <span className="h-24 border-r-1 border-solid border-r-gray-CACFD3"></span>
          <li>
            <GeneralFilters setShowGeneralFiltersModal={setShowGeneralFiltersModal} />
          </li>
          <li>
            <ResidenceTypeFilter
              setShowResidenceTypeFilterBottomSheet={setShowResidenceTypeFilterBottomSheet}
            />
          </li>
          <li>
            <OneNightPriceFilter
              setShowOneNightPriceFilterBottomSheet={setShowOneNightPriceFilterBottomSheet}
            />
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default FiltersSection;
