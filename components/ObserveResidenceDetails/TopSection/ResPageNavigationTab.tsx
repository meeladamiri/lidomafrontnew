// import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";

function ResPageNavigationTab({
  name,
  tabCustomClassname,
  selected,
  setSelected,
  scrollTo,
}: {
  name: string;
  tabCustomClassname?: string;
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
  scrollTo: string;
}) {

  useEffect(() => {
    const handleScroll = () => {
      const sectionScrollTo = document.querySelector(scrollTo);
      if (sectionScrollTo) {
        const sectionRect = sectionScrollTo.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (sectionRect.top >= 0 && sectionRect.top + 500 <= windowHeight) {
          // console.log("windowHeight", windowHeight);
          // console.log("sectionRect", scrollTo, sectionRect.top);
          setSelected(name);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [name, setSelected, scrollTo]);

  return (
    <div className="relative">
      <div
        onClick={() => {
          // setSelected(name);
          const sectionScrollTo = document.querySelector(scrollTo);
          const top = sectionScrollTo
            ? sectionScrollTo?.getBoundingClientRect().top + window.pageYOffset - 130
            : 0;

          window.scrollTo({ top: top, behavior: "smooth" });
          // sectionScrollTo?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }}
        className={`
        pt-4 md:pt-6 pr-6 pl-6 pb-8 md:pb-11
        cursor-pointer
          ${tabCustomClassname || ""}
          ${
            selected === name
              ? "after:content-[''] after:w-full after:inline after:absolute after:-bottom-1 after:right-0 after:h-2 md:after:h-3 after:bg-black after:rounded-tr-3 after:rounded-tl-3"
              : ""
          }
          `}
      >
        <span className="text-13 md:text-15 font-m leading-16 text-black">{name}</span>
      </div>
    </div>
  );
}

export default ResPageNavigationTab;
