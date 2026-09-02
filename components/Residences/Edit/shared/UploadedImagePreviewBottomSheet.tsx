import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import { TextField } from "components/General/core/TextField";
import Image from "next/image";
import { useState } from "react";

function UploadedImagePreviewBottomSheet({
  handleSmoothClose,
  uploadedImageId,
  uploadedImageData,
  uploadedImageTitle,
  // isServerImage,
  onSubmit,
  isFirstTimeBeingEdited,
}: {
  handleSmoothClose: THandleSmoothClose;
  uploadedImageId: number | string;
  uploadedImageData: File | string;
  uploadedImageTitle: string;
  // isServerImage: boolean;
  onSubmit: (imageTitle: string) => void;
  isFirstTimeBeingEdited: boolean;
}) {
  const [localText, setLocalText] = useState<string>(uploadedImageTitle);
  const [customError, setCustomError] = useState<string>("");

  // console.log("isServerImage", isServerImage);

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

      <div>
        <TextField
          name={`uploadedImage-${uploadedImageId}`}
          label="عنوان مناسبی برای تصویر انتخاب کنید"
          placeholder="مثال : اتاق خواب"
          customValue={localText}
          customOnChange={(value) => {
            setCustomError("");
            setLocalText(value);
          }}
          customError={customError}
        />
      </div>

      <div className="grid grid-cols-3 gap-x-12 mt-24">
        <div className="col-span-1">
          <Button
            isFullWidth
            color="grey"
            onClick={() => {
              setLocalText("");
              handleSmoothClose();
            }}
          >
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            disabled={isFirstTimeBeingEdited ? false : uploadedImageTitle === localText}
            onClick={() => {
              // if (!localText) {
              // setCustomError("لطفا عنوانی برای عکس بنویسید.");
              // } else {
              onSubmit(localText);
              setLocalText("");
              handleSmoothClose();
              // }
            }}
          >
            ثبت تصویر
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UploadedImagePreviewBottomSheet;
