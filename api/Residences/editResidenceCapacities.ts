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
    name: string;
    single_bed: number;
    double_bed: number;
    traditional_bed: number;
    extra: string;
  }[];
}): Promise<any> => {
  return apiBuilder
    .setUrl(`/api/host/residences/${productId}/rooms`)
    .setCallMethod("PUT")
    .setParams({
      capacity,
      maxCapacity: max_capacity,
      rooms: rooms.map((r) => ({
        name: r.name,
        singleBed: r.single_bed || 0,
        doubleBed: r.double_bed || 0,
        traditionalBed: r.traditional_bed || 0,
        description: r.extra || undefined,
      })),
    })
    .call();
};

export { editResidenceCapacities };
