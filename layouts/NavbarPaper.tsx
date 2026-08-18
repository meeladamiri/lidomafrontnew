import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import {
  ISideNavbarItem,
  sideNavbarItems_ForGuestAccount,
  sideNavbarItems_ForHostAccount,
} from "@/constants/SideNavbarItems";
import { useUserProfile } from "@/providers/Profile";
import exception from "@/utilities/exception";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";
import SidebarNavItem from "./SideNavbar/SidebarNavItem";
import { getDashboardData } from "@/api/Dashboard";
import { getBadge } from "@/utilities/getBadge";
import { logout } from "@/api/Auth/logout";
import { doLogoutActions } from "@/utilities/doLogoutActions";

// Note: This component is gonna be called when the user_type == auth;
//       So the user is either guest or host.

function NavbarPaper({
  setShowNavbarPaper,
  navbarPaperOpenerRef,
}: {
  setShowNavbarPaper: Dispatch<SetStateAction<boolean>>;
  navbarPaperOpenerRef: any;
}) {
  const router = useRouter();
  const profileData = useUserProfile();
  const queryClient = useQueryClient();
  const { data } = useQuery(["getDashboardData"], () => getDashboardData());

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

  return (
    <OutsideClickHandler
      handleClick={() => {
        setShowNavbarPaper(false);
      }}
      exceptionElementsRef={[navbarPaperOpenerRef]}
    >
      <div className="w-[214px] border-gray-CACFD3 border-1 border-solid rounded-20 shadow-[0px_8px_32px_rgba(24,39,58,0.15)] bg-white p-24">
        <SidebarNavItem
          link={"/profile"}
          icon={<i className="icon-Profile text-24" />}
          name={"حساب کاربری من"}
          badge={null}
          handleSideNavbarClose={() => setShowNavbarPaper(false)}
        />

        {!!profileData.is_host ? (
          <>
            {sideNavbarItems_ForHostAccount.firstSection.map(
              (sideNavbarItem: ISideNavbarItem, i) => {
                return (
                  <SidebarNavItem
                    key={i}
                    link={sideNavbarItem.linkTo}
                    icon={sideNavbarItem.icon.src}
                    name={sideNavbarItem.name}
                    badge={getBadge(
                      sideNavbarItem.name,
                      data?.params?.pending_messages,
                      data?.params?.pending_notifs,
                      data?.params?.pending_reviews
                    )}
                    handleSideNavbarClose={() => {
                      setShowNavbarPaper(false);
                    }}
                  />
                );
              }
            )}

            {sideNavbarItems_ForHostAccount.secondSection.map(
              (sideNavbarItem: ISideNavbarItem, i) => {
                return (
                  <SidebarNavItem
                    key={i}
                    link={sideNavbarItem.linkTo}
                    icon={sideNavbarItem.icon.src}
                    name={sideNavbarItem.name}
                    badge={getBadge(
                      sideNavbarItem.name,
                      data?.params?.pending_messages,
                      data?.params?.pending_notifs,
                      data?.params?.pending_reviews
                    )}
                    handleSideNavbarClose={() => setShowNavbarPaper(false)}
                  />
                );
              }
            )}
          </>
        ) : (
          sideNavbarItems_ForGuestAccount.firstSection.map((sideNavbarItem: ISideNavbarItem, i) => {
            return (
              <SidebarNavItem
                key={i}
                link={sideNavbarItem.linkTo}
                icon={sideNavbarItem.icon.src}
                name={sideNavbarItem.name}
                badge={getBadge(
                  sideNavbarItem.name,
                  data?.params?.pending_messages,
                  data?.params?.pending_notifs,
                  data?.params?.pending_reviews
                )}
                handleSideNavbarClose={() => setShowNavbarPaper(false)}
              />
            );
          })
        )}

        {/* exit button -- same in both */}
        <div
          className="flex items-center gap-10 mt-20 cursor-pointer"
          onClick={() => {
            logoutMutation.mutate();
            setShowNavbarPaper(false);
          }}
        >
          <div className="flex items-center">
            <i className="icon-Exit text-24 text-error-light" />
          </div>
          <p className="text-14 leading-24 text-error-light">خروج از حساب کاربری</p>
        </div>
      </div>
    </OutsideClickHandler>
  );
}

export default NavbarPaper;
