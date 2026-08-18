import Link from "next/link";

function SidebarNavItem({
  link,
  icon,
  name,
  badge,
  handleSideNavbarClose,
}: {
  link: string;
  icon: JSX.Element;
  name: string;
  badge: null | number;
  handleSideNavbarClose: () => void;
}) {
  return (
    <Link
      prefetch={false}
      href={link}
      passHref
      className="flex items-center mb-16 group"
      onClick={() => {
        handleSideNavbarClose();
      }}
    >
      <div className="flex items-center">{icon}</div>
      <p className="text-14 leading-24 mr-10 text-black group-hover:!text-primary-main transition-all">
        {name}
      </p>
      {!!badge && (
        <p className="w-20 h-20 mr-8 bg-primary-main rounded-full flex items-center justify-center text-white text-10 leading-18 font-r">
          {badge}
        </p>
      )}
    </Link>
  );
}

export default SidebarNavItem;
