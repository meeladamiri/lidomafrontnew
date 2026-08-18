import { ITag } from "@/interfaces/observe_residence";
import Link from "next/link";
import { BASE_URL } from "@/configs/info";

function RelatedSearches({
  tags,
  relatedSearchWrapperClassname,
}: {
  tags: ITag[];
  relatedSearchWrapperClassname?: string;
}) {
  return (
    <div className="CustomContainer2">
      <header>
        <h2 className="text-16 leading-22 font-r text-black">جستجوهای مرتبط</h2>
      </header>
      <nav className="flex items-center gap-12 mt-16 flex-wrap">
        {tags?.map((t) => (
          <Link
            key={t?.tag}
            passHref
            href={`${BASE_URL}${t?.cat_title ? `/search/${t?.cat_title}` : ""}${
              t?.tag ? `?${t?.tag}=1` : ""
            }`}
            prefetch={false}
            className={`bg-white rounded-10 p-12 flex items-center justify-between group ${
              relatedSearchWrapperClassname || ""
            }`}
          >
            <p>{t?.title}</p>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default RelatedSearches;
