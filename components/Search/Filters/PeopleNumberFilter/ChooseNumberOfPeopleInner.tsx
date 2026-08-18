import Counter from "@/components/General/Counter";
import { Dispatch, SetStateAction } from "react";

function ChooseNumberOfPeopleInner({
  numberOfPeople,
  setNumberOfPeople,
}: {
  numberOfPeople: number;
  setNumberOfPeople: Dispatch<SetStateAction<number>>;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-x-8">
        <i className="icon-Profile text-24" />
        <div>
          <p className="text-12 leading-16 font-l text-gray-959FA7">تعداد نفرات</p>
          <p className="text-16 leading-24 font-r text-black mt-8">{numberOfPeople} نفر</p>
        </div>
      </div>

      <div className="w-[107px]">
        <Counter
          inputName={`choose-number-of-people-filter`}
          counterMinimum={0}
          customValue={numberOfPeople}
          onInc={() => setNumberOfPeople((prev) => prev + 1)}
          onDec={() => setNumberOfPeople((prev) => prev - 1)}
        />
      </div>
    </div>
  );
}

export default ChooseNumberOfPeopleInner;
