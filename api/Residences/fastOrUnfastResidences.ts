import { FastUnfastOptions_enum } from "@/constants/enums/fast_unfast_options";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { jalaliToIso } from "@/utilities/jalaliGregorian";
import apiBuilder from "../apiBuilder";

const fastOrUnfastResidences = async ({
  product_id,
  products,
  dates,
  fast,
  res_type,
}: {
  product_id?: number; // is required when an individual residence is selected; in this case 'products' will not be provided;
  dates: string[]; // ex: ["1401/09/22", "1401/09/20"]
  fast: FastUnfastOptions_enum;
  products?: number[]; // array of 'residenceIds'. is required when 'all' residences are selected; in this case 'product_id' will not be provided;
  res_type: ResidenceTypes_enum;
}): Promise<any> => {
  // Boomgardi room-level fast-reserve has no backend equivalent yet — the
  // "apply to all" flow calls this once for residences and once for rooms,
  // so this must no-op rather than error out the whole combined action.
  if (res_type === ResidenceTypes_enum.ROOM) {
    return { status: "success" };
  }

  const ids = product_id ? [product_id] : products || [];
  if (ids.length === 0) return { status: "success" };

  const isoDates = dates.map(jalaliToIso);

  const results = await Promise.all(
    ids.map((id) =>
      apiBuilder
        .setUrl(`/api/host/residences/${id}/calendar`)
        .setCallMethod("PATCH")
        .setParams({ dates: isoDates, isFast: fast === FastUnfastOptions_enum.FAST })
        .call()
    )
  );

  const failed = results.find((r) => r?.status !== "success");
  if (failed) return { status: "error", err_msg: failed?.message };
  return { status: "success" };
};

export { fastOrUnfastResidences };
