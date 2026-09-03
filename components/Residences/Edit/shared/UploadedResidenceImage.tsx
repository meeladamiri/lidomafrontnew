import classes from "styles/Spinner.module.css";
import { defaultUploadedResidenceImageLabel } from "constants/Residences/Submit/Steps/Step_9";
import {
  IUploadedImagePreviewBottomSheet,
  IUploadedResidenceImage,
} from "interfaces/Residences/Submit/Steps/Step_9";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { Draggable } from "react-beautiful-dnd";

function UploadedResidenceImage({
  uploadedResidenceImage,
  imageIndex,
  canBeDeleted,
  onDeleteBtnClick,
  id,
  setUploadedImagePreviewBottomSheet,
  isBeingUploaded,
  isUploadSuccess,
  displayNumber,
  isMain = false,
  onMakeMainClick,
}: {
  uploadedResidenceImage: IUploadedResidenceImage;
  imageIndex: number;
  canBeDeleted: boolean;
  onDeleteBtnClick?: () => void;
  id: number | string;
  setUploadedImagePreviewBottomSheet: Dispatch<SetStateAction<IUploadedImagePreviewBottomSheet>>;
  isBeingUploaded: boolean;
  isUploadSuccess: boolean;
  /**
   * The number drawn on the card. Defaults to `imageIndex + 2`, which is what
   * the edit-residence page needs: there the cover is rendered above the list
   * as its own card, so the list starts at two. The submission wizard shows
   * one list with the cover inside it and passes `imageIndex + 1`.
   */
  displayNumber?: number;
  /** Marks this card as the listing's cover photo. */
  isMain?: boolean;
  /** Offered on every card that is not already the cover. */
  onMakeMainClick?: () => void;
}) {
  return (
    <Draggable draggableId={id.toString()} index={imageIndex}>
      {(provided: any, snapshot: any) => (
        <div
          {...provided.draggableProps}
          // {...provided.dragHandleProps}
          ref={provided.innerRef}
          className={`mb-16 last:mb-0 ${snapshot.isDragging ? "drag" : ""}`}
        >
          <div className="w-full h-[214px] relative">
            <Image
              src={
                typeof uploadedResidenceImage?.data === "string"
                  ? uploadedResidenceImage?.data
                  : URL.createObjectURL(uploadedResidenceImage?.data)
              }
              alt=""
              className="rounded-tr-12 rounded-tl-12"
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
              }}
            />

            <div className="flex items-start justify-between absolute top-12 right-12 left-12">
              <div className="flex items-center gap-x-4">
                <p className="w-24 h-24 flex items-center justify-center rounded-full bg-white text-14 leading-24 text-black font-r">
                  {displayNumber ?? imageIndex + 2}
                </p>
                {isMain && (
                  <p className="text-12 leading-21 text-black font-r px-12 flex items-center justify-center bg-primary-main rounded-50 h-24">
                    تصویر اصلی
                  </p>
                )}
              </div>

              <div
                onClick={() => {
                  if (!!onDeleteBtnClick) {
                    onDeleteBtnClick();
                  }
                }}
                className="w-40 h-40 flex items-center justify-center rounded-full bg-error-light cursor-pointer"
              >
                <i className="text-24 text-white icon-Delete" />
              </div>
            </div>

            {isBeingUploaded ? (
              <div className={`absolute bottom-12 right-12 ${classes.spinner} w-32 h-32`}></div>
            ) : isUploadSuccess ? (
              <i className="absolute bottom-12 right-12 bg-white rounded-full icon-Success text-32 text-primary-main" />
            ) : null}

            <div
              {...provided.dragHandleProps}
              className="w-40 h-40 rounded-full bg-white flex items-center justify-center absolute bottom-12 left-12 cursor-pointer"
            >
              <i className="icon-Move text-24 text-black" />
            </div>
          </div>

          <div className="pt-9 pb-16 px-16 flex items-center justify-between gap-x-8 typical-gray-bg rounded-br-12 rounded-bl-12">
            <p className="text-14 leading-24 text-black font-m truncate">
              {uploadedResidenceImage.title || defaultUploadedResidenceImageLabel}
            </p>

            <div className="flex items-center gap-x-12 shrink-0">
            {!!onMakeMainClick && !isMain && (
              <button
                type="button"
                onClick={onMakeMainClick}
                className="h-32 px-12 rounded-8 border border-primary-main bg-white text-12 leading-21 font-m text-primary-dark whitespace-nowrap"
              >
                تصویر اصلی شود
              </button>
            )}

            <div
              className="flex items-center cursor-pointer"
              onClick={() =>
                setUploadedImagePreviewBottomSheet((prev) => {
                  return {
                    imagesData: [
                      ...prev.imagesData,
                      {
                        id: uploadedResidenceImage.id,
                        imageData: uploadedResidenceImage.data,
                        isFirstTime: false,
                        title: uploadedResidenceImage.title,
                      },
                    ],
                  };
                })
              }
            >
              <i className="icon-Edit text-black text-24" />
            </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default UploadedResidenceImage;
