import { Dispatch, SetStateAction } from "react";
import Counter from "../General/Counter";

function SelectNumberOfPeople({
  numberOfPeople,
  setNumberOfPeople,
  wrapperClassname,
}: // onSubmit,
{
  numberOfPeople: number;
  setNumberOfPeople: Dispatch<SetStateAction<number>>;
  wrapperClassname?: string;
  // onSubmit: (realNumberOfPeople: number) => void;
}) {
  // const [localNumberOfPeople, setLocalNumberOfPeople] = useState<number>(numberOfPeople);

  return (
    <div
      className={`bg-white rounded-full shadow-[0px_8px_32px_rgba(24,39,58,0.15)] ${wrapperClassname}`}
    >
      <div className="pr-24 pl-18 py-18 flex items-center justify-between">
        <div className="flex items-center gap-x-8">
          {/* <i className="icon-Profile text-24 text-black" /> */}

          <div className="">
            <p className="text-16 leading-24 font-r text-black">تعداد نفرات</p>

            {/* <p className="text-16 leading-24 font-r text-black mt-8">{numberOfPeople} نفر</p> */}
          </div>
        </div>

        <div className="w-[107px]">
          <Counter
            inputName={`number-of-people-filter`}
            counterMinimum={0}
            customValue={numberOfPeople}
            onInc={() => setNumberOfPeople((prev) => prev + 1)}
            onDec={() => setNumberOfPeople((prev) => prev - 1)}
          />
        </div>
      </div>

      {/* <div className="mt-16">
        <Button
          isFullWidth
          onClick={() => {
            onSubmit(localNumberOfPeople);
          }}
        >
          ثبت تعداد نفرات
        </Button>
      </div> */}
    </div>
  );
}

export default SelectNumberOfPeople;
