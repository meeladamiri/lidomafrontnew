import BeautifulFAQs from "@/components/General/FAQ/BeautifulFAQs";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";

function ResFAQs() {
  const { data } = useGetObserveResidence();
  const resp: IObserveResidenceData = data?.params;

  if (resp.faqs.length === 0) return null;

  return (
    <>
      <div className="pb-24">
        <h4 className="text-16 leading-28 text-zilgara font-m mb-24">سوالات متداول</h4>

        <BeautifulFAQs faqs={resp.faqs} />
      </div>
    </>
  );
}

export default ResFAQs;
