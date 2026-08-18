import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { LinkButton } from "components/General/core/Button";

function CalendarUpdateBottomSheet({
  handleSmoothClose,
  text,
}: {
  handleSmoothClose: THandleSmoothClose;
  text: string;
}) {
  return (
    <div>
      <p className="text-14 font-r text-black leading-30 mb-24 text-justify">{text}</p>
      <LinkButton
        href="/somewhere"
        isFullWidth
        color="secondary"
        onClick={() => handleSmoothClose()}
      >
        بروزرسانی تقویم اقامتگاه ها
      </LinkButton>
    </div>
  );
}

export default CalendarUpdateBottomSheet;
