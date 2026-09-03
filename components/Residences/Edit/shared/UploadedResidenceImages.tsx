import { Dispatch, SetStateAction } from "react";
import UploadedResidenceImage from "./UploadedResidenceImage";
import { Droppable } from "react-beautiful-dnd";
import {
  IConfirmDeleteImageBottomSheet,
  IUploadedImagePreviewBottomSheet,
  IUploadedResidenceImage,
} from "interfaces/Residences/Submit/Steps/Step_9";

function UploadedResidenceImages({
  setConfirmDeleteImageBottomSheet,
  uploadedResidenceImages,
  setUploadedResidenceImages,
  setUploadedImagePreviewBottomSheet,
  imagesBeingUploaded,
  uploadedImagesToServer,
  coverInList = false,
  onMakeMain,
}: {
  setConfirmDeleteImageBottomSheet: Dispatch<SetStateAction<IConfirmDeleteImageBottomSheet>>;
  uploadedResidenceImages: IUploadedResidenceImage[];
  setUploadedResidenceImages: Dispatch<SetStateAction<IUploadedResidenceImage[]>>;
  setUploadedImagePreviewBottomSheet: Dispatch<SetStateAction<IUploadedImagePreviewBottomSheet>>;
  imagesBeingUploaded: IUploadedResidenceImage[];
  uploadedImagesToServer: {
    image_id: number;
    origin_id: string;
    product_id: number;
  }[];
  /**
   * Present when the cover lives inside this list rather than above it.
   *
   * The edit-residence page renders the cover separately and passes neither,
   * so it keeps its old numbering and no promote button. The submission wizard
   * passes both: one list, position one is the cover, and every other card
   * offers to become it.
   */
  coverInList?: boolean;
  onMakeMain?: (image: IUploadedResidenceImage) => void;
}) {
  return (
    <div>
      <Droppable droppableId="TodosList">
        {(provided: any, snapshot: any) => (
          <div
            className={`${snapshot.isDraggingOver ? "dragactive" : ""}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {uploadedResidenceImages?.map((u_image: IUploadedResidenceImage, index: number) => (
              <UploadedResidenceImage
                uploadedResidenceImage={u_image}
                imageIndex={index}
                canBeDeleted={true}
                onDeleteBtnClick={() =>
                  setConfirmDeleteImageBottomSheet({
                    show: true,
                    payload: {
                      id: u_image.id,
                      data: u_image.data,
                    },
                  })
                }
                id={u_image.id}
                key={u_image.id}
                setUploadedImagePreviewBottomSheet={setUploadedImagePreviewBottomSheet}
                isBeingUploaded={!!imagesBeingUploaded.find((el) => el.id === u_image.id)}
                isUploadSuccess={!!uploadedImagesToServer.find((el) => el.origin_id === u_image.id)}
                displayNumber={coverInList ? index + 1 : undefined}
                isMain={coverInList && index === 0}
                onMakeMainClick={onMakeMain ? () => onMakeMain(u_image) : undefined}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default UploadedResidenceImages;
