import { Dispatch, SetStateAction } from "react";
import WhereYouWannaGoTextField from "./WhereYouWannaGoTextField";
import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";

function WhereYouWannaGoSearchBox({
  setShowWhereYouWannaGoModal,
  placeholderText,
}: {
  setShowWhereYouWannaGoModal: Dispatch<SetStateAction<boolean>>;
  placeholderText?: string;
}) {
  return (
    <>
      <div
        className=""
        id="whereYouWannaGoTextFieldWrapper-HomePage"
        onClick={() => setShowWhereYouWannaGoModal(true)}
      >
        <WhereYouWannaGoTextField
          placeholderText={placeholderText}
          value={useGetPersianCityname()}
          readonly={true}
        />
      </div>
    </>
  );
}

export default WhereYouWannaGoSearchBox;
