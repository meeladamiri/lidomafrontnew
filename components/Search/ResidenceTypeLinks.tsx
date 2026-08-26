import Link from "next/link";
import { useRouter } from "next/router";
import { residences_types } from "@/constants/search/residences_types";

/**
 * Residence type as real links.
 *
 * The filter bar above is a set of popups: the URLs it produces exist only
 * inside click handlers, so nothing discovers them and nobody can open one in a
 * new tab. Residence type is the filter worth indexing — `?villa=1`,
 * `?boomgardi=1` and friends are the pages people actually search for — so it
 * also gets a plain row of `<a href>` that is in the server HTML, works without
 * JavaScript, and gives a crawler somewhere to go.
 *
 * The popup keeps the multi-select interaction; this is the crawlable path to
 * the same URLs, not a replacement for it.
 */
function ResidenceTypeLinks() {
  const router = useRouter();
  const citySlug = router.query?.id ? `/${router.query.id}` : "";

  const hrefFor = (typeKey: string) => {
    const params = new URLSearchParams();
    Object.entries(router.query || {}).forEach(([key, value]) => {
      // Drop the other type keys: these are alternatives, not a stack.
      if (key === "id" || key === "page" || key in residences_types) return;
      if (value === undefined) return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    params.set(typeKey, "1");
    const qs = params.toString();
    return `/search${citySlug}${qs ? `?${qs}` : ""}`;
  };

  const clearHref = () => {
    const params = new URLSearchParams();
    Object.entries(router.query || {}).forEach(([key, value]) => {
      if (key === "id" || key === "page" || key in residences_types) return;
      if (value === undefined) return;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    const qs = params.toString();
    return `/search${citySlug}${qs ? `?${qs}` : ""}`;
  };

  const activeKey = Object.keys(residences_types).find((key) => !!router.query?.[key]);

  return (
    <nav aria-label="نوع اقامتگاه" className="mb-16 md:mb-20">
      <ul className="hideScrollbar flex items-center gap-x-8 overflow-x-auto md:flex-wrap md:gap-y-8 md:overflow-x-visible">
        <li className="shrink-0">
          <Link
            href={clearHref()}
            prefetch={false}
            aria-current={!activeKey ? "true" : undefined}
            className={`inline-flex h-32 items-center rounded-50 border-1 border-solid px-12 text-12 leading-16 font-m transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main ${
              !activeKey
                ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%] text-black"
                : "border-gray-CACFD3 text-gray-6C6A7D hover:border-primary-main"
            }`}
          >
            همه
          </Link>
        </li>

        {Object.entries(residences_types).map(([key, label]) => {
          const isActive = key === activeKey;
          return (
            <li key={key} className="shrink-0">
              <Link
                href={isActive ? clearHref() : hrefFor(key)}
                prefetch={false}
                aria-current={isActive ? "true" : undefined}
                aria-label={isActive ? `حذف فیلتر ${label}` : `اقامتگاه‌های ${label}`}
                className={`inline-flex h-32 items-center rounded-50 border-1 border-solid px-12 text-12 leading-16 font-m transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main ${
                  isActive
                    ? "border-primary-main border-opacity-[50%] bg-primary-main bg-opacity-[3%] text-black"
                    : "border-gray-CACFD3 text-gray-6C6A7D hover:border-primary-main"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default ResidenceTypeLinks;
