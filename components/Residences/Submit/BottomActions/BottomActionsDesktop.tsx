import { Button } from "@/components/General/core/Button";
import { useRouter } from "next/router";

function BottomActionsDesktop({
  onClickOfSubmitStep,
  isSubmitBtnDisabled,
  isSaving,
}: {
  onClickOfSubmitStep: () => void;
  isSubmitBtnDisabled?: boolean;
  isSaving?: boolean;
}) {
  const router = useRouter();

  function handleStepBackward() {
    if (!router?.query?.step || router?.query?.step === "0") router.back();
    else {
      router.replace(
        `?step=${Number(router?.query?.step as string) - 1}&productId=${router?.query?.productId}`
      );
    }
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        rightIcon={<i className="icon-FlashRight text-20 text-black" />}
        color="grey"
        className="!pr-8 !pl-16 !py-6"
        onClick={handleStepBackward}
        disabled={isSaving}
      >
        مرحله قبل
      </Button>

      <Button
        leftIcon={<i className="icon-FlashLeft text-20 text-white" />}
        className="!pl-8 !pr-16 !py-6"
        onClick={onClickOfSubmitStep}
        disabled={isSubmitBtnDisabled || isSaving}
        isLoading={isSaving}
        loadingText="در حال ذخیره…"
      >
        {router?.query?.step === "14" ? "ذخیره و اتمام" : "ذخیره و ادامه"}
      </Button>
    </div>
  );
}

export default BottomActionsDesktop;
