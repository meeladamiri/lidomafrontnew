import { ISideNavbarItem, sideNavbarItems_ForHostAccount } from "@/constants/SideNavbarItems";
import SidebarNavItem from "./SidebarNavItem";
import { THandleSidebarClose } from "@/components/General/Sidebar/SidebarWrapper";
import { getBadge } from "@/utilities/getBadge";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/api/Dashboard";

function HostSideNavbarContent({
  handleSideNavbarClose,
  onExitBtnClick,
}: {
  handleSideNavbarClose: THandleSidebarClose;
  onExitBtnClick: () => void;
}) {
  const { data } = useQuery(["getDashboardData"], () => getDashboardData());

  return (
    <>
      {/* top items */}
      <div className="border-b-1 border-solid border-gray-C4CAD3">
        {sideNavbarItems_ForHostAccount.firstSection.map((sideNavbarItem: ISideNavbarItem, i) => {
          return (
            <SidebarNavItem
              key={i}
              link={sideNavbarItem.linkTo}
              icon={sideNavbarItem.icon.src}
              name={sideNavbarItem.name}
              badge={getBadge(
                sideNavbarItem.linkTo,
                data?.params?.pending_messages,
                data?.params?.pending_notifs,
                data?.params?.pending_reviews
              )}
              handleSideNavbarClose={handleSideNavbarClose}
            />
          );
        })}
      </div>
      {/* middle items */}
      <div className="border-b-1 border-solid border-gray-C4CAD3 mt-16">
        {sideNavbarItems_ForHostAccount.secondSection.map((sideNavbarItem: ISideNavbarItem, i) => {
          return (
            <SidebarNavItem
              key={i}
              link={sideNavbarItem.linkTo}
              icon={sideNavbarItem.icon.src}
              name={sideNavbarItem.name}
              badge={getBadge(
                sideNavbarItem.linkTo,
                data?.params?.pending_messages,
                data?.params?.pending_notifs,
                data?.params?.pending_reviews
              )}
              handleSideNavbarClose={handleSideNavbarClose}
            />
          );
        })}
      </div>
      {/* exit button */}
      <div className="flex items-center gap-10 mt-20 cursor-pointer" onClick={onExitBtnClick}>
        <div className="flex items-center">
          <i className="icon-Exit text-24 text-error-light" />
        </div>
        <p className="text-14 leading-24 text-error-light">خروج از حساب کاربری</p>
      </div>
    </>
  );
}

export default HostSideNavbarContent;
