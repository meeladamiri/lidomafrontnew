import { ITag } from "@/interfaces/observe_residence";
import Link from "next/link";

/**
 * The tag links under the results.
 *
 * The chips carried no type styling at all — a bare `<p>` inheriting whatever
 * the section happened to set — and no hover or focus state, so on a grey
 * background they read as flat white boxes rather than links. The backend now
 * only sends tags that have listings in this place, so every one of these
 * leads somewhere real.
 */
function RelatedSearches({
  tags,
  relatedSearchWrapperClassname,
}: {
  tags: ITag[];
  relatedSearchWrapperClassname?: string;
}) {
  if (!tags?.length) return null;

  return (
    <div className="CustomContainer2">
      <header>
        <h2 className="text-16 leading-24 text-black font-m">جستجوهای مرتبط</h2>
      </header>
      <nav aria-label="جستجوهای مرتبط" className="flex items-center gap-8 mt-16 flex-wrap">
        {tags.map((t) => (
          <Link
            key={t?.tag}
            passHref
            href={`${t?.cat_title ? `/search/${t?.cat_title}` : "/search"}${
              t?.tag ? `?${t?.tag}=1` : ""
            }`}
            prefetch={false}
            className={`bg-white border-1 border-solid border-gray-E5E5E6 rounded-10 px-12 py-10
              flex items-center gap-x-6
              text-13 leading-20 font-r text-gray-263341
              transition-colors hover:border-primary-main hover:text-primary-main
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main
              ${relatedSearchWrapperClassname || ""}`}
          >
            <i aria-hidden="true" className="icon-Search text-14 text-gray-959FA7" />
            <span>{t?.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default RelatedSearches;
