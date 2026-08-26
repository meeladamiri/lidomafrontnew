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
    <section className="CustomContainer mb-24 md:mb-32" aria-label="جستجوهای پیشنهادی">
      <nav className="flex items-center gap-x-8 gap-y-8 flex-wrap">
        <span className="text-13 leading-22 font-m text-gray-57585C shrink-0">پیشنهاد ما:</span>
        {suggestions.map((s) => (
          <Link
            key={s.id}
            prefetch={false}
            // The panel accepts links with or without a leading slash; a chip
            // linking to "search/shiraz" would otherwise resolve relative to
            // whatever page it is rendered on.
            href={s.href.startsWith("/") || /^https?:\/\//.test(s.href) ? s.href : `/${s.href}`}
            className="px-14 py-8 rounded-full border border-gray-CACFD3 text-13 leading-20 font-r text-black hover:border-primary-main"
          >
            {s.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}

export default SearchSuggestions;
