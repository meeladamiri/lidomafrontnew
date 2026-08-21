import apiBuilder from "../apiBuilder";

const editResidenceAmenities = async ({
  productId,
  amenities,
  others,
}: {
  productId: number;
  amenities: { id: number; extra_features: { [key: string | number]: string | number } }[];
  others: string;
}): Promise<any> => {
  return apiBuilder
    .setUrl(`/api/host/residences/${productId}/amenities`)
    .setCallMethod("PATCH")
    .setParams({
      amenities: amenities.map((a) => ({ amenityId: a.id, extraFeatures: a.extra_features })),
      other: others,
    })
    .call();
};

export { editResidenceAmenities };
