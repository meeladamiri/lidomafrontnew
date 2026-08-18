import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";

function NewReserveRequestBottomSheet({
  handleSmoothClose,
  residenceName,
  guestName,
  stayTime,
  mainGuestsN,
  extraGuestsN,
  price,
  date,
}: {
  handleSmoothClose: THandleSmoothClose;
  residenceName: string;
  guestName: string;
  stayTime: number;
  mainGuestsN: number;
  extraGuestsN: number;
  price: number;
  date: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-x-8 mb-16">
        <i className="icon-Home text-24 text-black" />
        <p className="text-14 font-m text-black">{residenceName}</p>
      </div>

      <div className="flex items-center gap-x-8 mb-16">
        <i className="icon-Profile text-24 text-black" />
        <div className="flex items-center gap-x-4">
          <p className="text-[rgba(28,46,69,0.6)] text-12">نام مهمان : </p>
          <p className="text-black">{guestName}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-x-12 mb-16">
        <div className="border-l-1 border-solid border-l-[rgba(28,46,69,0.6)] col-span-3 pl-4">
          <p className="mb-12 text-10 sm:text-12 text-[rgba(28,46,69,0.6)]">مدت اقامت</p>
          <p className="text-12 sm:text-14 font-m text-black">{stayTime} شب</p>
        </div>

        <div className="border-l-1 border-solid border-l-[rgba(28,46,69,0.6)] col-span-4 pl-4">
          <p className="mb-12 text-10 sm:text-12 text-[rgba(28,46,69,0.6)]">تعداد مهمان</p>
          <div className="flex items-center flex-nowrap gap-x-4">
            <p className="text-10 sm:text-14 font-m text-black">{mainGuestsN} نفر</p>
            <p className="text-8 sm:text-10 font-l text-black">+ {extraGuestsN} نفر اضافه</p>
          </div>
        </div>

        <div className="col-span-5 pl-4">
          <p className="mb-12 text-10 sm:text-12 text-[rgba(28,46,69,0.6)]">مبلغ رزرو</p>
          <p className="text-12 sm:text-14 font-m text-black">{price.toLocaleString()} تومان</p>
        </div>
      </div>

      <div className="flex items-center gap-x-8 mb-16">
        <i className="icon-Calendar text-24 text-black" />

        <div className="flex items-center gap-x-4">
          <p className="text-[rgba(28,46,69,0.6)] text-12">تاریخ اقامت : </p>
          <p className="text-black text-12">{date}</p>
        </div>
      </div>

      {/* TODO: Tuye figma 2 halat hast. tu yekish in button ro nadarim */}
      <Button isFullWidth>پاسخ به درخواست</Button>
    </div>
  );
}

export default NewReserveRequestBottomSheet;
