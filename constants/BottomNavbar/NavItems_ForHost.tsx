import { INavItem } from "@/interfaces/BottomNavbar";

// Order matters: در RTL اولین آیتم آرایه سمت راست‌ترین آیتم نوار است. ترتیب
// درخواستی: رزروها، چت، تقویم، اعلانات، پیشخوان — پیشخوان چپ‌ترین/آخرین
// جایگاه را می‌گیرد چون همان صفحه‌ی ورود پیش‌فرض میزبان است.
export const NavItems_ForHost: INavItem[] = [
  {
    name: "رزرو ها",
    icon: {
      src: <i className="icon-Reserve text-24" />,
    },
    href: "/reservations",
  },
  /**
   * چت جای «اقامتگاه‌ها» را در نوار پایین گرفت — لیست اقامتگاه‌ها همچنان از
   * «پیشخوان» و منوی کناری در دسترس است، ولی روی موبایل هیچ راهی برای چت
   * وجود نداشت (آیکون هدر فقط در دسکتاپ نمایش داده می‌شود).
   */
  {
    name: "چت",
    icon: {
      src: <i className="icon-message text-24" />,
    },
    href: "/chats",
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
  {
    name: "اعلانات",
    icon: {
      src: <i className="icon-Bell text-24" />,
    },
    href: "/notifications",
  },
  {
    name: "پیشخوان",
    icon: {
      src: <i className="icon-Counter text-24" />,
    },
    href: "/dashboard",
  },
];
