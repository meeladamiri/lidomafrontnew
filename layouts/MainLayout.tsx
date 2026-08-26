import Head from "next/head";
// import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import NoAntenna from "./NoAntenna";
import { useUserProfile } from "@/providers/Profile";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { Routes_Without_Header_InBoth_DesktopAndMobile } from "@/constants/Routes_Without_Header_InBoth_DesktopAndMobile";
import { Routes_Without_Header_InMobile } from "@/constants/Routes_Without_Header_InMobile";
import { Routes_With_SidePanel_InDesktop } from "@/constants/Routes_With_SidePanel_InDesktop";
import { Pages_Not_Having_BottomNav_InMobile } from "@/constants/Pages_Not_Having_BottomNav_InMobile";
import Loader from "@/components/General/Loader";
import { getFontsLinks } from "@/utilities/getFontsLinks";
import { Search_pages_Routes } from "@/constants/SearchPagesRoutes";
// import headBanner from "public/assets/home/head-banner.webp";

const MainHeader = dynamic(() => import("@/layouts/Header/index"), {
  ssr: true,
});
const BottomNavbar = dynamic(() => import("@/layouts/BottomNavbar"), {
  ssr: true,
});
const SideNavbar = dynamic(() => import("layouts/SideNavbar/index"), {
  ssr: true,
});
const SidePanel = dynamic(() => import("./SidePanel"), {
  ssr: true,
});
const SignUpModal = dynamic(() => import("./AuthModals/SignUpModal"), {
  ssr: true,
});
const ForgetPasswordModal = dynamic(() => import("./AuthModals/ForgetPasswordModal"), {
  ssr: true,
});
const OTPModal = dynamic(() => import("./AuthModals/OTPModal"), {
  ssr: true,
});
const EnterPasswordModal = dynamic(() => import("./AuthModals/EnterPasswordModal"), {
  ssr: true,
});
const EnterPhoneNumberModal = dynamic(() => import("./AuthModals/EnterPhoneNumberModal"), {
  ssr: true,
});

