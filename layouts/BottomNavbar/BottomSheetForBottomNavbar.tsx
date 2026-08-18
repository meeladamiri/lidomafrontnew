import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { LinkButton } from "@/components/General/core/Button";

function BottomSheetForBottomNavbar({
  href,
  icon,
  content,
  handleSmoothClose,
}: {
  href: string;
  icon?: JSX.Element;
  content?: string;
  handleSmoothClose: THandleSmoothClose;
}) {
  return (
    <div className="flex flex-col justify-center items-center">
      {icon}
      <p className="text-17 leading-28 text-black font-r mt-20 mb-24 text-center">{content}</p>
      <LinkButton color="dark-blue" className="mb-16 !py-10 !px-[27px]" href={href}>
        ورود یا ثبت نام
      </LinkButton>
    </div>
  );
}

export default BottomSheetForBottomNavbar;
