import InfoRow from "./InfoRow";

const HostPerformance = ({
  activeResesN,
  responseTime,
  confirmPerc,
}: {
  activeResesN: number;
  responseTime: number;
  confirmPerc: number;
}) => {
  return (
    <div className={`flex flex-col gap-16 mb-16 p-16 border border-gray-F0F0F0 rounded-16`}>
      <InfoRow
        k="تعداد اقامتگاه فعال :"
        v={`${activeResesN} اقامتگاه`}
        icon={<i className="icon-Home text-black text-20" />}
      />

      <InfoRow
        k="میانگین زمان پاسخگویی :"
        v={`${responseTime?.toFixed(0)} دقیقه`}
        icon={<i className="icon-Timer text-black text-20" />}
      />

      <InfoRow
        k="میزان تأیید رزرو :"
        v={`${confirmPerc} درصد`}
        icon={<i className="icon-Reserve text-20 text-gray-616E7C" />}
      />
    </div>
  );
};

export default HostPerformance;
