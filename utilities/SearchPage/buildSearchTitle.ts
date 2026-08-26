/**
 * The listing count and starting price, put where searchers see them.
 *
 * Both jajiga and jabama lead their search titles with the number of listings
 * and the price they start from — "۸۱۸ واحد از ۶۰۰ هزار تومان", "۱۱۷۴ سوئیت و
 * ویلا از ۴۵۰ هزار تومان". It is a live number that answers the searcher's
 * question in the result itself, and it refreshes as the inventory changes.
 * Our titles carried "تضمین امنیت و نظافت" in that slot — true, but the same
 * sentence on every page and nothing a searcher is deciding on.
 *
 * The count is the unfiltered figure for the page's own canonical, so the title
 * does not change with a date or guest filter.
 */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Latin digits to Persian, with the Persian thousands separator.
 *
 * `toLocaleString("en-US")` leaves a Latin comma behind, so a four-digit count
 * came out as "۳,۰۳۱" — Persian digits with a foreign separator. U+066C is the
 * one that belongs with them.
 */
export function faNumber(value: number): string {
  return Math.round(value)
    .toLocaleString("en-US")
    .replace(/\d/g, (d) => FA_DIGITS[Number(d)])
    .replace(/,/g, "٬");
}

/**
 * A price short enough for a title: "۵۹۰ هزار تومان", "۱.۲ میلیون تومان".
 * Returns null when there is no credible price to show.
 */
export function shortPrice(price: number | null | undefined): string | null {
  if (!price || price < 1000) return null;

  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    // One decimal, but only when it says something: 1.2 million, not 2.0.
    const text =
      millions >= 10 || Number.isInteger(millions)
        ? faNumber(Math.round(millions))
        : faNumber(Math.floor(millions)) + "٫" + faNumber(Math.round((millions % 1) * 10));
    return `${text} میلیون تومان`;
  }

  return `${faNumber(Math.round(price / 1000))} هزار تومان`;
}

/** "۳۴۶ اقامتگاه از ۱۵۹ هزار تومان" — or just the count when no price. */
export function countAndPricePhrase(
  count: number | null | undefined,
  minPrice: number | null | undefined,
  unit = "اقامتگاه"
): string | null {
  if (!count || count < 1) return null;
  const price = shortPrice(minPrice);
  return price ? `${faNumber(count)} ${unit} از ${price}` : `${faNumber(count)} ${unit}`;
}

/**
 * Puts the phrase into the CMS title in place of its middle segment.
 *
 * Editors' titles are pipe-separated — "<subject> | <claim> | <brand>" — and
 * the claim is the slot worth trading. When a title has no middle segment the
 * phrase is inserted before the brand instead, and when there is nothing to say
 * the title is returned untouched.
 */
export function withCountInTitle(title: string | null | undefined, phrase: string | null): string {
  const base = (title ?? "").trim();
  if (!base || !phrase) return base;

  const parts = base
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return base;

  if (parts.length >= 3) {
    // Replace the claim, keep subject and brand.
    return [parts[0], phrase, ...parts.slice(2)].join(" | ");
  }
  if (parts.length === 2) {
    // Subject + brand: slot the phrase between them.
    return [parts[0], phrase, parts[1]].join(" | ");
  }
  return `${parts[0]} | ${phrase}`;
}
