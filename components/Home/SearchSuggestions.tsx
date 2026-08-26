import Link from "next/link";

export interface SearchSuggestion {
  id: number;
  label: string;
  href: string;
}

/**
 * The chips under the search box ("پیشنهادهای سرچ‌باکس" in the panel).
 *
 * These sit directly under the hero, above every other section, because they
 * are the shortest path from landing to a search result — and because they are
 * internal links to the high-intent SEO pages, so putting them first also puts
 * them early in the crawl order.
 */
function SearchSuggestions({ suggestions }: { suggestions: SearchSuggestion[] }) {
  if (!suggestions?.length) return null;

  return (
    <nav
      aria-label="جستجوهای پیشنهادی"
      className="CustomContainer mt-16 flex flex-wrap items-center gap-8 md:mt-20"
    >
      <span className="shrink-0 font-m text-13 leading-22 text-gray-57585C">پیشنهاد ما:</span>
      {suggestions.map((s) => (
        <Link
          key={s.id}
          prefetch={false}
          // The panel accepts links with or without a leading slash; a chip
          // linking to "search/shiraz" would otherwise resolve relative to
          // whatever page it is rendered on.
          href={s.href.startsWith("/") || /^https?:\/\//.test(s.href) ? s.href : `/${s.href}`}
          // min-h keeps the chip at a comfortable tap target; the padding alone
          // left it at 38px, under the 44px minimum.
          className="inline-flex min-h-[44px] items-center rounded-full border border-gray-CACFD3 bg-white px-16 font-r text-13 leading-20 text-black transition-colors hover:border-primary-main hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2 md:min-h-[38px]"
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export default SearchSuggestions;
