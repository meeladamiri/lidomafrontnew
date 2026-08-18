import { THandleSmoothClose } from "components/General/core/BottomSheet";

function TasfieWalletBottomSheet({
  handleSmoothClose,
  isSuccess,
  rejectReason,
}: {
  handleSmoothClose: THandleSmoothClose;
  isSuccess: boolean;
  rejectReason?: string;
}) {
  return (
    <div className="text-14 leading-30 font-r">
      {!!isSuccess ? (
        <p className="text-success">درخواست شما جهت تسویه حساب کیف پول با موفقیت انجام شد</p>
      ) : (
        <p className="text-error-light">
          درخواست شما جهت تسویه حساب کیف پول به دلیل {rejectReason} رد شد
        </p>
      )}
    </div>
  );
}

export default TasfieWalletBottomSheet;
