import { INavItem } from "@/interfaces/BottomNavbar";
import Image from "next/image";
import submitResidence from "../../public/assets/non-icomoon-icons/submit-residence.svg";
import favorites from "../../public/assets/non-icomoon-icons/favorites.svg";
import profile from "../../public/assets/non-icomoon-icons/profile.svg";

export const NavItems_ForNonAuthenticatedUser: INavItem[] = [
  {
    name: "ثبت اقامتگاه",
    icon: {
      src: <i className="icon-AddHome text-24" />,
    },
    href: "/auth/enter_phone?redirectTo=/residences/submit",
    bottomSheetDescription: "جهت ثبت اقامتگاه خود و شروع فرایند میزبانیوارد شوید یا ثبت نام کنید",
    bottomSheetIcon: <Image alt={submitResidence} src={submitResidence} />,
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
    href: "/auth/enter_phone?redirectTo=/favourites",
    bottomSheetDescription: "جهت مشاهده لیست علاقمندی های خودوارد شوید یا ثبت نام کنید",
    bottomSheetIcon: <Image alt={favorites} src={favorites} />,
  },
  {
    name: "ورود/ثبت نام",
    icon: {
      src: <i className="icon-Profile text-24" />,
    },
    href: "/auth/enter_phone",
    bottomSheetDescription:
      "برای دسترسی کامل به امکانات، جستجو و رزرو اقامتگاه ها، وارد شوید یا ثبت نام کنید",
    bottomSheetIcon: <Image alt={profile} src={profile} />,
  },
];
