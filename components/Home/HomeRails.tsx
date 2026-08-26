import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

const ManuallySwippableSlider = dynamic(
  () => import("components/General/Sliders/ManuallySwippableSlider"),
  { ssr: true }
);
const TypicalResidenceCartForSwippableSlider = dynamic(
  () => import("./TypicalResidenceCartForSwippableSlider"),
  { ssr: true }
);

export interface HomeRail {
  id: number;
  kind: "RESIDENCE" | "DESTINATION";
  title: string | null;
  subtitle: string | null;
  heading_level: number;
  link_to: string | null;
  items: {
    id: number;
    title: string;
    subtitle: string | null;
    image: string | null;
    alt: string | null;
    link: string | null;
  }[];
  residences: any[];
}

/**
 * The home page's sliders, as configured in the admin panel.
 *
 * These used to be three hardcoded `ManuallySwippableSliderComp` calls whose
 * contents came from queries baked into home.service.ts — an editor could
 * rename "ویلاهای شمال" but not point it at a different city, and adding a
 * fourth rail meant a deploy.
 *
 * A RESIDENCE rail is filled by the backend from its source (city, tag, type
 * or flag) in `Residence.importance` order. A DESTINATION rail carries its own
 * tiles, each with its own image and link.
 */
function HomeRails({ rails }: { rails: HomeRail[] }) {
  if (!rails?.length) return null;

  return (
    <>
      {rails.map((rail) =>
        rail.kind === "DESTINATION" ? (
          <DestinationRail key={rail.id} rail={rail} />
        ) : (
          <ResidenceRail key={rail.id} rail={rail} />
        )
      )}
    </>
  );
}

function ResidenceRail({ rail }: { rail: HomeRail }) {
  // An empty rail renders nothing rather than an empty heading — a heading with
  // no content underneath is a dead signal for a crawler.
  if (!rail.residences?.length) return null;

  return (
    <section className="mb-24 md:mb-40 CustomContainer">
      <ManuallySwippableSlider
        title={rail.title || undefined}
        headingLevel={rail.heading_level}
        seeAllItemsLink={rail.link_to || undefined}
        data={rail.residences.map((item, i) => (
          <div className="w-[310px] shrink-0" key={item.id ?? i}>
            <TypicalResidenceCartForSwippableSlider
              name={item.name}
              provice={item.province}
              proviceId={item.province_id}
              cityId={item.city_id}
              city={item.city}
              neighborhood={item.neighborhood}
              rating={item.average_rating}
              commentsN={item.reviews_count}
              price={item.min_price}
              bedN={item.rooms_count}
              referenceCode={item.reference}
              maxCapacity={item.max_capacity}
              image={item.main_image}
              residenceId={item.id}
              isFastEnabled={item.is_fast}
              discountP={item.discount}
              isLastMomentForToday={!!item.is_offer}
              displayType={item.display_type}
              resPureNameAlone={item.name2}
              isFull={item.is_full}
            />
          </div>
        ))}
      />
    </section>
  );
}

function DestinationRail({ rail }: { rail: HomeRail }) {
  if (!rail.items?.length) return null;

  return (
    <section className="mb-24 md:mb-40 CustomContainer">
      <ManuallySwippableSlider
        title={rail.title || undefined}
        headingLevel={rail.heading_level}
        seeAllItemsLink={rail.link_to || undefined}
        data={rail.items.map((item) => (
          <div className="w-[220px] shrink-0" key={item.id}>
            <Link
              prefetch={false}
              href={item.link || "/search"}
              className="block w-full h-[280px] relative rounded-16 overflow-hidden p-14"
            >
              <div className="absolute inset-0 z-1 bg-gradient-to-t from-black bg-opacity-80 via-transparent to-transparent" />
              {item.image ? (
                <Image
                  src={item.image}
                  width={220}
                  height={280}
                  alt={item.alt || item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-F5F5F5" />
              )}
              <div className="absolute z-1 bottom-8">
                {/* One level below the rail's own heading. */}
                <h3 className="text-19 leading-26 font-m text-white mb-8">{item.title}</h3>
                {!!item.subtitle && (
                  <p className="text-13 leading-16 font-r text-white">{item.subtitle}</p>
                )}
              </div>
            </Link>
          </div>
        ))}
      />
    </section>
  );
}

export default HomeRails;
