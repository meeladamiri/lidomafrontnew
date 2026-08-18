import Counter from "@/components/General/Counter";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
import dynamic from "next/dynamic";
import { Dispatch, SetStateAction } from "react";
const YouHaveNotEnteredNOfPeopleYet = dynamic(
  () => import("@/components/General/YouHaveNotEnteredNOfPeopleYet"),
  {
    ssr: true,
  }
);

function BoomgardiBillCounter({
  showNumberOfPeopleAlert,
  setShowNumberOfPeopleAlert,
}: {
  showNumberOfPeopleAlert?: boolean;
  setShowNumberOfPeopleAlert?: Dispatch<SetStateAction<boolean>>;
}) {
  const { numberOfPeople, setNumberOfPeople, selectedRoomByUser } = useBoomgardiPropertyPageData();
  const base_capacity = selectedRoomByUser?.capacity as number;

  return (
    <div className="relative mt-8 px-16 py-10 border-1 border-solid border-gray-CACFD3 rounded-8 flex items-center justify-between">
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
          counterMaximum={selectedRoomByUser?.max_capacity}
          customValue={numberOfPeople}
          onInc={() => {
            setNumberOfPeople((prev) => prev + 1);
            if (!!setShowNumberOfPeopleAlert) {
              setShowNumberOfPeopleAlert(false);
            }
          }}
          onDec={() => {
            setNumberOfPeople((prev) => prev - 1);
            if (!!setShowNumberOfPeopleAlert) {
              setShowNumberOfPeopleAlert(false);
            }
          }}
        />
      </div>

      {!!showNumberOfPeopleAlert && (
        <div className="absolute left-0 top-0 z-1 -translate-y-full">
          <YouHaveNotEnteredNOfPeopleYet />
        </div>
      )}
    </div>
  );
}

export default BoomgardiBillCounter;
