import apiBuilder from "../apiBuilder";

export interface IEditResidenceSpecs {
  product_id: number;
  name: string;
  city: string;
  description: string;
  address: string;
  floor: string;
  foundation_area: number | null;
  total_area: number | null;
  neighborhood: string;
  latitude: number | null;
  longitude: number | null;
  province: string;
}

async function resolveCityId(cityName: string | undefined): Promise<number | undefined> {
  if (!cityName) return undefined;
  const resp = await apiBuilder
    .setUrl(`/api/search/cities`)
    .setCallMethod("GET")
    .setParams({ q: cityName })
    .call();
  if (resp?.status !== "success") return undefined;
  const match = (resp.data?.cities || []).find((c: any) => c.name === cityName) || resp.data?.cities?.[0];
  return match?.id;
}

const editResidenceSpecs = async ({
  product_id,
  name,
  city,
  description,
  address,
  floor,
  foundation_area,
  total_area,
  neighborhood,
  latitude,
  longitude,
}: IEditResidenceSpecs): Promise<any> => {
  const cityId = await resolveCityId(city);

  return apiBuilder
    .setUrl(`/api/host/residences/${product_id}`)
    .setCallMethod("PATCH")
    .setParams({
      name,
      description,
      cityId,
      address,
      floor,
      foundationArea: foundation_area ?? undefined,
      totalArea: total_area ?? undefined,
      neighborhood,
      latitude: latitude ?? undefined,
      longitude: longitude ?? undefined,
    })
    .call();
};

export { editResidenceSpecs };
