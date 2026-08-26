import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
const CloseBtn = dynamic(() => import("@/components/General/CloseBtn"), {
  ssr: true,
});

/**
 * One filter chip on the search bar.
 *
 * This is an `<a href>`, not a `div` with an `onClick`. These filters are the
 * SEO-valuable ones — residence type, amenities — and a URL that only exists
 * inside a click handler is a URL no crawler will ever find and no one can
 * open in a new tab, bookmark or share. The click handler still runs for a
 * shallow client-side update; the href is what makes the page discoverable.
 */
function SeparateFilter({
  paramKey,
  filterName,
  filterIcon,
  paramValue,
}: {
  paramKey: string;
  filterName: string;
  filterIcon: ReactNode;
  paramValue: string | number | boolean;
}) {
  const router = useRouter();
  const isActive = !!router?.query?.[paramKey];

  /** The current URL with this filter added. */
  const hrefWithFilter = () => {
    const params = new URLSearchParams();
    Object.entries(router.query || {}).forEach(([key, value]) => {
      if (key === "id" || value === undefined) return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    params.set(paramKey, String(paramValue));
    // Adding a filter always returns to the first page of the new result set.
    params.delete("page");

    const base = `/search${router.query?.id ? `/${router.query.id}` : ""}`;
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const chipClass = `
    px-8 h-32
    border-1 border-solid
    rounded-50 flex items-center
    ${
      isActive
        ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%]"
        : "border-gray-CACFD3"
    }
  `;

  const label = (
    <span className="flex items-center gap-x-6 pl-8">
      {filterIcon}
      <span className="text-12 leading-16 font-m text-black">{filterName}</span>
    </span>
  );

  return (
    <div className="relative shrink-0">
      {isActive ? (
        <div className={chipClass}>
          {/* Applied. `aria-current` is what tells a screen reader that, rather
              than the chip's colour. */}
          <span aria-current="true">{label}</span>
          <CloseBtn
            aria-label={`حذف فیلتر ${filterName}`}
            onClose={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              removeQueryParameters(router, [{ paramKey }]);
            }}
          />
        </div>
      ) : (
        <Link
          href={hrefWithFilter()}
          prefetch={false}
          aria-label={`فیلتر ${filterName}`}
          className={`${chipClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main`}
          onClick={(e) => {
            // Shallow client-side update; the href above is the crawlable and
            // no-JS path to exactly the same place.
            e.preventDefault();
            router.push(hrefWithFilter(), undefined, { shallow: true });
          }}
        >
          {label}
        </Link>
      )}
    </div>
  );
}

export default SeparateFilter;
