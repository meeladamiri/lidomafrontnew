import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { LinkButton } from "components/General/core/Button";

function ProfileUpdateBottomSheet({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
}) {
  return (
    <div>
      <p className="text-14 font-r text-black leading-30 mb-24 text-justify">
        {"لطفا نسبت به بروزرسانی تصویر پروفایل کاربری خود اقدام نمایید"}
      </p>
      <LinkButton href="/profile" isFullWidth color="secondary" onClick={() => handleSmoothClose()}>
        بروزرسانی پروفایل
      </LinkButton>
    </div>
  );
}

export default ProfileUpdateBottomSheet;
