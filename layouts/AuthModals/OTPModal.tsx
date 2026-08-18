import EnterPassword from "@/components/Auth/EnterPassword";
import EnterPhoneNumber from "@/components/Auth/EnterPhoneNumber";
import OTP from "@/components/Auth/OTP";
import { Button } from "components/General/core/Button";
import ModalWrapper from "components/General/core/ModalWrapper";
import { TextField } from "components/General/core/TextField";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

type T_OTPModal = {
  setShowOTPModal: Dispatch<SetStateAction<boolean>>;
  showOTPModal: boolean;
};

function OTPModal({ setShowOTPModal, showOTPModal }: T_OTPModal) {
  return (
    <ModalWrapper
      // headerTitle="رمز عبور یکبار مصرف"
      modalHasHeader={false}
      onClose={() => {
        setShowOTPModal(false);
      }}
      open={showOTPModal}
      modalClassname="md:!w-[400px]"
      canExitOnOutsideClick={false}
    >
      <OTP showAsModal />
    </ModalWrapper>
  );
}
export default OTPModal;
