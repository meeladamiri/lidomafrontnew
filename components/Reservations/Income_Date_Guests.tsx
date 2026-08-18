function Income_Date_Guests({
  hostIncome,
  startDate,
  endDate,
  mainGuestsN,
  extraGuestsN,
}: {
  hostIncome?: number;
  startDate?: string;
  endDate?: string;
  mainGuestsN?: number;
  extraGuestsN?: number;
}) {
  return (
    <div>
      <p className="text-16 leading-28 text-black font-m mb-12">
        مبلغ دریافتی شما : {hostIncome?.toLocaleString()} تومان
      </p>

      <div className="flex items-center justify-between mb-16 flex-wrap">
        <p className="flex items-center gap-x-8">
          <span>{startDate}</span>
          <i className="icon-CalendarFlash text-20" />
          <span>{endDate}</span>
        </p>
        <p className="flex items-center gap-x-6 text-14 leading-24 text-black">
          {mainGuestsN} نفر
          {!!extraGuestsN && <span className="text-[#1C2E4599]">+ {extraGuestsN} نفر اضافه</span>}
        </p>
      </div>
    </div>
  );
}

export default Income_Date_Guests;
