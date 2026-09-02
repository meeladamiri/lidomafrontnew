import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import exception from "@/utilities/exception";
import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";

function EditMainImageBottomSheet({
  handleSmoothClose,
  uploadedImageData,
  onNewImageConfirm,
}: {
  handleSmoothClose: THandleSmoothClose;
  uploadedImageData: File | string;
  onNewImageConfirm: (newMainImage: File) => void;
}) {
  const realFileBtn = useRef<any>();

  const [image, setImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<FileReader["result"]>();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    // console.log("e?.target?.files", e?.target?.files);

    if (!!e?.target?.files) {
      let file = e?.target?.files?.[0];

      if ((file?.size as number) > 2000000) {
        exception.message([
          { type: EXCEPTIONTYPES.ERROR, title: "عکس بیشتر از دو مگابایت نباید باشد" },
        ]);
      } else {
        let reader = new FileReader();
        reader.onloadend = () => {
          if (setImage) {
            setImage(file);
          }
          if (setImagePreview) setImagePreview(reader.result);
          //   if (!!onImageLoadEnd_Cb) onImageLoadEnd_Cb(file as File, reader.result);
        };
        // Handling image-select cancel operation
        if (!!file) {
          reader?.readAsDataURL(file as File);
        }
      }
    }
  };

  return (
    <div>
      <div className="w-full h-[214px] relative">
        <Image
          src={
            !!image
              ? URL.createObjectURL(image)
              : typeof uploadedImageData === "string"
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

      <input
        type="file"
        hidden={true}
        ref={realFileBtn}
        accept="image/jpeg ,image/jpg, image/png, image/webp"
        onChange={(e) => handleImageUpload(e)}
        multiple={false}
      />

      <div className="grid grid-cols-3 gap-x-12 mt-24">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          {!!image ? (
            <Button
              isFullWidth
              variant="contained"
              color="primary"
              onClick={() => {
                onNewImageConfirm(image);
                handleSmoothClose();
              }}
            >
              ذخیره
            </Button>
          ) : (
            <Button
              isFullWidth
              variant="outlined"
              color="grey"
              onClick={() => realFileBtn.current.click()}
              rightIcon={<i className="icon-Photo text-24 text-black" />}
            >
              انتخاب عکس جدید
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EditMainImageBottomSheet;
