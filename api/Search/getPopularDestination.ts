import apiBuilder from "../apiBuilder";

export interface ICityOrProvince {
  id: number;
  image: string; // ex:"https://test.lidomatrip.com/web/image/product.public.category/29/image";
  name: string;
  count: number;
  title_en: string;
}

const getPopularDestinations = async () => {
  const url = `/api/search/destinations/popular`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  // The new backend only ranks cities (no province-level popularity) — reshape into
  // the old `{status, params:{cities, provinces}}` envelope existing consumers expect.
  const cities: ICityOrProvince[] = (resp?.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    image: c.image || "",
    count: c.count ?? 0,
    title_en: c.titleEn || "",
  }));

  return { status: "success", params: { cities, provinces: [] } };
};

export { getPopularDestinations };
