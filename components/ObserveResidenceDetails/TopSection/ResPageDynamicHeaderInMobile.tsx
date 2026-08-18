import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { LinkButton } from "@/components/General/core/Button";
import SideNavbar from "@/layouts/SideNavbar";
import { useUserProfile } from "@/providers/Profile";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

function ResPageDynamicHeaderInMobile({
  setShowShareBottomSheet,
}: {
  setShowShareBottomSheet: Dispatch<SetStateAction<IShare>>;
}) {
  const router = useRouter();
  const profileData = useUserProfile();

  const curScrollRef = useRef<number>();
  const prevScrollRef = useRef<number>();
  const curDirectionRef = useRef<number>();
  const prevDirectionRef = useRef<number>();

  const [isSideNavbarOpen, setIsSideNavbarOpen] = useState<boolean>(false);

  const show_after = 56; // pixels

  function changeHeaderVisibility() {
    const headerEl = document.querySelector("#ResPageDynamicHeaderInMobile");

    if (window.scrollY >= show_after) {
      headerEl?.classList?.add("!top-0");
    } else {
      headerEl?.classList.remove("!top-0");
    }
  }

  useEffect(() => {
    curScrollRef.current = window.scrollY;
    prevScrollRef.current = window.scrollY;
    curDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0
    prevDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0

    // router.events.on("routeChangeStart", removeHomePageEvents);
    window.addEventListener("scroll", changeHeaderVisibility);

    () => {
      // router.events.off("routeChangeStart", removeHomePageEvents);
      window.removeEventListener("scroll", changeHeaderVisibility);
    };
  }, []);

  return (
    <div
      id="ResPageDynamicHeaderInMobile"
      className="fixed -top-120 right-0 left-0 py-8 px-16 bg-white z-[6] transition-all duration-500 ease-in-out"
    >
      <div className="flex items-center justify-between">
        <div
          className="flex items-center justify-center gap-x-8"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            router.back();
          }}
        >
          <i className="icon-Back text-24 text-black cursor-pointer" />
          <div className="border-r border-gray-C4CAD3 pr-8 flex items-center">
            <span className="text-gray-959FA7 text-[17px] leading-24 font-r">کد :</span>
            <span className="text-black text-[17px] leading-24 font-r">{router?.query?.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-x-8">
          <LinkButton
            href="tel:02191070021"
            className="!py-6 !pr-12"
            color="secondary"
            rightIcon={<i className="icon-Phone text-white text-20" />}
            rounded
          >
            رزرو تلفنی
          </LinkButton>
          <div
            onClick={() => {
              setIsSideNavbarOpen((prev) => !prev);
            }}
          >
            <i className="icon-Menu text-32" />
          </div>
        </div>
      </div>
      {!!isSideNavbarOpen && (
        <SideNavbar isSideNavbarOpen={isSideNavbarOpen} setIsSideNavbarOpen={setIsSideNavbarOpen} />
      )}
    </div>
  );
}

export default ResPageDynamicHeaderInMobile;
