export interface IUploadedResidenceImage {
  id: string;
  title: string;
  data: File | string;
}

export interface IConfirmDeleteImageBottomSheet {
  show: boolean;
  payload: {
    id: IUploadedResidenceImage["id"];
    data: File | string | null;
  };
}

export interface IUploadedImagePreviewBottomSheet {
  imagesData: {
    imageData: File | string | undefined;
    title: string;
    id: string;
    isFirstTime: boolean; // if it is the being uploaded from gallery 'for first time; OR already exists in app memory (api or uploaded before from gallery).
  }[];
}
