// Old backend: everything (main image, gallery images, KYC documents) POSTed
// through one generic `/api/new_residence/upload_photos` JSON-RPC endpoint,
// keyed by dynamic field names. The new backend has separate typed REST
// endpoints for images vs documents, so these wrap them back into the exact
// response shapes Step_9/Step_10 already read.
//
// NOTE: unlike every other api/*.ts function in this codebase, callers of
// these two functions read `response.data.status` / `response.data.params`
// (one level deeper than apiBuilder's usual unwrapped `{status, params}`) —
// that's a quirk baked into the untouched Step_9/Step_10 components, so the
// extra `{ data: ... }` wrapper here is intentional, not a mistake.

import client from "./index";

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

// Was defined but never called anywhere in the old app — image order is
// committed through `submitStep(9, ...)` -> `/images/order` instead. Kept as
// a thin alias so nothing breaks if something starts importing it.
const submitNewResidenceImagesOrder = async ({
  productId,
  imageIds,
}: {
  productId: number;
  imageIds: number[];
}): Promise<any> => {
  try {
    const resp = await client.post(`/api/host/residences/${productId}/images/order`, { imageIds });
    return { data: { status: "success", params: resp.data?.data } };
  } catch (err: any) {
    return { data: { status: "error", err_msg: err?.response?.data?.message } };
  }
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
}): Promise<any> => {
  const form = new FormData();
  if (host_national_card) form.append("hostNationalCard", host_national_card);
  if (document) form.append("document", document);
  if (owner_national_card) form.append("ownerNationalCard", owner_national_card);

  try {
    const resp = await client.post(`/api/host/residences/${product_id}/documents`, form);
    return { data: { status: "success", params: { product_id: resp.data?.data?.id ?? product_id } } };
  } catch (err: any) {
    return { data: { status: "error", err_msg: err?.response?.data?.message } };
  }
};

export { uploadNewResidenceImage, submitNewResidenceImagesOrder, submitNewResidenceDocs };
