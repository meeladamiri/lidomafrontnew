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
