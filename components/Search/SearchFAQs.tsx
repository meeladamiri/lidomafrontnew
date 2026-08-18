import BeautifulFAQs from "../General/FAQ/BeautifulFAQs";
export interface ISearchFAQs {
  id: number;
  answer: string;
  question: string;
}
function SearchFAQs({ faqs }: { faqs: ISearchFAQs[] }) {
  return (
    <div className="mt-24">
      <h6 className="text-16 leading-28 text-black font-m mb-16">سوالات متداول</h6>

      <BeautifulFAQs faqs={faqs} />
    </div>
  );
}
export default SearchFAQs;
