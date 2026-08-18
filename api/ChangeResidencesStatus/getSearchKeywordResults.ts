import {
  I_Change_Residence_Status_display_type,
  I_Change_Residence_Status_display_type_payload,
} from "@/interfaces/ChangeResidencesStatus";
import apiBuilder from "../apiBuilder";

export interface IRoom {
  id: number;
  name: string;
}

export interface IResidence {
  display_type: I_Change_Residence_Status_display_type;
  id: number;
  name: string;
  address: string;
  image_url: string;
  rooms: IRoom[];
  host: { phone: string; name: string };
  last_update_at: string;
  last_update_by: string;
}

export interface ISearchKeywordResultsData {
  count: number;
  residences: IResidence[];
}

const getSearchKeywordResults = async ({
  keyword,
  search_type,
  res_type,
  page,
  page_size,
  start_date,
  end_date,
}: {
  keyword: string;
  search_type: string;
  res_type: I_Change_Residence_Status_display_type_payload;
  page: number;
  page_size: number;
  start_date?: string | null;
  end_date?: string | null;
}) => {
  const url = `/api/internal/search_residences`;

  const params: { [key: string]: any } = {
    keyword,
    search_type,
    res_type,
    page,
    page_size,
  };

  if (!!start_date) {
    params["start_date"] = start_date;
  }

  if (!!end_date) {
    params["end_date"] = end_date;
  }

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams(params)
    .call();
};

export { getSearchKeywordResults };
