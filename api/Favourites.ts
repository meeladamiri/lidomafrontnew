//import { firebaseCloudMessaging } from "utils/google/firebase/webPush";

import { likeOrUnlikeResidenceActions_enum } from "@/constants/enums/like_Unlike_residence_actions";
import apiBuilder from "./apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";

export interface IFavouriteItem {
  average_rating: number;
  city_id: number;
  province_id: number;
  city: string;
  discount: number;
  is_fast: boolean;
  is_full: boolean;
  id: number;
  images: string[]; // ex: "https://cdn.lidomatrip.com/web/image/product.image/46063/image/خانه-اجاره-ای-برای-مسافران-تبریز.jpg"
  main_image: string; // ex: "https://cdn.lidomatrip.com/web/image/product.image/46063/image/خانه-اجاره-ای-برای-مسافران-تبریز.jpg"
  max_capacity: number;
  name: string;
  neighborhood: string;
  price?: number;
  province: string;
  reference: string;
  reviews_count: number;
  rooms_count: number;
  display_type: I_Residence_display_type;
  name2: string;
}

const getFavourites = async () => {
  const url = `/api/users/panel/wishlist`;

  return apiBuilder.setUrl(url).setCallMethod("POST").setJsonRpcMethod("call").setParams({}).call();
};

const likeOrUnlikeResidence = async ({
  product_id,
  action,
}: {
  product_id: number;
  action: likeOrUnlikeResidenceActions_enum;
}) => {
  const url = `/api/users/wishlist/action`;

  const params = {
    product_id,
    action,
  };

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { getFavourites, likeOrUnlikeResidence };
