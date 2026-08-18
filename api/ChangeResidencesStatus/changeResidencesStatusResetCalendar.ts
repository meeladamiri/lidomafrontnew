// import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { I_Change_Residence_Status_display_type_payload } from "@/interfaces/ChangeResidencesStatus";
import apiBuilder from "../apiBuilder";

const changeResidencesStatusResetCalendar = async ({
  reset,
  residences,
  rooms,
  dates,
  keyword,
  res_type,
  search_type,
}: {
  reset: boolean;
  residences: number[]; // is required when an individual residence is selected; in this case 'products' will not be provided;
  rooms: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  keyword?: string;
  res_type?: I_Change_Residence_Status_display_type_payload;
  search_type?: string;
}) => {
  const url = `/api/internal/update_calendar`;

  return apiBuilder
    .setUrl(url)
    .setCallMethod("POST")
    .setJsonRpcMethod("call")
    .setParams({
      reset,
      residences,
      rooms,
      dates,
      keyword,
      res_type,
      search_type,
    })
    .call();
};

export { changeResidencesStatusResetCalendar };
