import { IResidence } from "@/api/ChangeResidencesStatus/getSearchKeywordResults";
import { appendQueryParameters } from "@/utilities/URL/appendQueryParameters";
import { NextRouter } from "next/router";

export function appendResesAndRoomsToUrl({
  residencesList,
  router,
}: {
  residencesList: IResidence[];
  router: NextRouter;
}) {
  const query_params_array: [string, string][] = [];

  residencesList.forEach((item) => {
    if (item.display_type === "suit") {
      query_params_array.push(["residenceId", item.id.toString()]);
    } else {
      // item.display_type === "boomgardi"
      item.rooms.forEach((room) => {
        query_params_array.push(["roomId", room.id.toString()]);
      });
    }
  });
  appendQueryParameters(router, query_params_array)
}
