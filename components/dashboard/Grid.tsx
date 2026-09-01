import Link from "next/link";

type Item = { name: string; icon: JSX.Element; linkTo: string; badgeKey?: BadgeKey };

export type BadgeKey =
  | "reservations"
  | "comments"
  | "residences"
  | "notifications"
  | "my_trips"
  | "chats";

export type Badges = Partial<Record<BadgeKey, number>>;

/**
 * A counter is only worth a badge if it goes down when the work is done.
 *
 * "How many listings you own" is decoration and it never changes, so a number
 * beside it teaches people to ignore numbers. "How many bookings are waiting
 * for your answer" is a to-do list. Only the second kind gets one, which is
 * why several tiles here deliberately have no badgeKey.
 */
function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="absolute top-8 left-8 min-w-20 h-20 px-6 rounded-full bg-error-light text-white text-11 leading-20 font-m flex items-center justify-center">
      {count > 99 ? "+۹۹" : count.toLocaleString("fa-IR")}
    </span>
  );
}

/**
 * Every tile here used to be a host tool — reservations to approve, listings,
 * bulk pricing. A guest who has never hosted anything opened their dashboard
 * and got six shortcuts into pages that were empty or refused them.
 *
 * The shared four are what any signed-in person has; the host-only three are
 * added on top. Nobody is shown a door they cannot open.
 */
function Grid({ isHost = true, badges }: { isHost?: boolean; badges?: Badges }) {
  const SHARED: Item[] = [
    {
      name: "سفرهای من",
      icon: <i className="icon-Reserve text-24" />,
      linkTo: "/my-trips",
      badgeKey: "my_trips",
    },
    {
      name: "علاقه‌مندی‌ها",
      icon: <i className="icon-LIke text-24" />,
      linkTo: "/favourites",
    },
    {
      name: "گفتگوها",
      icon: <i className="icon-message text-24" />,
      linkTo: "/chats",
    },
    {
      name: "اعلانات",
      icon: <i className="icon-Bell text-24" />,
      linkTo: "/notifications",
      badgeKey: "notifications",
    },
  ];

  const HOST_ONLY: Item[] = [
    {
      name: "رزرو ها",
      icon: <i className="icon-Homes text-24" />,
      linkTo: "/reservations",
      badgeKey: "reservations",
    },
    {
      name: "اقامتگاه ها",
      icon: <i className="icon-Home text-24" />,
      linkTo: "/residences/list",
      // Listings still being filled in — it shrinks as they are finished.
      badgeKey: "residences",
    },
    {
      name: "نرخ گذاری کلی",
      icon: <i className="icon-Calendar text-24" />,
      linkTo: "/general-pricing",
    },
    {
      name: "نظرات",
      icon: <i className="icon-Comments text-24" />,
      linkTo: "/comments",
      badgeKey: "comments",
    },
  ];

  const ITEMS: Item[] = isHost ? [...HOST_ONLY, ...SHARED] : SHARED;

  // const { isSuccess, isLoading, data } = useQuery(["getResidencesList"], () => getResidencesList());

  // useEffect(() => {
  //   if (!!data) {
  //     if (data?.status === "success") {
  //       console.log("In success of getResidencesList, data is: ", data);
  //       const allReses = data?.params?.residences as IServerResidence[];
  //       const activeReses = allReses.filter(
  //         (res) => res.state === ResidenceStates_enum.ACTIVE && res.res_type !== "boomgardi"
  //       );

  //       const allRooms = data?.params?.rooms as IServerRoom[];

  //       // const
  //       // setElligibleResidencesToEditGeneralPricing([...activeReses, ...allRooms]);
  //       // setRoomsList(data?.params?.rooms);
  //     } else {
  //       exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
  //     }
  //   }
  // }, [data]);

  return (
    <>
      {ITEMS.map((ITEM: Item, i: number) => {
        return (
          <Link
            passHref
            prefetch={false}
            href={ITEM.linkTo}
            key={i}
            className="relative flex flex-col gap-y-16 items-center justify-center typical-gray-bg col-span-4 rounded-8 px-10 pt-28 pb-24 text-black"
            // onClick={() => {
            //   if (ITEM.name === "نرخ گذاری کلی") {

            //   }
            // }}
          >
            {!!ITEM.badgeKey && <Badge count={badges?.[ITEM.badgeKey]} />}
            <div className="flex items-center">{ITEM.icon}</div>
            <p className="text-12 font-m text-center">{ITEM.name}</p>
          </Link>
        );
      })}
    </>
  );
}

export default Grid;
