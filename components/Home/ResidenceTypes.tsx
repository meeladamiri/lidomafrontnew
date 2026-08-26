import Image from "next/image";
import Link from "next/link";

export interface ResidenceTypeTile {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  alt: string | null;
  link: string | null;
  show_in_mobile: boolean;
}

/**
 * "نوع اقامتگاه" — ویلا / سوئیت / بوم‌گردی / هتل.
 *
 * These four came across from Odoo (x_homepage_res_types) with their own
 * images, wording and links, and the panel edits them under
 * «بنر، اسلایدر و باکس‌ها → نوع اقامتگاه». The page was rendering a hardcoded
 * eight-item list instead and the CMS rows were never displayed.
 *
 * `show_in_mobile` is honoured per tile: the hotel tile is desktop-only, which
 * is how the old site had it.
 */
function ResidenceTypes({
  types,
  title,
  headingLevel = 2,
}: {
  types: ResidenceTypeTile[];
  title?: string | null;
  headingLevel?: number;
}) {
  if (!types?.length) return null;

  const Heading = `h${Math.min(Math.max(headingLevel, 2), 4)}` as unknown as "h2";

  return (
    <section className="CustomContainer mb-24 md:mb-40">
      {!!title && (
        <header className="mb-16">
          <Heading className="text-[#000000] text-16 leading-28 font-m">{title}</Heading>
        </header>
      )}

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
        {types.map((t) => (
          <li key={t.id} className={t.show_in_mobile ? "" : "hidden md:block"}>
            <Link
              prefetch={false}
              href={t.link || "/search"}
              className="group block relative h-[160px] md:h-[200px] rounded-16 overflow-hidden"
            >
              {t.image ? (
                <Image
                  src={t.image}
                  width={320}
                  height={200}
                  alt={t.alt || t.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-F5F5F5" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-12 right-12 left-12">
                <h3 className="text-16 md:text-19 leading-26 font-m text-white">{t.title}</h3>
                {!!t.subtitle && (
                  <p className="text-11 md:text-13 leading-18 font-r text-white/90 OnlyOneLineAndEndWithElipsis">
                    {t.subtitle}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default ResidenceTypes;
