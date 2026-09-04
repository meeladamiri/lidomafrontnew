import { useQuery } from "@tanstack/react-query";
import { INavItem } from "@/interfaces/BottomNavbar";
// import BottomNavbarItem from "./BottomNavbarItem";
import { NavItems_ForHost } from "@/constants/BottomNavbar/NavItems_ForHost";
import { getUnreadCount } from "@/api/chats";
import BottomNavbarItemForAuthenticatedUsers from "./BottomNavbarItemForAuthenticatedUsers";

function RenderHostNavbarItems() {
  // Same query key ChatBadge (header) uses — one cache entry, kept fresh by
  // whichever of the two is mounted, so the mobile nav's badge doesn't open
  // a second polling loop of its own.
  const { data: unread = 0 } = useQuery({
    queryKey: ["chat-unread"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  return (
    <>
      {NavItems_ForHost.map((navItem: INavItem, i: number) => (
        <BottomNavbarItemForAuthenticatedUsers
          key={i}
          href={navItem.href}
          iconSrc={navItem.icon.src}
          name={navItem.name}
          badgeCount={navItem.href === "/chats" ? unread : undefined}
        />
      ))}
    </>
  );
}

export default RenderHostNavbarItems;
