import Link from "next/link";

export interface Crumb {
  name: string;
  href?: string;
}

/**
 * The visible breadcrumb, at the foot of a search page.
 *
 * The page already emitted `BreadcrumbList` structured data, but nothing in the
 * document said the same thing — and Google treats the markup as a description
 * of a trail that is supposed to exist on the page. This is that trail, and it
 * also gives a reader arriving from search a way back up to the province or the
 * country listing.
 *
 * The chevron points right-to-left. A `›` borrowed from an LTR breadcrumb
 * points back at where the reader came from, which is the wrong way round here.
 */
function SearchBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const items = (crumbs || []).filter((c) => !!c?.name);
  if (items.length < 2) return null;

  return (
    <nav
      aria-label="مسیر صفحه"
      // No card around it. The border and white fill made a small pill that
      // read as a control rather than as a trail, and drew more attention than
      // the thing it describes.
      //
      // The negative margin cancels the first link's own padding, so the trail
      // starts on the same vertical line as the headings above it instead of
      // ten pixels inside them.
      className="-mr-10 inline-flex max-w-full"
    >
      <ol className="flex flex-wrap items-center gap-y-4">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          const isFirst = i === 0;

          return (
            <li key={`${crumb.name}-${i}`} className="flex items-center">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  prefetch={false}
                  // 28px was a tight target for a thumb; the desktop row stays
                  // compact.
                  className="group inline-flex min-h-[40px] items-center gap-x-6 rounded-8 px-10 py-4 text-13 leading-20 font-r text-gray-6C6A7D transition-colors hover:bg-gray-F5F5F7 hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main md:min-h-[30px]"
                >
                  {isFirst && (
                    <i
                      aria-hidden="true"
                      className="icon-Home text-16 text-gray-B0AFBC transition-colors group-hover:text-primary-main"
                    />
                  )}
                  {crumb.name}
                </Link>
              ) : (
                // The last crumb is the current page: a link to where you
                // already are is noise for everyone and a trap for a crawler.
                <span
                  aria-current="page"
                  className="inline-flex min-h-[40px] items-center rounded-8 bg-primary-main bg-opacity-[6%] px-12 py-4 text-13 leading-20 font-m text-black md:min-h-[30px]"
                >
                  {crumb.name}
                </span>
              )}

              {!isLast && (
                <i aria-hidden="true" className="icon-FlashLeft mx-2 text-16 text-gray-CACFD3" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default SearchBreadcrumb;
