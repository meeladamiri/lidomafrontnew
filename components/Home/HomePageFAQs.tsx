import BeautifulFAQs from "../General/FAQ/BeautifulFAQs";

function HomePageFAQs({
  faqs,
}: {
  faqs: {
    answer: string;
    question: string;
    id: number;
  }[];
}) {
  return (
    <section className="mb-24 md:mb-40 CustomContainer">
      <div className="text-16 leading-28 font-m text-black">سوالات متداول</div>

      <BeautifulFAQs faqs={faqs} />
    </section>
  );
}

export default HomePageFAQs;
