import { logout } from "@/api/Auth/logout";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";
import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { useUserProfile } from "@/providers/Profile";
import { doLogoutActions } from "@/utilities/doLogoutActions";
import exception from "@/utilities/exception";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
// import { removeUserToken } from "utilities/cookies";

const sidePanelItems_ForGuest = {
  firstSection: [
    {
      title: "اطلاعات حساب کاربری",
      desc: "ویرایش اطلاعات کاربری",
      url: "/profile",
      icon: <i className="icon-Profile text-24" />,
    },
    {
      title: "سفرهای من",
      desc: "اطلاعات سفرهای شما",
      url: "/my-trips",
      icon: <i className="icon-Trips text-24" />,
    },
    {
      title: "علاقمندی ها",
      desc: "لیست اقامتگاه های منتخب شما",
      url: "/favourites",
      icon: <i className="icon-LIke text-24" />,
    },
  ],
  secondSection: [
    {
      title: "اعلانات",
      desc: "اعلانات مربوط به درخواست ها",
      url: "/notifications",
      icon: <i className="icon-Bell text-24" />,
    },
    {
      title: "چت",
      desc: "چت شما با میزبانان و پشتیبانی",
      url: "/chats",
      icon: <Image width={24} height={24} src={"/assets/non-icomoon-icons/comment2.svg"} alt="" />,
    },
    {
      title: "کیف پول",
      desc: "اطلاعات مالی و تراکنش ها",
      url: "/wallet",
      icon: <i className="icon-Wallet text-24" />,
    },
  ],
  thirdSection: [
    {
      title: "ثبت اقامتگاه",
      desc: "شروع فرایند میزبان شدن",
      url: "/residences/submit",
      icon: <Image src="/assets/non-icomoon-icons/Home2.svg" width={24} height={24} alt="" />,
    },
  ],
  fourthSection: [
    {
      title: "پشتیبانی",
      desc: "ارتباط با پشتیبانی لیدوما",
      url: "/support",
      icon: <i className="icon-OnlineContact text-24" />,
    },
    // NOTE: hidden for now!
    // {
    //   title: "دعوت از دوستان",
    //   desc: "اشتراک گذاری لیدوما با دوستان تان",
    //   url: "#",
    //   icon: <i className="icon-Gift text-24" />,
    // },
  ],
};

function SidePanelItem({
  icon,
  title,
  description,
  linkTo,
  onClick,
}: {
  icon: JSX.Element;
  title: string | JSX.Element;
  description?: string;
  linkTo?: string;
  onClick?: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className="flex items-center gap-x-12 group cursor-pointer"
      onClick={() => {
        if (!!onClick) {
          onClick();
        }
      }}
    >
      <div
        className={`
            w-40 h-40 flex items-center justify-center
            ${
              !!linkTo && !!router.pathname.includes(linkTo)
                ? "bg-primary-main !text-white"
                : "bg-gray-F4F5F6"
            }
            rounded-8
        `}
      >
        {icon}
      </div>

      <div>
        <p className="text-14 leading-20 font-m text-black fled items-center group-hover:!text-primary-main">
          {title}
        </p>

        {!!description && (
          <p className="text-12 leading-16 font-l text-gray-616E7C mt-12">{description}</p>
        )}
      </div>
    </div>
  );
}

const sidePanelItems_ForHost = {
  firstSection: [
    {
      title: "پیشخوان کاربری",
      desc: "",
      url: "/dashboard",
      icon: <i className="icon-Counter text-24" />,
    },

    {
      title: "اقامتگاه ها",
      desc: "لیست اقامتگاه های شما",
      url: "/residences/list",
      icon: <i className="icon-Home text-24" />,
    },
    {
      title: "تقویم اقامتگاه",
      desc: "قیمت و روزهای باز و بسته",
      url: "/residences/calendar",
      icon: <i className="icon-Calendar text-24" />,
    },
    {
      title: "رزرو ها",
      desc: "لیست رزرو های اقامتگاه های شما",
      url: "/reservations",
      icon: <i className="icon-Reserve text-24" />,
    },
  ],
  secondSection: [
    {
      title: "اعلانات",
      desc: "اعلانات مربوط به درخواست ها",
      url: "/notifications",
      icon: <i className="icon-Bell text-24" />,
    },
    {
      title: "نظرات",
      desc: "لیست نظرات",
      url: "/comments",
      icon: <i className="icon-Comments text-24" />,
    },
    {
      title: "چت",
      desc: "چت شما با میزبانان و پشتیبانی",
      url: "/chats",
      icon: <Image width={24} height={24} src={"/assets/non-icomoon-icons/comment2.svg"} alt="" />,
    },
    {
      title: "کیف پول",
      desc: "اطلاعات مالی و تراکنش ها",
      url: "/wallet",
      icon: <i className="icon-Wallet text-24" />,
    },
    {
      title: "آمار",
      desc: "آمار اقامتگاه ها",
      url: "/statistics/residences",
      icon: <i className="icon-Amaar text-24" />,
    },
  ],
  thirdSection: [
    {
      title: "علاقمندی ها",
      desc: "لیست اقامتگاه های منتخب شما",
      url: "/favourites",
      icon: <i className="icon-LIke text-24" />,
    },
    {
      title: "ثبت اقامتگاه",
      desc: "شروع فرایند میزبان شدن",
      url: "/residences/submit",
      icon: <Image src="/assets/non-icomoon-icons/Home2.svg" width={24} height={24} alt="" />,
    },
    {
      title: "سفرهای من",
      desc: "اطلاعات سفرهای شما",
      url: "/my-trips",
      icon: <i className="icon-Trips text-24" />,
    },
  ],
  fourthSection: [
    {
      title: "پشتیبانی",
      desc: "ارتباط با پشتیبانی لیدوما",
      url: "/support",
      icon: <i className="icon-OnlineContact text-24" />,
    },
    // NOTE: hidden for now!
    // {
    //   title: "دعوت از دوستان",
    //   desc: "اشتراک گذاری لیدوما با دوستان تان",
    //   url: "#",
    //   icon: <i className="icon-Gift text-24" />,
    // },
  ],
};

