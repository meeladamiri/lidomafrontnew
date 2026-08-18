import BeautifulFAQs from "../General/FAQ/BeautifulFAQs";

function SearchPageFAQ({
  faqs,
}: {
  faqs: {
    answer: string;
    question: string;
    id: number;
  }[];
}) {
  return (
    <>
      <h3 className="text-16 leading-28 text-black font-m mb-16">سوالات متداول</h3>

      <BeautifulFAQs faqs={faqs} />
    </>
  );
}

export default SearchPageFAQ;
