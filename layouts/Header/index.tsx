import Image from "next/image";
import ChatBadge from "./ChatBadge";
import Link from "next/link";
import { UserType_enum, useUserProfile } from "@/providers/Profile";
import { useRouter } from "next/router";
import { Button, LinkButton } from "@/components/General/core/Button";
import { useEffect, useRef, useState } from "react";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import dynamic from "next/dynamic";
import { Search_pages_Routes } from "@/constants/SearchPagesRoutes";
import { property_pages_routes } from "@/constants/property_pages_routes";
import { isScrolledIntoView } from "public/isScrolledIntoView";
import { Routes_With_Different_CustomContainer } from "@/constants/Routes_With_Different_CustomContainer";
const NotificationsPaper = dynamic(() => import("../NotificationsPaper"), {
  ssr: true,
});
const HeaderSearchBox = dynamic(() => import("./HeaderSearchBox"), {
  ssr: true,
});
const MainSearchBox = dynamic(() => import("@/components/General/MainSearchBox"), {
  ssr: true,
});
const NavbarPaper = dynamic(() => import("../NavbarPaper"), {
  ssr: true,
});

function MainHeader({ setIsSideNavbarOpen }: { setIsSideNavbarOpen: (state: boolean) => void }) {
  const profileData = useUserProfile();
  const router = useRouter();

  const [showNotificationsPaper, setShowNotificationsPaper] = useState<boolean>(false);
  const notificationsPaperBtnRef = useRef<any>();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [showNavbarPaper, setShowNavbarPaper] = useState<boolean>(false);
  const navbarPaperOpenerRef = useRef<any>();
  const [showMainSearchBox, setShowMainSearchBox] = useState<boolean>(false);
  const [showSearchBox, setShowSearchBox] = useState<boolean>(false);
  const [headerAfterScroll, setHeaderAfterScroll] = useState<boolean>(false);

  //  ---------------------------------------------------------------------------------------------------
  const curScrollRef = useRef<number>();
  const prevScrollRef = useRef<number>();
  const curDirectionRef = useRef<number>();
  const prevDirectionRef = useRef<number>();

  function changeHeaderBgOrVisibility() {
    const headerEl = document.querySelector("#MainHeader");
    const whereYouWannaGoEl = document.querySelector("#whereYouWannaGoWrapper-SearchPage");
    const whereYouWannaGoElInHomePage = document.querySelector("#whereYouWannaGoWrapper-HomePage");
    // const whereYouWannaGoTextFieldWrapperInHomePage = document.querySelector(
    //   "#whereYouWannaGoTextFieldWrapper-HomePage"
    // );
    // For header's bg change in desktop
    if (window.scrollY >= 40) {
      headerEl?.classList?.remove("md:bg-transparent");
      headerEl?.classList?.add("md:bg-white");
      headerEl?.classList?.add("blur-header");
      // headerEl?.classList?.remove("md:mt-[50px]");
      setHeaderAfterScroll(true);
    } else {
      headerEl?.classList.remove("md:bg-white");
      headerEl?.classList.add("md:bg-transparent");
      headerEl?.classList?.remove("blur-header");
      // headerEl?.classList?.add("md:mt-[50px]");
      setHeaderAfterScroll(false);
    }

    if (window.scrollY >= 230) {
      whereYouWannaGoElInHomePage?.classList.add("!block");
    } else {
      whereYouWannaGoElInHomePage?.classList?.remove("!block");
    }

    // if (window.scrollY >= 80) {
    //   whereYouWannaGoElInHomePage?.classList.add("bg-white");
    //   whereYouWannaGoTextFieldWrapperInHomePage?.classList.add("!w-[100%]");
    // } else {
    //   whereYouWannaGoElInHomePage?.classList?.remove("bg-white");
    //   whereYouWannaGoTextFieldWrapperInHomePage?.classList.remove("!w-[100%]");
    // }

    // if (window.scrollY >= 80 && curDirectionRef.current === 1) {
    //   whereYouWannaGoElInHomePage?.classList.add("!top-[50px]");
    // } else {
    //   whereYouWannaGoElInHomePage?.classList?.remove("!top-[50px]");
    // }

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
        // console.log("entered if");
        headerEl?.classList?.add("!-top-[66px]");
        whereYouWannaGoElInHomePage?.classList.add("!top-0");
        // headerEl?.current?.classList?.add("md:top-0");
        whereYouWannaGoEl?.classList?.remove("top-[66px]");
        whereYouWannaGoEl?.classList?.add("top-0");
      } else if (curDirectionRef.current === 1) {
        // console.log("entered else");
        headerEl?.classList?.remove("!-top-[66px]");
        whereYouWannaGoElInHomePage?.classList.remove("!top-0");
        // headerEl?.current?.classList?.remove("md:top-0");
        whereYouWannaGoEl?.classList?.add("top-[66px]");
        whereYouWannaGoEl?.classList?.remove("top-0");
      }
    }
    prevDirectionRef.current = curDirectionRef.current;
    prevScrollRef.current = curScrollRef.current;
  }

  function removeHomePageEvents() {
    window.removeEventListener("scroll", changeHeaderBgOrVisibility);
  }

  useEffect(() => {
    if (router.pathname === "/") {
      curScrollRef.current = window.scrollY;
      prevScrollRef.current = window.scrollY;
      curDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0
      prevDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0

      router.events.on("routeChangeStart", removeHomePageEvents);
      window.addEventListener("scroll", changeHeaderBgOrVisibility);
    }

    () => {
      router.events.off("routeChangeStart", removeHomePageEvents);
      window.removeEventListener("scroll", changeHeaderBgOrVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, router.events]);

  const handleScroll = () => {
    const headerEl = document.querySelector("#MainHeader");
    const filtersSectionWrapper = document.querySelector("#FiltersSectionWrapper");
    const searchPageContent = document.querySelector("#SearchPageContent");

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
        headerEl?.classList?.add("!-top-[67px]");
        filtersSectionWrapper?.classList.add("!top-0");
        // filtersSectionWrapper?.classList.add("md:top-80");
        searchPageContent?.classList.add("!pt-[246px]");
      } else if (curDirectionRef.current === 1) {
        headerEl?.classList?.remove("!-top-[67px]");
        filtersSectionWrapper?.classList.remove("!top-0");
        searchPageContent?.classList.remove("!pt-[246px]");
      }
    }
    prevDirectionRef.current = curDirectionRef.current;
    prevScrollRef.current = curScrollRef.current;
  };

  function removeSearchPageEvents() {
    window.removeEventListener("scroll", handleScroll);
  }

  useEffect(() => {
    if (Search_pages_Routes.includes(router.pathname)) {
      curScrollRef.current = window.scrollY;
      prevScrollRef.current = window.scrollY;
      curDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0
      prevDirectionRef.current = 0; // scroll up - 1, scroll down - 2, initial - 0

      router.events.on("routeChangeStart", removeSearchPageEvents);
      window.addEventListener("scroll", handleScroll);
    }

    () => {
      router.events.off("routeChangeStart", removeSearchPageEvents);
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname, router.events]);

  //  ---------------------------------------------------------------------------------------------

  // useEffect(() => {
  //   if (showMainSearchBox) {
  //     document.body.classList.add("overflow-hidden");
  //     document.body.style.height = "100vh";
  //   } else {
  //     document.body.classList.remove("overflow-hidden");
  //     document.body.style.height = "";
  //   }

  //   return () => {
  //     document.body.classList.remove("overflow-hidden");
  //     document.body.style.height = "";
  //   };
  // }, [showMainSearchBox]);

  // ----------------------------------------------------------------------------------------------

  function checkForVisibilityOfMainSearchBox() {
    const mainSearchBoxEl = document.querySelector("#MainSearchBox");

    let isInView;
    if (!!mainSearchBoxEl) {
      isInView = isScrolledIntoView(mainSearchBoxEl);
    }

    if (!!isInView) {
      // console.log("IN VIEW");
      setShowSearchBox(false);
    } else {
      setShowSearchBox(true);
    }
  }

  function removeCheckForVisibilityOfMainSearchBox() {
    setShowSearchBox(false);
    window.removeEventListener("scroll", checkForVisibilityOfMainSearchBox);
  }

  useEffect(() => {
    if (router.pathname === "/") {
      router.events.on("routeChangeStart", removeCheckForVisibilityOfMainSearchBox);
      window.addEventListener("scroll", checkForVisibilityOfMainSearchBox);
    }

    return () => {
      router.events.off("routeChangeStart", removeCheckForVisibilityOfMainSearchBox);
      window.removeEventListener("scroll", checkForVisibilityOfMainSearchBox);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  return (
    <OutsideClickHandler handleClick={() => setShowMainSearchBox(false)}>
      <div
        className={`${
          Routes_With_Different_CustomContainer.includes(router.pathname)
            ? "CustomContainer2"
            : "CustomContainer"
        } relative z-[2]`}
      >
        <div
          className={`
          relative
          flex items-center justify-between flex-row-reverse
          py-8 md:py-24
        `}
        >
          <div className="flex items-center md:gap-x-24 gap-x-12 flex-row-reverse">
            <div
              ref={navbarPaperOpenerRef}
              onClick={() => {
                if (isDesktop) {
                  if (
                    profileData.user_type === null ||
                    profileData.user_type === UserType_enum.PUBLIC
                  ) {
                    // "ورود / ثبت نام" btn will handle the onClick
                    return;
                  } else {
                    // user is authenticated and is host or guest
                    setShowNavbarPaper((prev) => !prev);
                  }
                } else {
                  setIsSideNavbarOpen(true);
                }
              }}
              className="relative gap-x-12 cursor-pointer flex items-center row md:flex-row-reverse border-none p-4 md:p-0 rounded-50"
            >
              {(profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC) &&
              !!isDesktop ? (
                <Button
                  rounded
                  onClick={() => {
                    profileData.authModalsUtils.setShowEnterPhoneNumberModal(true);
                  }}
                  color={headerAfterScroll ? "grey" : "white"}
                  variant="contained"
                  className="!py-5 !pl-8"
                  leftIcon={
                    <span className="bg-white rounded-full">
                      <Image
                        loading="eager"
                        src={"/assets/default-profile.svg"}
                        alt="آواتار"
                        className="rounded-full"
                        width={24}
                        height={24}
                      />
                    </span>
                  }
                >
                  ورود / ثبت نام
                </Button>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-full relative">
                    <Image
                      loading="eager"
                      src={
                        !!profileData.has_avatar && profileData.avatar_url
                          ? `${profileData.avatar_url}`
                          : "/assets/default-profile.svg"
                      }
                      alt="آواتار"
                      className="rounded-full"
                      fill
                      sizes="100vw"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div
                    className={`flex items-center ${!isDesktop && "!text-black"} ${
                      headerAfterScroll || router.pathname !== "/" ? "text-black" : "text-white"
                    }`}
                  >
                    <i className="icon-Menu text-32" />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center row md:flex-row-reverse gap-x-24">
              {!profileData.is_host && (
                <div
                  // prefetch={false}
                  // passHref
                  // href={"/residences/submit"}
                  className={`hidden md:flex items-center gap-x-8 cursor-pointer ${
                    headerAfterScroll || router.pathname !== "/" ? "text-black" : "text-white"
                  } hover:text-primary-main`}
                  onClick={() => {
                    // We only have this in desktop
                    if (
                      profileData.user_type === null ||
                      profileData.user_type === UserType_enum.PUBLIC
                    ) {
                      profileData.authModalsUtils.setShowEnterPhoneNumberModal(true);
                    } else {
                      // user is authenticated and is host or guest
                      router.push("/residences/submit");
                    }

                    //  else {
                    //   router.push("/auth/enter_phone?redirectTo=/residences/submit");
                    // }
                  }}
                >
                  <i className="icon-AddHome text-24"></i>
                  <span className="text-16 leading-24 font-r">میزبان شوید</span>
                  {/* <Image src="/assets/non-icomoon-icons/Home2.svg" width={24} height={24} alt="" /> */}
                </div>
              )}

              {profileData.user_type === UserType_enum.AUTH && (
                <ChatBadge isLight={!headerAfterScroll && router.pathname === "/"} />
              )}

              {profileData.user_type === UserType_enum.AUTH && (
                <div className="relative hidden md:flex items-center ">
                  <i
                    className={`text-24 icon-Bell hover:text-primary-main cursor-pointer ${
                      headerAfterScroll || router.pathname !== "/" ? "text-black" : "text-white"
                    }`}
                    ref={notificationsPaperBtnRef}
                    onClick={() => {
                      setShowNotificationsPaper((prev) => !prev);
                    }}
                  />

                  {!!showNotificationsPaper && (
                    <OutsideClickHandler
                      handleClick={() => setShowNotificationsPaper(false)}
                      exceptionElementsRef={[notificationsPaperBtnRef]}
                    >
                      <div className="w-[352px] absolute -bottom-10 left-0 translate-y-full shadow-[0px_8px_32px_rgba(24,39,58,0.15)] p-16 rounded-16 bg-white">
                        <NotificationsPaper setShowNotificationsPaper={setShowNotificationsPaper} />
                      </div>
                    </OutsideClickHandler>
                  )}
                </div>
              )}

              <Link
                prefetch={false}
                href={`tel:02191070021`}
                className={`${!isDesktop && "!text-black"} ${
                  headerAfterScroll || router.pathname !== "/" ? "text-black" : "text-white"
                } border-none cursor-pointer w-40 md:w-auto rounded-full h-40 md:h-auto flex items-center justify-center`}
              >
                <i className="text-28 md:text-24 icon-Phone" />
              </Link>
            </div>
          </div>

          {router.pathname === "/reservations/[id]" && !isDesktop && !!profileData.is_host ? (
            <LinkButton
              color="grey"
              rightIcon={<i className="icon-FlashRight text-24 text-black" />}
              className="!pl-16 !pr-8 !py-4"
              href={"/reservations"}
            >
              رزرو ها
            </LinkButton>
          ) : router.pathname === "/my-trips/[id]" && !isDesktop ? (
            <LinkButton
              color="grey"
              rightIcon={<i className="icon-FlashRight text-24 text-black" />}
              className="!pl-16 !pr-8 !py-4"
              href={"/my-trips"}
            >
              سفرهای من
            </LinkButton>
          ) : (
            <div className="w-136 h-full relative">
              <Link prefetch={false} passHref href={"/"}>
                {!!isDesktop && (!!headerAfterScroll || router.pathname !== "/") ? (
                  <Image
                    src="/assets/logos/Lidoma-logo2.svg"
                    width={99}
                    height={32}
                    alt="لوگو"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                ) : !!isDesktop ? (
                  <Image
                    src="/assets/logos/Lidoma-logo3-white.svg"
                    width={99}
                    height={32}
                    alt="لوگو"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                ) : (
                  <Image
                    src="/assets/logos/Lidoma-logo.svg"
                    width={96}
                    height={28}
                    alt="لوگو"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                    }}
                  />
                )}
              </Link>
            </div>
          )}

          {((!!property_pages_routes.includes(router.pathname) && !!isDesktop) ||
            (!!Search_pages_Routes.includes(router.pathname) && !!isDesktop) ||
            showSearchBox) && (
            <HeaderSearchBox
              showMainSearchBox={showMainSearchBox}
              setShowMainSearchBox={setShowMainSearchBox}
            />
          )}

          {!!showNavbarPaper && (
            <div className="absolute -bottom-8 left-0 translate-y-full z-1">
              <NavbarPaper
                setShowNavbarPaper={setShowNavbarPaper}
                navbarPaperOpenerRef={navbarPaperOpenerRef}
              />
            </div>
          )}
        </div>
      </div>

      <div
        className={`
        relative
        ${
          !!showMainSearchBox ? "h-[94px] opacity-100" : "h-0 opacity-0 overflow-hidden"
        } transition-all duration-300 ease-in-out`}
      >
        <div className="pb-16">
          {!!showMainSearchBox && (
            <MainSearchBox
              containerClassname="!shadow-none border-1 border-solid border-gray-CACFD3"
              fillInputsFromUrl={true}
              setShowMainSearchBox={setShowMainSearchBox}
              noCoOperation={false}
            />
          )}
        </div>
      </div>
    </OutsideClickHandler>
  );
}

export default MainHeader;
