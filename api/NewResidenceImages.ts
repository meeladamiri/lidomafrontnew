//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import apiBuilder from "./apiBuilder";

const uploadNewResidenceImage = async ({
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
  const url = `/api/new_residence/upload_photos`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setBody({ product_id: productId, [imgLabel]: img, step: 9, origin_id })
    .setParams({})
    .call();
};

const submitNewResidenceImagesOrder = async ({
  productId,
  imageIds,
}: {
  productId: number;
  imageIds: number[];
}) => {
  const url = `/api/new_residence/submit_photos`;

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

const submitNewResidenceDocs = async ({
  host_national_card,
  document,
  owner_national_card,
  product_id,
}: {
  host_national_card: any;
  document?: any;
  owner_national_card?: any;
  product_id: number;
}) => {
  // This is for submission of step10 docs.
  const step = 10;
  const url = `/api/new_residence/upload_photos`;

  const data: any = {
    step,
    product_id,
  };

  if (!!host_national_card) {
    data["host_national_card"] = host_national_card;
  }

  if (!!document) {
    data["document"] = document;
  }
  if (!!owner_national_card) {
    data["owner_national_card"] = owner_national_card;
  }

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setBody(data).call();
};

export { uploadNewResidenceImage, submitNewResidenceImagesOrder, submitNewResidenceDocs };
