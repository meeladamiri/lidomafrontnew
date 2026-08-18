import { NavItems_ForNonAuthenticatedUser } from "@/constants/BottomNavbar/NavItems_ForNonAuthenticatedUser";
import { INavItem } from "@/interfaces/BottomNavbar";
import BottomNavbarItem from "./BottomNavbarItem";

function RenderNonAuthenticatedUserNavbarItems() {
  return (
    <>
      {NavItems_ForNonAuthenticatedUser.map((navItem: INavItem, i: number) => (
        <BottomNavbarItem
          key={i}
          href={navItem.href}
          iconSrc={navItem.icon.src}
          name={navItem.name}
          bottomSheetDescription={navItem.bottomSheetDescription!}
          bottomSheetIcon={navItem.bottomSheetIcon!}
        />
      ))}
    </>
  );
} 

export default RenderNonAuthenticatedUserNavbarItems;
