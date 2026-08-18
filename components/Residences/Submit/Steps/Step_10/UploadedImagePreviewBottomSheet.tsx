import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import Image from "next/image";
import { UploadBox } from "../../../../General/UploadBox/UploadBox";
import { useRef, useState } from "react";

function UploadedImagePreviewBottomSheet({
  handleSmoothClose,
  onSubmit,
  uploadBoxText,
  uploadedImageData,
}: {
  handleSmoothClose: THandleSmoothClose;
  uploadedImageData: File | string;
  // onDeleteClick: () => void;
  onSubmit: (imageData: File | undefined) => void;
  uploadBoxText: string;
}) {
  const realFileBtn = useRef<any>();
  const [localImage, setLocalImage] = useState<File | string | undefined>(uploadedImageData);

  return (
    <div>
      {!!localImage ? (
        <div className="w-full h-[214px] relative">
          <Image
            src={typeof localImage === "string" ? localImage : URL.createObjectURL(localImage)}
            alt=""
            className="rounded-12"
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
            }}
          />

          <div
            onClick={() => {
              setLocalImage(undefined);
            }}
            className="absolute top-12 left-12 w-40 h-40 flex items-center justify-center rounded-full bg-error-light cursor-pointer"
          >
            <i className="text-24 text-white icon-Delete" />
          </div>
        </div>
      ) : (
        <div>
          <UploadBox
            text={uploadBoxText}
            uploadBtnText={"بارگذاری عکس"}
            setImage={setLocalImage as any}
            // setImagePreview={setLocalImagePreview}
            realFileBtn={realFileBtn}
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-x-12 mt-32">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            // disabled={isFirstTimeBeingEdited ? false : uploadedImageTitle === localText}
            onClick={() => {
              if (typeof localImage !== "string") {
                onSubmit(localImage);
              }
              handleSmoothClose();
            }}
          >
            ثبت
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UploadedImagePreviewBottomSheet;
