import CloseBtn from "@/components/General/CloseBtn";
import { useUserProfile } from "@/providers/Profile";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";
interface IAuthLayout {
  children: React.ReactNode;
  title: string;
  showAsModal?: boolean;
  hasCloseBtnInShowAsModal?: boolean;
}

function AuthLayout({
  children,
  title,
  showAsModal, // 'showAsModal == true' means that we are showing these auth stuff, in desktop as modal.
  // when 'showAsModal == false', it is being displayed in mobile which is not shown as modal but a 'full page route'.
  hasCloseBtnInShowAsModal = true,
}: IAuthLayout) {
  const profileData = useUserProfile();
  const router = useRouter();

  return (
    <div className={`${showAsModal ? "pt-24" : "px-40 pb-20 pt-56"} relative`}>
      {((!showAsModal && router.pathname === "/auth/enter_phone") ||
        (!!hasCloseBtnInShowAsModal && !!showAsModal)) && (
        <div
          className={`
            absolute
            top-24
            ${
              !showAsModal && router.pathname === "/auth/enter_phone"
                ? "left-20"
                : !!hasCloseBtnInShowAsModal && !!showAsModal
                ? "left-0"
                : ""
            }
          `}
        >
          <CloseBtn
            onClose={() => {
              // remove Pending_request_details from localStorage
              localStorage.removeItem("Pending_Reserve_Details");

              if (!!showAsModal) {
                // close the one which is opened
                profileData.authModalsUtils.setShowEnterPhoneNumberModal(false);
                profileData.authModalsUtils.setShowEnterPasswordModal(false);
                profileData.authModalsUtils.setShowForgetPasswordModal(false);
                profileData.authModalsUtils.setShowOTPModal(false);
                profileData.authModalsUtils.setShowSignUpModal(false);
              } else {
                // it is mobile route
                router.back();
              }
            }}
          />
        </div>
      )}

      {!showAsModal && router.pathname !== "/auth/enter_phone" && (
        <div
          className="flex items-center top-24 right-20 fixed"
          onClick={() => {
            router.back();
          }}
        >
          <i className="icon-Back text-26" />
        </div>
      )}

      <div className="mb-40">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/assets/logos/Logo-green-no-text.svg"
            width={48}
            height={48}
            alt="لوگو لیدوما تریپ"
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
        <p className="text-16 text-center leading-28 font-m text-zilgara">{title}</p>
      </div>

      <div>{children}</div>
    </div>
  );
}
export default AuthLayout;
