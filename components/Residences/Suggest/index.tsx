import {
  IAlternativeResidence,
} from "api/Reserves";
import ModalHeader from "components/General/core/ModalHeader";
import { useRouter } from "next/router";
import { useState } from "react";

function SuggestResidences() {
  const router = useRouter();

  const [selectedResidences, setSelectedResidences] = useState<IAlternativeResidence[]>([]);

  return (
    <div className="relative pt-80">
      <div className="fixed right-0 left-0 top-0 bg-white z-4">
        <ModalHeader headerTitle={"پیشنهاد جایگزینی"} onBackClick={() => router.back()} />
      </div>
    </div>
  );
}

export default SuggestResidences;