function SidePanel() {
  const profileData = useUserProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation(
    () => {
      return logout();
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          exception.message([
            {
              type: EXCEPTIONTYPES.SUCCESS,
              title: "شما با موفقیت از سیستم خارج شدید.",
            },
          ]);

          doLogoutActions(router, queryClient);
        } else {
          exception.message([
            {
              type: EXCEPTIONTYPES.ERROR,
              title: data?.err_msg || "مشکلی در خروج از سیستم رخ داد.",
            },
          ]);
        }
      },
    }
  );

  return (
    <aside className="sticky top-[100px] w-full p-24 border-1 border-solid border-gray-CACFD3 rounded-16 shadow-[0px_4px_24px_rgba(24,39,58,0.08)]">
      {profileData.profileQueryUtils.profileDataIsLoading ? (
        <TinyLoader />
      ) : profileData.is_host ? (
        <>
          <div className="pb-10 mb-10 border-b-1 border-solid border-b-gray-CACFD3 flex flex-col items-center">
            <div className="w-64 h-64 mb-8 relative">
              <Image
                src={
                  !!profileData.has_avatar && profileData.avatar_url
                    ? `${profileData.avatar_url}`
                    : "/assets/default-profile.svg"
                }
                alt="آواتار"
                className="rounded-full"
                fill
                style={{
                  objectFit: "cover",
                }}
              />
            </div>

            <div className="flex items-center gap-x-8">
              <Link prefetch={false} passHref href={"/profile"} className="flex items-center">
                <i className="icon-Edit text-24" />
              </Link>
              <p className="text-16 leading-24 font-m text-black">{profileData.name}</p>
            </div>
          </div>
          <div className="pb-10 mb-10 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForHost.firstSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-14 last:mb-0 block"
              >
                <SidePanelItem
                  // description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="pb-10 mb-10 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForHost.secondSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-14 last:mb-0 block"
              >
                <SidePanelItem
                  // description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="pb-10 mb-10 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForHost.thirdSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-14 last:mb-0 block"
              >
                <SidePanelItem
                  // description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="mb-10">
            {sidePanelItems_ForHost.fourthSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-14 last:mb-0 block"
              >
                <SidePanelItem
                  // description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <SidePanelItem
            // description={"خارج شدن از محیط کاربری"}
            icon={<i className="icon-Exit text-24 text-error-light" />}
            title={<span className="text-error-light">خروج از حساب کاربری</span>}
            onClick={() => {
              logoutMutation.mutate();
            }}
          />
        </>
      ) : (
        <>
          <div className="pb-16 mb-16 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForGuest.firstSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-16 last:mb-0 block"
              >
                <SidePanelItem
                  description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="pb-16 mb-16 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForGuest.secondSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-16 last:mb-0 block"
              >
                <SidePanelItem
                  description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="pb-16 mb-16 border-b-1 border-solid border-b-gray-CACFD3">
            {sidePanelItems_ForGuest.thirdSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-16 last:mb-0 block"
              >
                <SidePanelItem
                  description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <div className="mb-16">
            {sidePanelItems_ForGuest.fourthSection.map((item, i) => (
              <Link
                prefetch={false}
                passHref
                href={item.url}
                key={i}
                className="mb-16 last:mb-0 block"
              >
                <SidePanelItem
                  description={item.desc}
                  icon={item.icon}
                  title={item.title}
                  linkTo={item.url}
                />
              </Link>
            ))}
          </div>

          <SidePanelItem
            description={"خارج شدن از محیط کاربری"}
            icon={<i className="icon-Exit text-24 text-error-light" />}
            title={<span className="text-error-light">خروج از حساب کاربری</span>}
            onClick={() => {
              logoutMutation.mutate();
            }}
          />
        </>
      )}
    </aside>
  );
}

export default SidePanel;
