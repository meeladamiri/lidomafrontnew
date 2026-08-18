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
  {
    name: "پروفایل",
    icon: {
      src: <i className="icon-Profile text-24" />,
    },
    href: "/profile",
  },
];
