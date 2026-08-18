import SignupForm from "@/components/Auth/SignupForm";
import ModalWrapper from "components/General/core/ModalWrapper";
import { Dispatch, SetStateAction, useState } from "react";

type TSignUpModal = {
  setShowSignUpModal: Dispatch<SetStateAction<boolean>>;
  showSignUpModal: boolean;
};

function SignUpModal({ setShowSignUpModal, showSignUpModal }: TSignUpModal) {
  return (
    <ModalWrapper
      // headerTitle="ثبت نام"
      modalHasHeader={false}
      onClose={() => {
        setShowSignUpModal(false);
      }}
      open={showSignUpModal}
      modalClassname="md:!w-[400px]"
      canExitOnOutsideClick={false}
    >
      <SignupForm showAsModal />
    </ModalWrapper>
  );
}
export default SignUpModal;
