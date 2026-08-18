import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { LinkButton } from "components/General/core/Button";
import { useUserProfile } from "providers/Profile";

function CancelReserveAfterBeingFinalizedBottomSheet({
  handleSmoothClose,
  hostIsCancelling,
}: {
  handleSmoothClose: THandleSmoothClose;
  hostIsCancelling: boolean;
}) {
  const profile = useUserProfile();

  return (
    <div>
      <div className="text-14 leading-24 text-black font-r mb-16">
        جهت لغو رزرو قطعی شده با پشتیبانی لیدوماتریپ تماس بگیرید .
      </div>

      {!!hostIsCancelling && (
        <div className="flex gap-x-4 items-start mb-16">
          <div className="flex items-center gap-x-6 shrink-0">
            <i className="icon-Warning text-18 text-error-light" />
            <p className="text-12 leading-21 text-error-light font-r">توجه : </p>
          </div>

          <p className="text-12 leading-21 text-black font-l">
            لغو رزرو قطعی شده ، افت شدید رتبه اقامتگاه های شما را در پی خواهد داشت
          </p>
        </div>
      )}

      <LinkButton
        href={`tel:02191070021`}
        className=""
        isFullWidth
        rounded
        variant="outlined"
        color="black"
      >
        تماس با پشتیبانی
      </LinkButton>
    </div>
  );
}
export default CancelReserveAfterBeingFinalizedBottomSheet;
