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
  province,
}: IEditResidenceSpecs) => {
  const url = `/api/edit_residence/general_info`;

  const params = {
    product_id,
    name,
    description,
    city,
    address,
    floor,
    foundation_area,
    total_area,
    neighborhood,
    latitude,
    longitude,
    province,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { editResidenceSpecs };
