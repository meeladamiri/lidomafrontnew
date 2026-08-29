import BeautifulFAQs from "../General/FAQ/BeautifulFAQs";

/**
 * `<h2>`, not `<h3>`.
 *
 * This block sits at the same level as "جستجوهای مرتبط" and the city guide,
 * both of which are h2 — but it was marked up a level below them while the
 * guide's own sub-sections were marked up level with them. The outline said
 * the opposite of the layout.
 */
function SearchPageFAQ({
  faqs,
  placeName,
}: {
  faqs: {
    answer: string;
    question: string;
    id: number;
  }[];
  /** Names the page the questions are about, when there is a place. */
  placeName?: string | null;
}) {
  return (
    <>
      <h2 className="text-16 leading-28 text-black font-m mb-16">
        {placeName ? `سوالات متداول اجاره اقامتگاه در ${placeName}` : "سوالات متداول"}
      </h2>

      <BeautifulFAQs faqs={faqs} />
    </>
  );
}

export default SearchPageFAQ;
