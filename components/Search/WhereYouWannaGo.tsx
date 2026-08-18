import { Dispatch, SetStateAction } from "react";
import WhereYouWannaGoSearchBox from "./WhereYouWannaGoSearchBox";

function WhereYouWannaGo({
  setShowWhereYouWannaGoModal,
}: {
  setShowWhereYouWannaGoModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className="py-12 transition-all duration-200 ease-in-out"
      id="#whereYouWannaGoWrapper-SearchPage"
    >
      <WhereYouWannaGoSearchBox setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal} />
    </div>
  );
}

export default WhereYouWannaGo;
