import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import Image from "next/image";

function ConfirmDeleteImageBottomSheet({
  handleSmoothClose,
  uploadedImageData,
  onDeleteConfirm,
}: {
  handleSmoothClose: THandleSmoothClose;
  uploadedImageData: File | string;
  onDeleteConfirm: () => void;
}) {
  return (
    <div>
      <div className="w-full h-[214px] mb-12 relative">
        <Image
          src={
            typeof uploadedImageData === "string"
              ? uploadedImageData
              : URL.createObjectURL(uploadedImageData)
          }
          alt=""
          className="rounded-12"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
          }}
        />
      </div>

      <p className="text-14 leading-24 text-black font-m mt-24">
        آیا از حذف این تصویر اطمینان دارید ؟
      </p>

      <div className="grid grid-cols-3 gap-x-12 mt-24">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            variant="outlined"
            color="error"
            onClick={() => {
              onDeleteConfirm();
              handleSmoothClose();
            }}
          >
            بله، حذف کن
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteImageBottomSheet;
