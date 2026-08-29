/**
 * The residence-type filter on the search page. Each key is a URL parameter
 * (`/search/shiraz?villa=1`) that the backend resolves to an SEO tag.
 *
 * Every key here MUST match a tag the backend actually knows. Four of the eight
 * that used to be in this list did not, and the failure was silent: the chip
 * highlighted, the URL changed, and the page went on showing all 346 results
 * under the generic city title. Two were spelling drift and two never existed:
 *
 *   hotel-apartment  ->  the tag is `hotelapartment`, no hyphen
 *   motel            ->  the tag is `guesthouse`
 *   hotel, suit      ->  no such tag; these are residence_type values, which
 *                        is a different concept from an SEO tag
 *
 * They also produced duplicate content — four URLs serving the same results
 * under the same title — so dropping them is an SEO improvement, not a loss.
 *
 * To verify after any edit here:
 *   curl ".../api/search/page-data?slug=shiraz&tags=<key>"
 * A known tag comes back with a non-null `tag` and a reduced `count`.
 */
export const residences_types = {
  villa: "خانه ویلایی",
  apartment: "آپارتمان",
  hotelapartment: "هتل آپارتمان",
  boomgardi: "بوم گردی",
  guesthouse: "مهمان خانه",
  cottage: "کلبه",
};