const MainLayout = ({ Component, pageProps }: any) => {
  const [isOnline, setIsOnline] = useState(true);
  const profileData = useUserProfile();
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const router = useRouter();
  const [isSideNavbarOpen, setIsSideNavbarOpen] = useState<boolean>(false);

  // ------------------------------------------------ initial online check ---------------------------------------------
  useEffect(() => {
    setIsOnline(window?.navigator?.onLine);
  }, []);
  // ------------------------------------------------ check online end ---------------------------------------------

  return (
    <>
      <Loader />

      <Head>
        {/* No maximum-scale: pinning it to 1 blocks pinch-zoom, which is an
            accessibility failure for anyone who needs to magnify the page.
            height=device-height is dropped too — it does nothing on modern
            browsers and confuses iOS Safari when the URL bar collapses. */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="shortcut icon" href="/favicon.ico" />
        <meta property="og:locale" content="fa_IR" />

        {/* NOTE: The first item in metaTagsList (index zero) is always for the title tag */}
        {/* NOTE: The second item in metaTagsList (index one) is always for the canonical tag */}

        {!!pageProps.metaTagsList && <title>{pageProps.metaTagsList[0]}</title>}
        {!!pageProps.metaTagsList && <link {...pageProps.metaTagsList[1]} />}

        {/* The site is Persian-only, so hreflang has one entry plus the
            x-default that names it as the fallback for every other locale.
            Both point at the page canonical.

            An array, not a fragment: next/head walks its children one level
            deep and drops anything wrapped in a <>...</>, which is why these
            two links silently never reached the head the first time. */}
        {!!pageProps.metaTagsList?.[1]?.href && [
          <link
            key="hreflang-fa"
            rel="alternate"
            hrefLang="fa-IR"
            href={pageProps.metaTagsList[1].href}
          />,
          <link
            key="hreflang-default"
            rel="alternate"
            hrefLang="x-default"
            href={pageProps.metaTagsList[1].href}
          />,
        ]}
        {!!pageProps.metaTagsList &&
          pageProps.metaTagsList.map((item: any, index: number) => {
            // Index 0 is the title and index 1 the canonical, both handled
            // above. Anything else carrying a `rel` is a <link> as well — that
            // is how rel="next"/"prev" reach the head.
            if (index === 0 || index === 1) return;
            if (item?.rel) return <link {...item} key={index} />;
            return <meta {...item} key={index} />;
          })}
        {getFontsLinks()}
      </Head>

      {/* whole application ui wrapper */}
      <div className={`min-h-screen relative`}>
        {!isOnline ? (
          <NoAntenna />
        ) : (
          <>
            {/* {router.pathname === "/" && (
              <figure>
                <Image src={headBanner} alt="آواتار" className="w-full cursor-pointer" />
              </figure>
            )} */}
            <header
              id="MainHeader"
              className={`
                  fixed top-0 md:!top-0 right-0 left-0 bg-white !bg-opacity-95 z-[6] transition-all duration-500 ease-in-out md:transition-none 
                  ${
                    router.pathname === "/"
                      ? "!border-b-none md:!border-b-none md:bg-transparent"
                      : "backdrop-blur-xl"
                  }
                  ${
                    Routes_Without_Header_InBoth_DesktopAndMobile.includes(router.pathname)
                      ? "hidden"
                      : Routes_Without_Header_InMobile.includes(router.pathname)
                      ? "hidden md:block"
                      : ""
                  }
                `}
            >
              {Routes_Without_Header_InBoth_DesktopAndMobile.includes(
                router.pathname
              ) ? null : Routes_Without_Header_InMobile.includes(router.pathname) && !!isDesktop ? (
                <MainHeader setIsSideNavbarOpen={setIsSideNavbarOpen} />
              ) : (
                <MainHeader setIsSideNavbarOpen={setIsSideNavbarOpen} />
              )}
            </header>

            {!!isSideNavbarOpen && (
              <SideNavbar
                isSideNavbarOpen={isSideNavbarOpen}
                setIsSideNavbarOpen={setIsSideNavbarOpen}
              />
            )}
            <main
              className={`
                ${
                  Routes_Without_Header_InBoth_DesktopAndMobile.includes(router.pathname)
                    ? "!pt-0"
                    : ""
                }
                  ${
                    Pages_Not_Having_BottomNav_InMobile.includes(router.pathname)
                      ? "pb-0"
                      : "pb-[74px]"
                  }
                  md:pb-0
                  h-full
                  ${
                    Routes_With_SidePanel_InDesktop.includes(router.pathname)
                      ? !!Routes_Without_Header_InMobile.includes(router.pathname)
                        ? "md:pt-[100px] CustomContainer"
                        : "pt-[84px] md:pt-[100px] CustomContainer"
                      : !!Routes_Without_Header_InMobile.includes(router.pathname)
                      ? "md:pt-[75px]"
                      : ""
                  }
                  ${router.pathname === "/support" ? "bg-gray-F8F8F8 md:bg-transparent" : ""}
                  ${Search_pages_Routes.includes(router.pathname) ? "!pb-0" : ""}
                  ${router.pathname === "/factor/[id]" ? "!pb-0" : ""}
                `}
            >
              <div
                className={`
                    grid grid-cols-14 md:gap-x-24
                  `}
              >
                <div
                  className={`
                      relative
                      ${
                        Routes_With_SidePanel_InDesktop.includes(router.pathname)
                          ? "hidden md:block md:col-span-4"
                          : "hidden"
                      }`}
                >
                  {Routes_With_SidePanel_InDesktop.includes(router.pathname) && <SidePanel />}
                </div>
                <div
                  className={
                    Routes_With_SidePanel_InDesktop.includes(router.pathname)
                      ? "col-span-full md:col-span-10"
                      : "col-span-full"
                  }
                >
                  <Component {...pageProps} />
                </div>
              </div>
            </main>

            {!Pages_Not_Having_BottomNav_InMobile.includes(router.pathname) && !isDesktop && (
              <BottomNavbar />
            )}

            {!!profileData.authModalsUtils.showEnterPhoneNumberModal && (
              <EnterPhoneNumberModal
                setShowEnterPhoneNumberModal={
                  profileData.authModalsUtils.setShowEnterPhoneNumberModal
                }
                showEnterPhoneNumberModal={profileData.authModalsUtils.showEnterPhoneNumberModal}
              />
            )}

            {!!profileData.authModalsUtils.showEnterPasswordModal && (
              <EnterPasswordModal
                setShowEnterPasswordModal={profileData.authModalsUtils.setShowEnterPasswordModal}
                showEnterPasswordModal={profileData.authModalsUtils.showEnterPasswordModal}
              />
            )}

            {!!profileData.authModalsUtils.showOTPModal && (
              <OTPModal
                setShowOTPModal={profileData.authModalsUtils.setShowOTPModal}
                showOTPModal={profileData.authModalsUtils.showOTPModal}
              />
            )}

            {!!profileData.authModalsUtils.showForgetPasswordModal && (
              <ForgetPasswordModal
                setShowForgetPasswordModal={profileData.authModalsUtils.setShowForgetPasswordModal}
                showForgetPasswordModal={profileData.authModalsUtils.showForgetPasswordModal}
              />
            )}

            {!!profileData.authModalsUtils.showSignUpModal && (
              <SignUpModal
                setShowSignUpModal={profileData.authModalsUtils.setShowSignUpModal}
                showSignUpModal={profileData.authModalsUtils.showSignUpModal}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default MainLayout;
