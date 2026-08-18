import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import Image from "next/image";

function NewCommentBottomSheet({
  handleSmoothClose,
  residenceName,
  guestName,
  date,
}: {
  handleSmoothClose: THandleSmoothClose;
  residenceName: string;
  guestName: string;
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

      <div className="flex items-center gap-x-8 mb-24">
        <i className="icon-Calendar text-24 text-black" />

        <div className="flex items-center gap-x-4">
          <p className="text-[rgba(28,46,69,0.6)] text-12">تاریخ اقامت : </p>
          <p className="text-black text-12">{date}</p>
        </div>
      </div>

      <Button
        color="grey"
        rounded
        isFullWidth
        rightIcon={
          <Image
            width={24}
            height={24}
            alt=""
            src={"/assets/non-icomoon-icons/comment2.svg"}
            style={{
              maxWidth: "100%",
              height: "auto"
            }} />
        }
      >
        مشاهده نظر و پاسخ به مهمان
      </Button>
    </div>
  );
}

export default NewCommentBottomSheet;
