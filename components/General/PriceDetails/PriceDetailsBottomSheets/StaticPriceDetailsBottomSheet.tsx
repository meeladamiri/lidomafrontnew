import { THandleSmoothClose } from "components/General/core/BottomSheet";
import CreateKeyValuePair from "./CreateKeyValuePair";

function PriceDetailsBottomSheet({
  handleSmoothClose,
  prices,
}: {
  handleSmoothClose: THandleSmoothClose;
  prices: {
    discount: number;
    extra_price: number;
    min_price: number;
    peak_price: number;
    week_price: number;
    weekend_price: number;
  };
}) {
  return (
    <div>
      {/* <CreateKeyValuePair keyy="قیمت اول هفته :" value={prices.week_price} /> */}
      <CreateKeyValuePair keyy="قیمت وسط هفته :" value={prices.week_price} />
      <CreateKeyValuePair keyy="قیمت آخر هفته :" value={prices.weekend_price} />
      <CreateKeyValuePair keyy="قیمت ایام پیک :" value={prices.peak_price} />
      <CreateKeyValuePair keyy="قیمت هر نفر اضافه :" value={prices.extra_price} />
    </div>
  );
}

export default PriceDetailsBottomSheet;
