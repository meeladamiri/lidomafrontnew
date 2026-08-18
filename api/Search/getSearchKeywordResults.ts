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

const getSearchKeywordResults = async ({ name }: { name: string }) => {
  const url = `/api/search_keyword`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      name,
    })
    .call();
};

export { getSearchKeywordResults };
