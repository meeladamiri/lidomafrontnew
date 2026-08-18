import { Button } from "@/components/General/core/Button";
import { THandleSmoothClose } from "components/General/core/BottomSheet";

function ChangeAlertBottomSheet({
  handleSmoothClose,
  onYes,
  onNo,
}: {
  handleSmoothClose: THandleSmoothClose;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div>
      <p className="mb-28 text-16 leading-32 text-black font-r">
        تغییرات مربوط به این قسمت ذخیره شود ؟
      </p>

      <div className="grid grid-cols-3 gap-x-12">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={onNo} type="button">
            خیر
          </Button>
        </div>
        <div className="col-span-2">
          <Button isFullWidth type="submit" onClick={onYes}>
            بله، ذخیره کن
          </Button>
        </div>
      </div>
    </div>
  );
}
export default ChangeAlertBottomSheet;
