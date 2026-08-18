import MainCategoriesOfResidencesInDesktop from "./MainCategoriesOfResidencesInDesktop";
import MainCategoriesOfResidencesInMobile from "./MainCategoriesOfResidencesInMobile";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function MainCategoriesOfResidences() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  return (
    <>
      <div className="flex justify-center md:relative">
        <div className="hidden md:flex md:justify-center md:items-center gap-x-40 first:pr-56 last:pl-56 rounded-12 absolute top-0 !-translate-y-[100%] bg-white shadow-[0_6px_12px_-2px_rgba(24,39,75,0.10)]">
          {!!isDesktop && <MainCategoriesOfResidencesInDesktop />}
        </div>
      </div>

      <div className="grid grid-cols-12 md:hidden gap-12">
        {!isDesktop && <MainCategoriesOfResidencesInMobile />}
      </div>
    </>
  );
}
export default MainCategoriesOfResidences;
