import apiBuilder from "../apiBuilder";

export interface ICityOrProvince {
  id: number;
  image: string; // ex:"https://test.lidomatrip.com/web/image/product.public.category/29/image";
  name: string;
  count: number;
  title_en: string;
}

const getPopularDestinations = async () => {
  const url = `/api/get_popular_dests`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

export { getPopularDestinations };
