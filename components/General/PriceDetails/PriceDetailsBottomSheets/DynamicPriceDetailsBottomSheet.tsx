import { THandleSmoothClose } from "components/General/core/BottomSheet";
import CreateKeyValuePair from "./CreateKeyValuePair";

function PriceDetailsBottomSheet({
  handleSmoothClose,
  dynamicKeyValuePairs,
}: {
  handleSmoothClose: THandleSmoothClose;
  dynamicKeyValuePairs: {
    k: string;
    v: number;
  }[];
}) {
  return (
    <div>
      {dynamicKeyValuePairs?.map((pair, index) => {
        if (!pair.v) return null; // In case v === 0 ==> which means that record does not exist in checkout data (bcz it resulted in zero).
        return <CreateKeyValuePair key={index} keyy={pair.k} value={pair.v as number} />;
      })}
    </div>
  );
}

export default PriceDetailsBottomSheet;
