import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useRef, useState } from "react";
const ChooseNumberOfPeopleFloatingBox = dynamic(() => import("./ChooseNumberOfPeopleFloatingBox"), {
  ssr: true,
});
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});

function PeopleNumberFilter({
  setShowChooseNumberOfPeopleBottomSheet,
}: {
  setShowChooseNumberOfPeopleBottomSheet: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const peopleNumberFilterWrapperRef = useRef<any>(null);
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [showChooseNumberOfPeopleFloatingBox, setShowChooseNumberOfPeopleFloatingBox] =
    useState<boolean>(false);

  const numberOfPeople = router?.query?.guests_count;

  function clearGuestsCountFilterFromUrlFilters() {
    removeQueryParameters(router, [{ paramKey: "guests_count" }, { paramKey: "page" }]);
  }

  return (
    <div className="relative shrink-0">
      <div
        className={`
          px-8 cursor-pointer h-32
          border-1 border-solid
          rounded-50 flex items-center
          ${
            !!numberOfPeople
              ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
              : "border-gray-CACFD3"
          }
        `}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label="انتخاب تعداد نفرات"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            (e.currentTarget as HTMLElement).click();
          }
        }}
        onClick={() => {
          if (!!isDesktop) {
            setShowChooseNumberOfPeopleFloatingBox((prev) => !prev);
          } else {
            setShowChooseNumberOfPeopleBottomSheet(true);
          }
        }}
        ref={peopleNumberFilterWrapperRef}
      >
        <div className="flex items-center gap-x-6 pl-8">
          <i className="icon-ProfileFill text-16" />

          <span className="text-12 leading-16 font-m text-black text-nowrap">
            {!!numberOfPeople ? `${numberOfPeople} نفر` : "تعداد نفرات"}
          </span>
        </div>

        {!!numberOfPeople && (
          <CloseBtn
            onClose={(e) => {
              e.preventDefault();
              e.stopPropagation();

              clearGuestsCountFilterFromUrlFilters();
            }}
          />
        )}
      </div>

      {!!showChooseNumberOfPeopleFloatingBox && (
        <ChooseNumberOfPeopleFloatingBox
          setShowChooseNumberOfPeopleFloatingBox={setShowChooseNumberOfPeopleFloatingBox}
          peopleNumberFilterWrapperRef={peopleNumberFilterWrapperRef}
        />
      )}
    </div>
  );
}

export default PeopleNumberFilter;
