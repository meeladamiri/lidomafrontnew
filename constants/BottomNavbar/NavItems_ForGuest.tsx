import { INavItem } from "@/interfaces/BottomNavbar";

export const NavItems_ForGuest: INavItem[] = [
  {
    name: "اعلانات",
    icon: {
      src: <i className="icon-Bell text-24" />,
    },
    href: "/notifications",
  },
  {
    name: "سفرهای من",
    icon: {
      src: <i className="icon-Trips text-24" />,
    },
    href: "/my-trips",
  },
  {
    name: "صفحه اصلی",
    icon: {
      src: <i className="icon-Home text-24" />,
    },
    href: "/",
  },
  {
    name: "علاقمندی ها",
    icon: {
      src: <i className="icon-LIke text-24" />,
    },
    href: "/favourites",
  },
  {
    name: "پروفایل",
    icon: {
      src: <i className="icon-Profile text-24" />,
    },
    href: "/profile",
  },
];
