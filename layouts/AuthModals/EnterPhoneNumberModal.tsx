import EnterPhoneNumber from "@/components/Auth/EnterPhoneNumber";
import ModalWrapper from "components/General/core/ModalWrapper";
import { Dispatch, SetStateAction } from "react";

type TEnterPhoneNumberModal = {
  setShowEnterPhoneNumberModal: Dispatch<SetStateAction<boolean>>;
  showEnterPhoneNumberModal: boolean;
};

function EnterPhoneNumberModal({
  setShowEnterPhoneNumberModal,
  showEnterPhoneNumberModal,
}: TEnterPhoneNumberModal) {
  return (
    <ModalWrapper
      // headerTitle="شماره تلفن"
      modalHasHeader={false}
      onClose={() => {
        setShowEnterPhoneNumberModal(false);
      }}
      open={showEnterPhoneNumberModal}
      modalClassname="md:!w-[400px]"
      canExitOnOutsideClick={false}
    >
      <EnterPhoneNumber showAsModal />
    </ModalWrapper>
  );
}
export default EnterPhoneNumberModal;
