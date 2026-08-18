//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const editResidenceImage = async ({
  img,
  productId,
  imgLabel,
  origin_id,
}: {
  img: File;
  productId: number;
  imgLabel: string;
  origin_id: number | string;
}) => {
  const url = `/api/edit_residence/photos`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setBody({ product_id: productId, [imgLabel]: img, origin_id })
    .setParams({})
    .call();
};

const submitStepOfEditResImages = async ({
  productId,
  imageIds,
}: {
  productId: number;
  imageIds: number[];
}) => {
  const url = `/api/edit_residence/submit_photos`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      product_id: productId,
      image_ids: imageIds,
    })
    .call();
};

export { editResidenceImage, submitStepOfEditResImages };
