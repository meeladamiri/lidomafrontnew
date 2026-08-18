import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import ChooseNumberOfPeopleInner from "./ChooseNumberOfPeopleInner";
import { Button } from "@/components/General/core/Button";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";

function ChooseNumberOfPeopleBottomSheet({
  handleSmoothClose,
}: {
  handleSmoothClose: THandleSmoothClose;
}) {
  const router = useRouter();
  const [tmpNumberOfPeople, setTmpNumberOfPeople] = useState<number>(0);

  useEffect(() => {
    if (!!router?.query && !!router?.query?.guests_count) {
      setTmpNumberOfPeople(Number(router?.query?.guests_count as string));
    }
  }, [router?.query]);

  function applyNumberOfPeopleFilterToURL() {
    // remove possible previous 'guests_count' param from url, then add the new one.
    removeSomeQueryParameters_Then_AddSomeQueryParameters(
      router,
      ["guests_count"],
      [["guests_count", tmpNumberOfPeople]]
    );
  }

  return (
    <div>
      <ChooseNumberOfPeopleInner
        numberOfPeople={tmpNumberOfPeople}
        setNumberOfPeople={setTmpNumberOfPeople}
      />

      <div className="border-1 border-dashed border-gray-CACFD3 rounded-12 py-12 px-4 text-center mt-16 text-12 leading-16 text-black font-r">
        هزینه اقامت یک کودک زیر 5 سال رایگان است
      </div>
      <div className="grid grid-cols-6 gap-x-12 mt-24">
        <div className="col-span-2">
          <Button
            disabled={!tmpNumberOfPeople}
            onClick={() => {
              setTmpNumberOfPeople(0);
            }}
            color="grey"
            isFullWidth
          >
            حذف فیلتر
          </Button>
        </div>
        <div className="col-span-4">
          <Button
            isFullWidth
            onClick={() => {
              if (tmpNumberOfPeople !== 0) {
                applyNumberOfPeopleFilterToURL();
                handleSmoothClose();
              }
            }}
          >
            مشاهده نتایج
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ChooseNumberOfPeopleBottomSheet;
