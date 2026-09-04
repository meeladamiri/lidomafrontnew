export interface ISideNavbarItem {
  icon: {
    src: JSX.Element;
    size: number;
  };
  name: string;
  linkTo: string;
}

export const sideNavbarItems_ForHostAccount: {
  [key: string]: ISideNavbarItem[];
} = {
  firstSection: [
    {
      icon: {
        src: <i className="icon-Counter text-24" />,
        size: 17,
      },
      name: "پیشخوان",
      linkTo: "/dashboard",
    },
    {
      icon: {
        src: <i className="icon-Home text-24" />,
        size: 16,
      },
      name: "اقامتگاه ها",
      linkTo: "/residences/list",
    },
    {
      icon: {
        src: <i className="icon-Calendar text-24" />,
        size: 18,
      },
      name: "تقویم اقامتگاه",
      linkTo: "/residences/calendar",
    },
    {
      icon: {
        src: <i className="icon-Reserve text-24" />,
        size: 18,
      },
      name: "رزرو ها",
      linkTo: "/reservations",
    },
    {
      icon: {
        src: <i className="icon-Comments text-24" />,
        size: 16,
      },
      name: "نظرات",
      linkTo: "/comments",
    },
    {
      icon: {
        src: <i className="icon-message text-24" />,
        size: 16,
      },
      name: "چت",
      linkTo: "/chats",
    },
    {
      icon: {
        src: <i className="icon-Bell text-24" />,
        size: 18,
      },
      name: "اعلانات",
      linkTo: "/notifications",
    },
    {
      icon: {
        src: <i className="icon-Wallet text-24" />,
        size: 18,
      },
      name: "کیف پول",
      linkTo: "/wallet",
    },
    {
      icon: {
        src: <i className="icon-Amaar text-24" />,
        size: 20,
      },
      name: "آمار",
      linkTo: "/statistics/residences",
    },
  ],
  secondSection: [
    {
      icon: {
        src: <i className="icon-LIke text-24" />,
        size: 16,
      },
      name: "علاقمندی ها",
      linkTo: "/favourites",
    },
    {
      icon: {
        src: <i className="icon-AddHome text-24" />,
        size: 16,
      },
      name: "ثبت اقامتگاه",
      linkTo: "/residences/submit",
    },
    {
      icon: {
        src: <i className="icon-Trips text-24" />,
        size: 17,
      },
      name: "سفرهای من",
      linkTo: "/my-trips",
    },
    {
      icon: {
        src: <i className="icon-OnlineContact text-24" />,
        size: 18,
      },
      name: "پشتیبانی",
      linkTo: "/support",
    },
  ],
};

export const sideNavbarItems_ForGuestAccount: {
  [key: string]: ISideNavbarItem[];
} = {
  firstSection: [
    {
      icon: {
        src: <i className="icon-Trips text-24" />,
        size: 17,
      },
      name: "سفرهای من",
      linkTo: "/my-trips",
    },
    {
      icon: {
        src: <i className="icon-message text-24" />,
        size: 16,
      },
      name: "چت",
      linkTo: "/chats",
    },
    {
      icon: {
        src: <i className="icon-Wallet text-24" />,
        size: 18,
      },
      name: "کیف پول",
      linkTo: "/wallet",
    },
    {
      icon: {
        src: <i className="icon-Bell text-24" />,
        size: 16,
      },
      name: "اعلانات",
      linkTo: "/notifications",
    },
    {
      icon: {
        src: <i className="icon-LIke text-24" />,
        size: 16,
      },
      name: "علاقمندی ها",
      linkTo: "/favourites",
    },
    {
      icon: {
        src: <i className="icon-AddHome text-24" />,
        size: 18,
      },
      name: "ثبت اقامتگاه",
      linkTo: "/residences/submit",
    },
    {
      icon: {
        src: <i className="icon-OnlineContact text-24" />,
        size: 18,
      },
      name: "پشتیبانی",
      linkTo: "/support",
    },
    // Note: Not avaialable for now
    // {
    //   icon: {
    //     src: <i className="icon-Amaar text-24" />,
    //     size: 20,
    //   },
    //   name: "دعوت از دوستان",
    //   linkTo: "/statistics",
    //
    // },
  ],
};
