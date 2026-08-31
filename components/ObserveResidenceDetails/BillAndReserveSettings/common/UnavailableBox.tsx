import { useRouter } from "next/router";
import { LinkButton } from "@/components/General/core/Button";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { IObserveResidenceData } from "@/interfaces/observe_residence";

/**
 * What sits where the booking box normally sits, when a listing is deactivated.
 *
 * The page around it is unchanged — photos, description, amenities, rules,
 * reviews, map — because the listing's page is what people arrive on from
 * Google and from their own bookmarks, and deleting it to say "unavailable"
 * throws away years of that. Only the one thing that would now fail is
 * replaced.
 *
 * It is deliberately not an error and not a 404. Nothing is broken; this
 * residence is simply not taking bookings right now. So the panel reads as a
 * status, and its job is to give the visitor the next step rather than a dead
 * end: the same city's other listings, which is what they came for.
 *
 * It does not show the admin's note. That text is written for the ops team
 * ("میزبان پاسخگو نیست", "اختلاف مالی") and is not something to put in front
 * of a guest. The backend does not send it either — this cannot leak by
 * someone later deciding to render a field that happens to be there.
 */
export default function UnavailableBox({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { data } = useGetObserveResidence();
  const resp: IObserveResidenceData = data?.params;

  const city = resp?.residence_info?.city;
  const cityId = resp?.residence_info?.city_id;
  // Same shape the footer and the breadcrumb use: /search/city/<name>-<id>.
  const searchHref = city && cityId ? `/search/city/${city}-${cityId}` : "/search";

  return (
    <div
      className={`py-24 px-24 rounded-20 border-1 border-solid border-gray-CACFD3 bg-gray-F4F5F6 ${className}`}
    >
      <div className="flex items-center gap-x-10 mb-12">
        <span className="flex items-center justify-center w-40 h-40 rounded-full bg-white shrink-0">
          <i className="icon-Calendar text-22 text-gray-959FA7" />
        </span>
        <div>
          <p className="text-16 leading-24 text-black font-b">فعلاً پذیرای مهمان نیست</p>
          <p className="text-12 leading-20 text-gray-959FA7 font-l mt-2">
            رزرو این اقامتگاه موقتاً بسته است
          </p>
        </div>
      </div>

      <p className="text-14 leading-26 text-gray-6C6A7D font-l">
        این اقامتگاه در حال حاضر برای رزرو در دسترس نیست. اطلاعات، تصاویر و نظرات ثبت‌شده‌اش را
        می‌توانید ببینید، ولی امکان ثبت رزرو روی آن وجود ندارد.
      </p>

      <div className="mt-20">
        <LinkButton href={searchHref} isFullWidth>
          <p>{city ? `اقامتگاه‌های دیگر ${city}` : "جستجوی اقامتگاه"}</p>
        </LinkButton>
      </div>

      <button
        type="button"
        onClick={() => router.push("/contact-us")}
        className="mt-10 w-full text-13 leading-22 text-gray-959FA7 font-l hover:text-black"
      >
        سوالی درباره‌ی این اقامتگاه دارید؟ با پشتیبانی تماس بگیرید
      </button>
    </div>
  );
}
