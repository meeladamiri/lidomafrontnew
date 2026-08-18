import apiBuilder from "../apiBuilder";

const getAmenities = async () => {
  const url = `/api/get_amenities`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { getAmenities };
