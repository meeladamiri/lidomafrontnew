//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { BASE_URL } from "@/configs/info";
import apiBuilder from "./apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";

export interface IHomePageData {
  suggests: {
    // average: number; // ex: 729984.962406015
    id: number;
    image: string; // ex: "https://test.lidomatrip.com/web/image/product.public.category/46/x_suggest_image";
    name: string;
    content: string;
    title_en: string;
  }[];
  faqs: {
    answer: string; // html string
    question: string;
    id: number;
  }[];
  desc_boxes: {
    content: string; // html string
    mobile_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_desc_sections/1/x_mobile_image";
    pc_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_desc_sections/1/x_pc_image";
    id: number;
    title: string;
  }[];
  slides: {
    id: number;
    image: string;
    link: string;
  }[];
  service_boxes: {
    content: string;
    image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_trust_boxes/2/x_image";
    id: number;
    title: string;
  }[];
  articles: {
    author: string;
    image: string; // ex: "https://test.lidomatrip.com/web/image/x_article/9/x_image";
    title: string;
    link?: string; // ex: "https://lidomatrip.com/blog/travelguide-to-kelardasht/";
    author_image: string; // ex: "https://test.lidomatrip.com/web/image/x_article/9/x_author_image";
    id: number;
  }[];
  banners: {
    mobile_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_banners/1/x_mobile_image";
    link: string; // ex: "tel://+989361323233";
    id: number;
    pc_image: string; // ex: "https://test.lidomatrip.com/web/image/x_homepage_banners/1/x_pc_image";
  }[];
}

export interface ICustomSlide {
  average_rating: number;
  city: string;
  city_id: number;
  discount: number;
  display_type: I_Residence_display_type;
  id: number;
  is_fast: boolean;
  is_full: boolean;
  is_offer: number;
  main_image: string;
  max_capacity: number;
  min_price: number;
  name: string;
  name2: string;
  neighborhood: string;
  province: string;
  province_id: number;
  reference: number;
  reviews_count: number;
  rooms_count: number;
}
export interface ICustomSliders {
  residences: ICustomSlide[];
}

const getHomePageData = async () => {
  const url = `/api/home/get_items`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getCustomSliders = async ({
  cat_id,
  limit,
  res_type,
}: {
  cat_id: number;
  limit: number;
  res_type: "suit" | "boomgardi" | "all";
}) => {
  const url = `/api/home/get_custom_sliders`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({ cat_id, limit, res_type })
    .call();
};

const getHomePageData2 = async () => {
  const url = `${BASE_URL}/api/home/get_items`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const getHomePageMetaTags = async () => {
  const url = `/api/get_meta_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      page: "home",
    })
    .call();
};

const getHomePageMetaTags2 = async () => {
  const url = `${BASE_URL}/api/get_meta_info`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      page: "home",
    })
    .call();
};

export {
  getHomePageData,
  getHomePageData2,
  getHomePageMetaTags,
  getHomePageMetaTags2,
  getCustomSliders,
};
