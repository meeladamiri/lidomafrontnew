import { Button } from "@/components/General/core/Button";
import ChooseNumberOfPeopleInner from "./ChooseNumberOfPeopleInner";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { removeSomeQueryParameters_Then_AddSomeQueryParameters } from "@/utilities/URL/removeSomeQueryParameters_Then_AddSomeQueryParameters";

function ChooseNumberOfPeopleFloatingBox({
  setShowChooseNumberOfPeopleFloatingBox,
  peopleNumberFilterWrapperRef,
}: {
  setShowChooseNumberOfPeopleFloatingBox: Dispatch<SetStateAction<boolean>>;
  peopleNumberFilterWrapperRef: any;
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
      ["guests_count", "page"],
      [["guests_count", tmpNumberOfPeople]]
    );
  }

  return (
    <OutsideClickHandler
      handleClick={() => setShowChooseNumberOfPeopleFloatingBox(false)}
      exceptionElementsRef={[peopleNumberFilterWrapperRef]}
    >
      <div className="shadow-[0px_8px_32px_rgba(24,39,58,0.15)] bg-white rounded-16 p-24 w-[380px] absolute top-42 right-0">
        <div className="border-1 border-solid border-gray-CACFD3 rounded-8 px-16 py-10">
          <ChooseNumberOfPeopleInner
            numberOfPeople={tmpNumberOfPeople}
            setNumberOfPeople={setTmpNumberOfPeople}
          />
        </div>

        <Button
          isFullWidth
          className="mt-16"
          onClick={() => {
            if (tmpNumberOfPeople !== 0) {
              applyNumberOfPeopleFilterToURL();
              setShowChooseNumberOfPeopleFloatingBox(false);
            }
          }}
        >
          ثبت تعداد نفرات
        </Button>
      </div>
    </OutsideClickHandler>
  );
}

export default ChooseNumberOfPeopleFloatingBox;
