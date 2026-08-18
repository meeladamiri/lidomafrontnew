import { EXCEPTIONTYPES } from "constants/enums/exception_types";
import { ChangeEvent, Dispatch, MutableRefObject, SetStateAction } from "react";
import exception from "utilities/exception";

export function UploadBox({
  realFileBtn,
  text,
  uploadBtnText,
  setImage,
  setImagePreview,
  onImageLoadEnd_Cb,
  isImageOptional = false,
  multiple = false,
  setMultipleImages,
  setMultipleImagesPreview,
  onEachImageLoadEnd_Cb,
}: {
  realFileBtn: MutableRefObject<any>;
  text?: string;
  uploadBtnText: string;
  setImage?: Dispatch<SetStateAction<File | undefined>>;
  setImagePreview?: Dispatch<SetStateAction<FileReader["result"] | undefined>>;
  onImageLoadEnd_Cb?: (imageData: File, imagePreviewData: FileReader["result"]) => void;
  isImageOptional?: boolean;
  multiple?: boolean;
  setMultipleImages?: Dispatch<SetStateAction<File[]>>;
  setMultipleImagesPreview?: Dispatch<SetStateAction<(string | ArrayBuffer | null)[]>>;
  onEachImageLoadEnd_Cb?: (imageData: File, imagePreviewData: FileReader["result"]) => void;
}) {
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (!!e?.target?.files) {
      if (!!multiple) {
        for (let file of e?.target?.files) {
          // console.log("item of e?.target?.files is, ", file);
          if ((file?.size as number) > 2000000) {
            exception.message([
              { type: EXCEPTIONTYPES.ERROR, title: "عکس بیشتر از دو مگابایت نباید باشد" },
            ]);
          } else {
            let reader = new FileReader();
            reader.onloadend = () => {
              if (!!setMultipleImages) {
                setMultipleImages((prev) => [...prev, file]);
              }
              if (!!setMultipleImagesPreview) {
                setMultipleImagesPreview((prev) => [...prev, reader.result]);
              }

              if (!!onEachImageLoadEnd_Cb) {
                onEachImageLoadEnd_Cb(file as File, reader.result);
              }
            };
            // Handling image-select cancel operation
            if (!!file) {
              reader?.readAsDataURL(file as File);
            }
          }
        }
      } else {
        let file = e?.target?.files?.[0];

        if ((file?.size as number) > 2000000) {
          exception.message([
            { type: EXCEPTIONTYPES.ERROR, title: "عکس بیشتر از دو مگابایت نباید باشد" },
          ]);
        } else {
          let reader = new FileReader();
          reader.onloadend = () => {
            if (!!setImage) {
              setImage(file);
            }
            if (!!setImagePreview) setImagePreview(reader.result);
            if (!!onImageLoadEnd_Cb) onImageLoadEnd_Cb(file as File, reader.result);
          };
          // Handling image-select cancel operation
          if (!!file) {
            reader?.readAsDataURL(file as File);
          }
        }
      }
    }
  };

  return (
    <div className="px-20 py-24 flex flex-col items-center rounded-12 border-1 border-dashed border-black">
      <div className="w-48 h-48 rounded-full bg-[rgba(3,214,187,0.1)] mb-12 flex items-center justify-center">
        <i className="icon-Photo text-primary-main text-30" />
      </div>

      {!!text && (
        <div className="text-14 leading-24 text-black font-m mb-16 text-center">
          <p>
            {text}{" "}
            {!!isImageOptional && <span className="text-[#1C2E4599] text-12">{"(اختیاری)"}</span>}
          </p>
        </div>
      )}

      <div
        className="py-8 px-16 flex items-center gap-x-4 typical-gray-bg rounded-50 cursor-pointer"
        onClick={() => realFileBtn.current.click()}
      >
        <i className="icon-Upload text-black text-24" />

        <p className="text-14 leading-24 text-black font-m ">{uploadBtnText}</p>

        <input
          type="file"
          hidden={true}
          ref={realFileBtn}
          accept="image/jpeg ,image/jpg, image/png, image/webp"
          onChange={(e) => handleImageUpload(e)}
          multiple={multiple}
        />
      </div>
    </div>
  );
}
