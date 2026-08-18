import ForgetPassword from "@/components/Auth/ForgetPassword";
import ModalWrapper from "components/General/core/ModalWrapper";
import { Dispatch, SetStateAction } from "react";

type TForgetPasswordModal = {
  setShowForgetPasswordModal: Dispatch<SetStateAction<boolean>>;
  showForgetPasswordModal: boolean;
};

function ForgetPasswordModal({
  setShowForgetPasswordModal,
  showForgetPasswordModal,
}: TForgetPasswordModal) {
  return (
    <ModalWrapper
      headerTitle="فراموشی رمز عبور"
      modalHasHeader={false}
      onClose={() => {
        setShowForgetPasswordModal(false);
      }}
      open={showForgetPasswordModal}
      modalClassname="md:!w-[400px]"
      canExitOnOutsideClick={false}
    >
      <ForgetPassword showAsModal />
    </ModalWrapper>
  );
}
export default ForgetPasswordModal;
