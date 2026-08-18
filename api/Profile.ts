//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { dataURItoBlob } from "@/utilities/imageConversion";
import apiBuilder from "./apiBuilder";

const uploadMizbanShenasname = async ({ image }: { image: any }) => {
  const url = `/api/users/verify_uploads`;

  return (
    apiBuilder
      .setUrl(url)
      .setCallMethod("POST")
      .setJsonRpcMethod("call")
      // .setParams()
      .setBody({ x_shenasnameh: dataURItoBlob(image) })
      .call()
  );
};

const deletePhoto = async ({ image_id, name }: { image_id?: number; name: string }) => {
  const url = `/api/user/delete_image`;

  const params: { [key: string]: string | number } = {
    name,
  };

  if (!!image_id) {
    params.image_id = image_id;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

const deleteMizbanAvatar = async () => {
  const url = `/api/user/delete_image`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      name: "user",
      title: "avatar",
    })
    .call();
};

const uploadMizbanAvatar = async ({ image }: { image: any }) => {
  const url = `/api/user/update_avatar`;

  return (
    apiBuilder
      .setUrl(url)
      .setCallMethod("POST")
      .setJsonRpcMethod("call")
      // .setParams()
      .setBody({ profile_pic: dataURItoBlob(image) })
      .call()
  );
};

const uploadMizbanCartMelli = async ({ image }: { image: any }) => {
  const url = `/api/users/verify_uploads`;

  return (
    apiBuilder
      .setUrl(url)
      .setCallMethod("POST")
      .setJsonRpcMethod("call")
      // .setParams()
      .setBody({ x_cart_melli: dataURItoBlob(image) })
      .call()
  );
};

export {
  uploadMizbanShenasname,
  deletePhoto,
  deleteMizbanAvatar,
  uploadMizbanAvatar,
  uploadMizbanCartMelli,
};
