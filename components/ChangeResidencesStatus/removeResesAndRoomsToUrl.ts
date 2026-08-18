import { IResidence } from "@/api/ChangeResidencesStatus/getSearchKeywordResults";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { NextRouter } from "next/router";

export function removeResesAndRoomsToUrl({
  residencesList,
  router,
}: {
  residencesList: IResidence[];
  router: NextRouter;
}) {
  const query_params_array: {
    paramKey: string;
    paramValue?: string | undefined;
  }[] = [];

  residencesList.forEach((item) => {
    if (item.display_type === "suit") {
      query_params_array.push({ paramKey: "residenceId", paramValue: item.id.toString() });
    } else {
      // item.display_type === "boomgardi"
      item.rooms.forEach((room) => {
        query_params_array.push({ paramKey: "roomId", paramValue: room.id.toString() });
      });
    }
  });
  removeQueryParameters(router, query_params_array);
}
