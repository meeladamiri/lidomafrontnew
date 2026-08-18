import Image from "next/image";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { useUserProfile } from "@/providers/Profile";
import { useRouter } from "next/router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { LinkButton } from "@/components/General/core/Button";
import dynamic from "next/dynamic";
import { logout } from "@/api/Auth/logout";
import { doLogoutActions } from "@/utilities/doLogoutActions";
const HostSideNavbarContent = dynamic(() => import("./HostSideNavbarContent"), {
  ssr: true,
});
const GuestSideNavbarContent = dynamic(() => import("./GuestSideNavbarContent"), {
  ssr: true,
});

function AuthenticatedUserSideNavbarContent({
  handleSideNavbarClose,
}: {
  handleSideNavbarClose: THandleSidebarClose;
}) {
  const profileData = useUserProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(
    () => {
      return logout();
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([
            {
              type: EXCEPTIONTYPES.SUCCESS,
              title: "شما با موفقیت از سیستم خارج شدید.",
            },
          ]);

          doLogoutActions(router, queryClient);
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || "مشکلی در خروج از سیستم رخ داد.",
            },
          ]);
        }
      },
    }
  );

  function handleExit() {
    logoutMutation.mutate();
    handleSideNavbarClose();
  }

  return (
    <>
      {/* header */}
      <div className="flex items-center gap-x-12 pb-16 border-b-1 border-solid border-gray-C4CAD3 mb-16">
        <div className="w-56 h-56 relative shrink-0">
          <Image
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
        <div className="grow">
          <p className="mb-10 break-all">{profileData.name}</p>
          <LinkButton
            href="/profile"
            variant="contained"
            color="grey"
            rounded
            className="!font-l !text-12 !leading-21 !px-12 !py-2"
            onClick={() => handleSideNavbarClose()}
          >
            ویرایش حساب کاربری
          </LinkButton>
        </div>
      </div>

      <div className="h-[calc(100%-92px)] max-h-[calc(100%-92px)] overflow-y-auto">
        {!!profileData.is_host ? (
          <HostSideNavbarContent
            handleSideNavbarClose={handleSideNavbarClose}
            onExitBtnClick={handleExit}
          />
        ) : (
          <GuestSideNavbarContent
            handleSideNavbarClose={handleSideNavbarClose}
            onExitBtnClick={handleExit}
          />
        )}
      </div>
    </>
  );
}

export default AuthenticatedUserSideNavbarContent;
