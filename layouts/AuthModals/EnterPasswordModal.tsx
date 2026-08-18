import EnterPassword from "@/components/Auth/EnterPassword";
import EnterPhoneNumber from "@/components/Auth/EnterPhoneNumber";
import { Button } from "components/General/core/Button";
import ModalWrapper from "components/General/core/ModalWrapper";
import { TextField } from "components/General/core/TextField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

type TEnterPasswordModal = {
  setShowEnterPasswordModal: Dispatch<SetStateAction<boolean>>;
  showEnterPasswordModal: boolean;
};

function EnterPasswordModal({
  setShowEnterPasswordModal,
  showEnterPasswordModal,
}: TEnterPasswordModal) {
  return (
    <ModalWrapper
      // headerTitle="رمز عبور"
      modalHasHeader={false}
      onClose={() => {
        setShowEnterPasswordModal(false);
      }}
      open={showEnterPasswordModal}
      modalClassname="md:!w-[400px] md:h-[600px]"
      canExitOnOutsideClick={false}
    >
      <EnterPassword showAsModal />
    </ModalWrapper>
  );
}
export default EnterPasswordModal;
