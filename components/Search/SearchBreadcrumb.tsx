import Link from "next/link";

export interface Crumb {
  name: string;
  href?: string;
}

/**
 * The visible breadcrumb.
 *
 * The page already emitted `BreadcrumbList` structured data, but nothing in the
 * document said the same thing — and Google treats the markup as a description
 * of a trail that is supposed to exist on the page. This is that trail, and it
 * also gives a reader arriving from search a way back up to the province or the
 * country listing.
 */
function SearchBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const items = (crumbs || []).filter((c) => !!c?.name);
  if (items.length < 2) return null;

  return (
    <nav aria-label="مسیر صفحه" className="CustomContainer2">
      <ol className="flex flex-wrap items-center gap-x-6 gap-y-4 text-12 leading-20 font-r text-gray-6C6A7D">
        {items.map((crumb, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${crumb.name}-${i}`} className="flex items-center gap-x-6">
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  prefetch={false}
                  className="hover:text-primary-main hover:underline"
                >
                  {crumb.name}
                </Link>
              ) : (
                // The last crumb is the current page: a link to where you
                // already are is noise for everyone and a trap for a crawler.
                <span aria-current={isLast ? "page" : undefined} className="text-black">
                  {crumb.name}
                </span>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-gray-B0AFBC">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default SearchBreadcrumb;
