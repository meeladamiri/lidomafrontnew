import Counter from "@/components/General/Counter";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import { useSuitPropertyPageData } from "@/providers/SuitPropertyPage";
import { removeQueryParametersWithoutScrolling } from "@/utilities/URL/removeQueryParametersWithoutScrolling";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { useRouter } from "next/router";

function SuitBillCounter() {
  const router = useRouter();
  const { numberOfPeople, setNumberOfPeople } = useSuitPropertyPageData();
  const { data } = useGetObserveResidence();

  const resp: IObserveResidenceData = data?.params;
  const max_capacity = resp?.residence_info?.max_capacity;
  const base_capacity = resp?.residence_info?.capacity;

  return (
    <div className="mt-8 px-16 py-10 border-1 border-solid border-gray-CACFD3 rounded-8 flex items-center justify-between">
      <div className="flex items-center gap-x-8">
        <i className="icon-Profile text-24 text-black" />

        <div>
          <p className="text-12 leading-16 text-gray-959FA7 font-l mb-8">تعداد نفرات</p>
          <p className="text-16 leading-24 text-black font-r flex items-center gap-x-4">
            <span>{numberOfPeople > base_capacity ? base_capacity : numberOfPeople} نفر</span>
            {numberOfPeople > base_capacity && (
              <span className="text-12">+ {numberOfPeople - base_capacity} نفر اضافه</span>
            )}
          </p>
        </div>
      </div>

      <div className="w-[107px]">
        <Counter
          inputName={`number-of-people`}
          counterMinimum={0}
          counterMaximum={max_capacity}
          customValue={numberOfPeople}
          onInc={() => {
            removeQueryParametersWithoutScrolling(router, [{ paramKey: "guests_count" }]);
            setNumberOfPeople((prev) => prev + 1);
          }}
          onDec={() => {
            removeQueryParametersWithoutScrolling(router, [{ paramKey: "guests_count" }]);
            setNumberOfPeople((prev) => prev - 1);
          }}
        />
      </div>
    </div>
  );
}

export default SuitBillCounter;
