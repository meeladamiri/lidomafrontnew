// Same backend endpoints as api/NewResidenceImages.ts (the wizard's image
// upload) — the edit screen's Images.tsx tab just calls them under a
// different function name. See that file for the `{ data: {...} }` wrapper
// explanation (Images.tsx reads response.data.status, same as Step_9).

import client from "./index";

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
}): Promise<any> => {
  const isMain = imgLabel === "main";
  const form = new FormData();
  form.append("image", img);
  form.append("isMain", String(isMain));
  if (!isMain) form.append("title", imgLabel);

  try {
    const resp = await client.post(`/api/host/residences/${productId}/images`, form);
    return {
      data: {
        status: "success",
        params: { image_id: resp.data?.data?.id, origin_id, product_id: productId },
      },
    };
  } catch (err: any) {
    return { data: { status: "error", err_msg: err?.response?.data?.message } };
  }
};

const submitStepOfEditResImages = async ({
  productId,
  imageIds,
}: {
  productId: number;
  imageIds: number[];
}): Promise<any> => {
  return client
    .post(`/api/host/residences/${productId}/images/order`, {
      imageIds: imageIds.filter((id) => !!id),
    })
    .then((resp) => ({ status: "success", params: resp.data?.data }))
    .catch((err) => ({ status: "error", err_msg: err?.response?.data?.message }));
};

export { editResidenceImage, submitStepOfEditResImages };
