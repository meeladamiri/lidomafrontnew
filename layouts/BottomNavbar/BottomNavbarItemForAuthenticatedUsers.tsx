import Link from "next/link";
import { useRouter } from "next/router";

function BottomNavbarItemForAuthenticatedUsers({
  href,
  iconSrc,
  name,
  customClassname,
  badgeCount,
}: {
  href: string;
  iconSrc: JSX.Element;
  name: string;
  customClassname?: string;
  /** A small unread-style count over the icon — e.g. چت's unread messages. */
  badgeCount?: number;
}) {
  const router = useRouter();

  return (
    <Link
      prefetch={false}
      passHref
      href={href}
      className={`flex flex-col items-center w-[58px]
          ${
            router.pathname === href
              ? "text-primary-main after:content-[''] after:w-full after:block after:h-3 after:bg-primary-main after:rounded-tr-3 after:rounded-tl-3"
              : "text-gray-767676"
          }
          ${customClassname || ""}
          `}
    >
      <div className="relative px-8 flex items-center justify-center">
        {iconSrc}
        {!!badgeCount && (
          <span className="absolute -top-2 -left-2 flex h-16 min-w-[16px] items-center justify-center rounded-full bg-primary-main px-4 text-10 leading-14 font-b text-black">
            {badgeCount > 99 ? "۹۹+" : badgeCount.toLocaleString("fa-IR")}
          </span>
        )}
      </div>
      <p className="text-10 sm:text-12 leading-21 mb-4 px-4">{name}</p>
    </Link>
  );
}

export default BottomNavbarItemForAuthenticatedUsers;
