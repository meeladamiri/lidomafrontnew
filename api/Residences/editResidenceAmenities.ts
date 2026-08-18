import apiBuilder from "../apiBuilder";

const editResidenceAmenities = async ({
  productId,
  amenities,
  others,
}: {
  productId: number;
  amenities: { id: number; extra_features: { [key: string | number]: string | number } }[];
  others: string;
}) => {
  const url = `/api/edit_residence/amenities`;

  const params = {
    product_id: productId,
    amenities,
    others,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { editResidenceAmenities };
