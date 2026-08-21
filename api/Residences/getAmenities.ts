// Old backend: `/api/get_amenities` returned ONE flat catalog mixing facility
// amenities and residence rules together, discriminated by a `category`
// string that Step_6 and Step_12 each filter by client-side. The new backend
// models these as two separate catalogs (`/api/residences/amenities` and
// `/api/residences/rules`), so this merges them back into that flat shape.

import apiBuilder from "../apiBuilder";

const AMENITIES_CATEGORY = "امکانات";
const RULES_CATEGORY = "مقررات اقامتگاه";

function mapFieldType(fieldType: string): "text" | "dropdown" | "switch" | "checkbox" {
  return fieldType.toLowerCase() as "text" | "dropdown" | "switch" | "checkbox";
}

const getAmenities = async (): Promise<any> => {
  const [amenitiesResp, rulesResp] = await Promise.all([
    apiBuilder.setUrl(`/api/residences/amenities`).setCallMethod("GET").call(),
    apiBuilder.setUrl(`/api/residences/rules`).setCallMethod("GET").call(),
  ]);

  if (amenitiesResp?.status !== "success" || rulesResp?.status !== "success") {
    return { status: "error", err_msg: "خطا در دریافت امکانات و قوانین" };
  }

  const amenities = (amenitiesResp.data || []).map((a: any) => ({
    id: a.id,
    // Step_6 filters on this exact string to decide "is this a facility item"
    // — the DB's own `category` (e.g. "رفاهی") is a finer sub-grouping the
    // wizard doesn't currently use, so it's intentionally not surfaced here.
    category: AMENITIES_CATEGORY,
    name: a.name,
    icon_url: a.iconUrl || "",
    values: "",
    extra_features: (a.features || []).map((f: any) => ({
      field_type: mapFieldType(f.fieldType),
      name: f.name,
      placeholder: f.placeholder || undefined,
      values: f.values || undefined,
      in_filter: f.inFilter,
    })),
  }));

  const rules = (rulesResp.data || []).map((r: any) => ({
    id: r.id,
    category: RULES_CATEGORY,
    name: r.name,
    icon_url: r.iconUrl || "",
    values: "",
  }));

  return { status: "success", params: { amenities: [...amenities, ...rules] } };
};

export { getAmenities };
