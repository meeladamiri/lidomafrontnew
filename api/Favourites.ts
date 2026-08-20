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
  const url = `/api/favourites`;

  const resp = await apiBuilder.setUrl(url).setCallMethod("GET").call();

  if (resp?.status !== "success") return resp;

  const wishlist: IFavouriteItem[] = (resp?.data || []).map((f: any) => {
    const residence = f.residence || {};
    const images: string[] = (residence.images || []).map((img: any) => img.url).filter(Boolean);

    return {
      id: residence.id,
      name: residence.name,
      name2: residence.name2 || "",
      average_rating: residence.averageRating ?? 0,
      reviews_count: residence.reviewsCount ?? 0,
      price: residence.weekPrice ?? 0,
      max_capacity: residence.maxCapacity ?? 0,
      city: residence.city?.name || "",
      city_id: undefined as any,
      province: "",
      province_id: undefined as any,
      neighborhood: "",
      images,
      main_image: images[0] || "",
      reference: residence.reference || "",
      rooms_count: 0,
      is_fast: false,
      is_full: false,
      discount: 0,
      display_type: undefined as any,
    };
  });

  // Reshape to the old `{status, params:{wishlist}}` envelope so existing consumers
  // keep working unchanged.
  return { status: "success", params: { wishlist } };
};

const likeOrUnlikeResidence = async ({
  product_id,
  action,
}: {
  product_id: number;
  action: likeOrUnlikeResidenceActions_enum;
}) => {
  const url = `/api/favourites/toggle`;

  const params = {
    residenceId: product_id,
    action: action === likeOrUnlikeResidenceActions_enum.ADD ? "like" : "unlike",
  };

  return apiBuilder.setUrl(url).setCallMethod("POST").setParams(params).call();
};

export { getFavourites, likeOrUnlikeResidence };
