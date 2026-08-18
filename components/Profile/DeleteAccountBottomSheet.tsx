import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { LinkButton } from "components/General/core/Button";

function DeleteAccountBottomSheet({
  handleSmoothClose,
  supportPhone,
}: {
  handleSmoothClose: THandleSmoothClose;
  supportPhone: string;
}) {
  return (
    <div>
      <p className="text-14 leading-24 text-black font-r mb-8">
        جهت حذف حساب کاربری، با پشتیبانی لیدوماتریپ تماس بگیرید
      </p>

      <p className="text-12 leading-21 text-error-light font-r mb-16">
        توجه‌: این مرحله قابل بازیابی نمی باشد !
      </p>

      <LinkButton href={`tel:${supportPhone}`} variant="outlined" color="black" rounded isFullWidth>
        تماس با پشتیبانی
      </LinkButton>
    </div>
  );
}

export default DeleteAccountBottomSheet;
