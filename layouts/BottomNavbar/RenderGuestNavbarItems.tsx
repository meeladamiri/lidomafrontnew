import { INavItem } from "@/interfaces/BottomNavbar";
import { NavItems_ForGuest } from "@/constants/BottomNavbar/NavItems_ForGuest";
import BottomNavbarItemForAuthenticatedUsers from "./BottomNavbarItemForAuthenticatedUsers";

function RenderGuestNavbarItems() {
  return (
    <>
      {NavItems_ForGuest.map((navItem: INavItem, i: number) => (
        <BottomNavbarItemForAuthenticatedUsers
          key={i}
          href={navItem.href}
          iconSrc={navItem.icon.src}
          name={navItem.name}
          customClassname="w-[70px]"
        />
      ))}
    </>
  );
}

export default RenderGuestNavbarItems;
