import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { useEffect, useState } from "react";
import { Button } from "../General/core/Button";
import { TextField } from "../General/core/TextField";

function ConfirmGuestInfoForReserveBottomSheet({
  handleSmoothClose,
  guestName,
  guestPhoneNumber,
  onFormSubmit,
  onTapOfReturnBtn,
}: {
  handleSmoothClose: THandleSmoothClose;
  guestName: string;
  guestPhoneNumber: string;
  onFormSubmit: (newGuestName: string) => void;
  onTapOfReturnBtn: () => void;
}) {
  const [localGuestName, setLocalGuestName] = useState<string>(guestName);
  const [localGuestPhoneNumber, setLocalGuestPhoneNumber] = useState<string>(guestPhoneNumber);

  useEffect(() => {
    setLocalGuestName(guestName);
    setLocalGuestPhoneNumber(guestPhoneNumber);
  }, [guestName, guestPhoneNumber]);

  return (
    <div>
      <div className="flex items-center gap-x-8 mb-16">
        <i className="icon-BirthCertificate text-24 text-black" />
        <p className="text-14 leading-24 font-r text-black">اطلاعات مهمان</p>
      </div>

      <TextField
        name="guestNameInput"
        customValue={localGuestName}
        customOnChange={(value) => setLocalGuestName(value)}
        placeholder="نام و نام خانوادگی مهمان را وارد کنید."
      />

      <TextField
        name="guestPhoneNumberInput"
        customValue={localGuestPhoneNumber}
        customOnChange={(value) => setLocalGuestPhoneNumber(value)}
        placeholder="شماره همراه مهمان را وارد کنید."
        disabled={true}
        wrapperClassname="mt-12 bg-gray-F4F5F6"
      />

      <div className="mt-16 border-t-1 border-solid border-t-gray-CACFD3 pt-16 text-12 leading-21 font-l text-black text-center">
        نام و نام خانوادگی خود را دقیق و مطابق کارت شناسایی وارد کنید
      </div>

      {/* actions */}
      <div className="mt-28">
        <div className="grid grid-cols-3 gap-x-12">
          <div className="col-span-1">
            <Button isFullWidth color="grey" onClick={() => onTapOfReturnBtn()}>
              برگشت
            </Button>
          </div>
          <div className="col-span-2">
            <Button
              isFullWidth
              type="submit"
              //   disabled={}
              onClick={() => onFormSubmit(localGuestName)}
            >
              ذخیره تغییرات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmGuestInfoForReserveBottomSheet;
