import dynamic from "next/dynamic";
const UserHasCurrentTrip = dynamic(() => import("./UserHasCurrentTrip"), {
  ssr: true,
});
const RenderNonAuthenticatedUserNavbarItems = dynamic(
  () => import("./RenderNonAuthenticatedUserNavbarItems"),
  {
    ssr: true,
  }
);
const RenderHostNavbarItems = dynamic(() => import("./RenderHostNavbarItems"), {
  ssr: true,
});
const RenderGuestNavbarItems = dynamic(() => import("./RenderGuestNavbarItems"), {
  ssr: true,
});
import { UserType_enum, useUserProfile } from "@/providers/Profile";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { Search_pages_Routes } from "@/constants/SearchPagesRoutes";
import LidomaAppNotification from "./LidomaAppNotification";

function BottomNavbar() {
  const [showLidomaAppNotification, setShowLidomaAppNotification] = useState(true);

  const router = useRouter();
  const profileData = useUserProfile();

  const footerRef = useRef<any>();
  const curScrollRef = useRef<number>();
  const prevScrollRef = useRef<number>();
  const curDirectionRef = useRef<number>();
  const prevDirectionRef = useRef<number>();

  const handleScroll = () => {
    const searchPageBottomFloater = document.querySelector("#SearchPage-BottomFloater");
    const searchPageMapBtnText = document.querySelector("#SearchPage-MapBtnText");
    // For header's hide/show on scroll up&down in mobile
    curScrollRef.current = window.scrollY;
    if (curScrollRef?.current > (prevScrollRef?.current as number)) {
      // scrolled down
      curDirectionRef.current = 2;
    } else {
      // scrolled up
      curDirectionRef.current = 1;
    }

    if (curDirectionRef?.current !== prevDirectionRef?.current) {
      // toggleHeader();
      if (curDirectionRef?.current === 2) {
        footerRef?.current?.classList?.add("translate-y-[57px]");
        footerRef?.current?.classList?.remove("translate-y-0");
        searchPageBottomFloater?.classList.add("!bottom-16");
        searchPageMapBtnText?.classList.remove("!w-40");
        searchPageMapBtnText?.classList.remove("md:!w-auto");
      } else if (curDirectionRef.current === 1) {
        footerRef?.current?.classList?.remove("translate-y-[57px]");
        footerRef?.current?.classList?.add("translate-y-0");
        searchPageBottomFloater?.classList.remove("!bottom-16");
        searchPageMapBtnText?.classList.add("!w-40");
        searchPageMapBtnText?.classList.add("md:!w-auto");
      }
    }
    prevDirectionRef.current = curDirectionRef.current;
    prevScrollRef.current = curScrollRef.current;
  };

  useEffect(() => {
    if (Search_pages_Routes.includes(router.pathname)) {
      curScrollRef.current = window.scrollY;
      prevScrollRef.current = window.scrollY;
      curDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0
      prevDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0

      window.addEventListener("scroll", handleScroll);
    }

    () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [router.pathname]);

  return (
    <>
      <nav
        ref={footerRef}
        className={`
          flex flex-col md:hidden fixed z-5 bottom-0 right-0 left-0 transition-all duration-500 ease-in-out md:transition-none md:translate-y-0
        `}
      >
        {!!profileData?.current_trip ? (
          <UserHasCurrentTrip />
        ) : router.pathname === "/" ? (
          <LidomaAppNotification
            showLidomaAppNotification={showLidomaAppNotification}
            setShowLidomaAppNotification={setShowLidomaAppNotification}
          />
        ) : null}
        <div
          className={`
            flex items-center justify-center bg-white w-full bg-opacity-90 backdrop-blur-xl pt-6 border-t-1 border-solid border-gray-C4CAD3
            ${
              profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC
                ? "gap-x-18"
                : !!profileData.is_host
                ? "gap-x-12"
                : ""
            }
          `}
        >
          {profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC ? (
            // show non-authenticated user bottom navbar items
            <RenderNonAuthenticatedUserNavbarItems />
          ) : // user is authenticated and is host or guest
          !!profileData.is_host ? (
            <RenderHostNavbarItems />
          ) : (
            <RenderGuestNavbarItems />
          )}
        </div>
      </nav>
    </>
  );
}
export default BottomNavbar;
