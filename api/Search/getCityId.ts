import apiBuilder from "../apiBuilder";

const getCityId = async (cityName: string) => {
  const url = `/api/search/cities`;

  const resp = await apiBuilder
    .setUrl(url)
    .setCallMethod("GET")
    .setParams({ q: cityName })
    .call();

  if (resp?.status !== "success") return resp;

  const match = (resp?.data?.cities || []).find(
    (c: any) => c.name === cityName
  ) || resp?.data?.cities?.[0];

  return {
    status: "success",
    params: {
      id: match?.id,
      title_en: match?.titleEn || "",
    },
  };
};

export { getCityId };
