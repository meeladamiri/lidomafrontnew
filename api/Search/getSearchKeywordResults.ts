import { I_Residence_display_type } from "@/interfaces/Residences";
import apiBuilder from "../apiBuilder";

interface ICategory {
  count: number;
  parent_id: number;
  parent_name: string;
  title_en: string;
  id: number;
  name: string;
  score: number;
  type: "city" | "province" | "country";
}

interface IResidence {
  display_type: I_Residence_display_type;
  id: number;
  name: string;
  reference: number;
  score: number;
}

export interface ISearchKeywordResultsData {
  categories: ICategory[];
  residences: IResidence[];
}

// Old backend: POST /api/search_keyword (Odoo JSON-RPC). New backend:
// GET /api/search/cities?q=... which returns matching cities, provinces, and
// published residences — reshaped into the old `{status, params:{categories,
// residences}}` envelope the destination-search dropdown expects.
const getSearchKeywordResults = async ({ name }: { name: string }) => {
  const resp = await apiBuilder
    .setUrl(`/api/search/cities?q=${encodeURIComponent(name)}`)
    .setCallMethod("GET")
    .call();

  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };

  const categories: ICategory[] = [
    ...(resp?.data?.cities || []),
    ...(resp?.data?.provinces || []),
  ].map((c: any, idx: number) => ({
    id: c.id,
    name: c.name,
    title_en: c.titleEn || "",
    count: c.count ?? 0,
    parent_id: 0,
    parent_name: "",
    score: idx,
    type: c.type,
  }));

  const residences: IResidence[] = (resp?.data?.residences || []).map((r: any, idx: number) => ({
    id: r.id,
    name: r.name,
    reference: r.reference,
    display_type: r.displayType,
    score: idx,
  }));

  return { status: "success", params: { categories, residences } };
};

export { getSearchKeywordResults };
