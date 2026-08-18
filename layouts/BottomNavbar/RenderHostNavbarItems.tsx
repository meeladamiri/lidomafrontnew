import { INavItem } from "@/interfaces/BottomNavbar";
// import BottomNavbarItem from "./BottomNavbarItem";
import { NavItems_ForHost } from "@/constants/BottomNavbar/NavItems_ForHost";
import BottomNavbarItemForAuthenticatedUsers from "./BottomNavbarItemForAuthenticatedUsers";

function RenderHostNavbarItems() {
  return (
    <>
      {NavItems_ForHost.map((navItem: INavItem, i: number) => (
        <BottomNavbarItemForAuthenticatedUsers
          key={i}
          href={navItem.href}
          iconSrc={navItem.icon.src}
          name={navItem.name}
        />
      ))}
    </>
  );
}

export default RenderHostNavbarItems;
