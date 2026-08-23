import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";
import { residenceTypeSlug, residenceTypeLabel } from "@/utilities/residenceType";
import apiBuilder from "../apiBuilder";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { mapCard } from "../Search/search";

export interface I_MizbanAccountInfo_Data_review {
  average_rating: number;
  comment: string;
  customer: string;
  host_answer?: string;
  reserve_date: string; // ex: "2022-03-19"
  residence: {
    display_type: I_Residence_display_type;
    id: number;
    image_url: string; // "https://cdn.lidomatrip.com/web/image/product.template/21034/image/آپارتمان-مبله-آذرشهر.jpg";
    name: string;
  };
}

export interface I_MizbanAccountInfo_Data {
  host_info: {
    answer_time: number;
    confirm_percent: number; // ex: 43.333333333333336
    description?: string;
    image_url: string; // ex: "https://cdn.lidomatrip.com/web/image/res.partner/18186/image_small";
    name: string;
    city?: string; // the host's "home" city (most frequent among their residences) — SEO copy
  };
  residences: IProduct_SearchResidences[];
  reviews: I_MizbanAccountInfo_Data_review[];
}

// Shared by the client-side fetch below and `pages/host/[id].tsx`'s
// getServerSideProps (which hits the backend directly with `fetch`, bypassing
// apiBuilder, since server-to-server requests don't go through the
// browser-only Next.js rewrite).
export function mapHostProfileResponse(resp: any) {
  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  const host = resp.data?.host;

  const data: I_MizbanAccountInfo_Data = {
    host_info: {
      answer_time: 0, // no host/guest messaging system yet to measure this from
      confirm_percent: host?.confirmPercent ?? 100,
      description: host?.description || undefined,
      image_url: host?.avatarUrl || "",
      name: host?.name || "",
      city: host?.cityName || undefined,
    },
    residences: (resp.data?.residences || []).map(mapCard),
    reviews: (resp.data?.reviews || []).map((r: any) => ({
      average_rating: r.averageRating ?? 0,
      comment: r.comment,
      customer: r.guest?.name ?? "",
      host_answer: r.hostAnswer ?? undefined,
      reserve_date: r.createdAt?.slice(0, 10) ?? "",
      residence: {
        display_type: residenceTypeSlug(r.residence?.type),
        id: r.residence?.id,
        image_url: r.residence?.images?.[0]?.url ?? "",
        name: r.residence?.name ?? "",
      },
    })),
  };

  return { status: "success", params: data };
}

const getMizbanAccountInfo = async ({ reference }: { reference: string }) => {
  const resp = await apiBuilder.setUrl(`/api/residences/hosts/${reference}`).setCallMethod("GET").call();
  return mapHostProfileResponse(resp);
};

export { getMizbanAccountInfo };
