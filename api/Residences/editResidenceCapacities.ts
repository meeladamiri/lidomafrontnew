import apiBuilder from "../apiBuilder";

const editResidenceCapacities = async ({
  productId,
  capacity,
  max_capacity,
  rooms,
}: {
  productId: number;
  capacity: number;
  max_capacity: number;
  rooms: {
    // id?: number; // Newly created rooms do NOT have id yet. But rooms retrieved from Server must have 'id' included in the RoomObject;
    name: string;
    single_bed: number;
    double_bed: number;
    traditional_bed: number;
    extra: string;
  }[];
}) => {
  const url = `/api/edit_residence/capacity`;

  const params = {
    product_id: productId,
    capacity,
    max_capacity,
    rooms,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { editResidenceCapacities };
