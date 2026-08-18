import { UserType_enum, useUserProfile } from "providers/Profile";
import SidebarWrapper from "../../components/General/Sidebar/SidebarWrapper";
import dynamic from "next/dynamic";
const NonAuthenticatedUserSideNavbarContent = dynamic(
  () => import("./NonAuthenticatedUserSideNavbarContent"),
  {
    ssr: true,
  }
);
const AuthenticatedUserSideNavbarContent = dynamic(
  () => import("./AuthenticatedUserSideNavbarContent"),
  {
    ssr: true,
  }
);

function SideNavbar({
  isSideNavbarOpen,
  setIsSideNavbarOpen,
}: {
  isSideNavbarOpen: boolean;
  setIsSideNavbarOpen: (state: boolean) => void;
}) {
  const profileData = useUserProfile();

  return (
    <SidebarWrapper
      isSidebarOpen={isSideNavbarOpen}
      setIsSidebarOpen={setIsSideNavbarOpen}
      content={({ handleSidebarClose: handleSideNavbarClose }) => (
        <div className="h-full">
          {profileData.user_type === null || profileData.user_type === UserType_enum.PUBLIC ? (
            // user is not yet authenticated
            <NonAuthenticatedUserSideNavbarContent handleSideNavbarClose={handleSideNavbarClose} />
          ) : (
            // user is authenticated and is host or guest
            <AuthenticatedUserSideNavbarContent handleSideNavbarClose={handleSideNavbarClose} />
          )}
        </div>
      )}
    />
  );
}

export default SideNavbar;
