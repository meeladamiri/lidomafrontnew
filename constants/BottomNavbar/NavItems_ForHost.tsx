import { INavItem } from "@/interfaces/BottomNavbar";

export const NavItems_ForHost: INavItem[] = [
  {
    name: "اعلانات",
    icon: {
      src: <i className="icon-Bell text-24" />,
    },
    href: "/notifications",
  },
  {
    name: "رزرو ها",
    icon: {
      src: <i className="icon-Reserve text-24" />,
    },
    href: "/reservations",
  },
  {
    name: "پیشخوان",
    icon: {
      src: <i className="icon-Counter text-24" />,
    },
    href: "/dashboard",
  },
  {
    name: "اقامتگاه ها",
    icon: {
      src: <i className="icon-Homes text-24" />,
    },
    href: "/residences/list",
  },
  /**
   * The calendar takes the profile's place.
   *
   * Keeping availability current is the thing a host comes back to do — most
   * days, for most listings — while the profile is edited once and then not
   * again. The profile is still reachable from the side menu, which is where
   * settings belong.
   */
  {
    name: "تقویم",
    icon: {
      src: <i className="icon-Calendar text-24" />,
    },
    href: "/residences/calendar",
  },
];
