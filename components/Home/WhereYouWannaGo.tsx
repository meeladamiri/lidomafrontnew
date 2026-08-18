import { useState } from "react";
import WhereYouWannaGoSearchBox from "../Search/WhereYouWannaGoSearchBox";
import WhereYouWannaGoModals from "../Search/WhereYouWannaGoSearchBox/WhereYouWannaGoModals";
import { useRouter } from "next/router";

function WhereYouWannaGo() {
  const router = useRouter();
  const [showWhereYouWannaGoModal, setShowWhereYouWannaGoModal] = useState<boolean>(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState<boolean>(false);

  return (
    <>
      <div
        className={`fixed z-[2] top-[55px] right-0 left-0 bg-white bg-opacity-95 backdrop-blur-xl px-20 py-10 duration-100 ease-out ${
          router.pathname === "/" ? "hidden" : "block"
        }`}
        id="whereYouWannaGoWrapper-HomePage"
      >
        <WhereYouWannaGoSearchBox setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal} />
      </div>

      <WhereYouWannaGoModals
        setShowCitiesListModal={setShowCitiesListModal}
        setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
        showCitiesListModal={showCitiesListModal}
        showWhereYouWannaGoModal={showWhereYouWannaGoModal}
      />
    </>
  );
}

export default WhereYouWannaGo;
