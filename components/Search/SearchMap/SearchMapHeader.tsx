import { Button } from "@/components/General/core/Button";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import { useMap } from "react-leaflet";

function SearchMapHeader({
  setShowSearchMapModal,
  setShowGeneralFiltersModal,
}: {
  setShowSearchMapModal: Dispatch<SetStateAction<boolean>>;
  setShowGeneralFiltersModal: Dispatch<SetStateAction<boolean>>;
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const map = useMap();

  function handleSearchThisMapArea() {
    const mapBounds = map.getBounds();

    removeSomeQueryParameters_Then_AddSomeQueryParameters(
      router,
      ["min_lat", "max_lat", "min_lng", "max_lng"],
      [
        ["min_lat", mapBounds?.getSouthWest()?.lat],
        ["max_lat", mapBounds?.getNorthEast()?.lat],
        ["min_lng", mapBounds?.getSouthWest()?.lng],
        ["max_lng", mapBounds?.getNorthEast()?.lng],
      ]
    );
  }

  return (
    <div className="fixed top-24 right-20 left-20 md:right-1/2 md:left-auto md:translate-x-1/2 z-[3] flex items-center gap-x-16">
      {!isDesktop && (
        <Button
          onClick={() => {
            setShowSearchMapModal(false);
          }}
          color="white"
          className="!w-40 !h-40 shrink-0 md:hidden"
        >
          <i className="icon-Close text-20 text-black" />
        </Button>
      )}

      {!!isDesktop && (
        <Button
          color={"tertiary"}
          className="grow md:grow-0 hidden md:flex"
          onClick={handleSearchThisMapArea}
        >
          جستجوی این محدوده از نقشه
        </Button>
      )}

      {!isDesktop && (
        <Button
          color={"white"}
          className="grow md:grow-0 md:hidden"
          onClick={handleSearchThisMapArea}
        >
          جستجو در این محدوده
        </Button>
      )}

      {!isDesktop && (
        <Button
          color="white"
          className="!w-40 !h-40 shrink-0 md:hidden"
          onClick={() => {
            setShowGeneralFiltersModal(true);
          }}
        >
          <i className="icon-Filters text-20 text-black" />
        </Button>
      )}
    </div>
  );
}

export default SearchMapHeader;
