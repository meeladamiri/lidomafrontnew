import { ISettlementStatus } from ".";

interface ISettlementStatusTag {
  tagValue: ISettlementStatus;
  rounded?: boolean;
  wrapperClassnames?: string;
  tagValueClassnames?: string;
}
export const translateStatus = (status: ISettlementStatus): string => {
  switch (status) {
    case "deposited":
      return "بیعانه";
    case "settled":
      return "تسویه شده";
    default:
      return "تسویه نشده";
  }
};

function SettlementStatusTag({
  tagValue,
  rounded = false,
  wrapperClassnames,
  tagValueClassnames,
}: ISettlementStatusTag) {
  return (
    <div
      className={`rounded-8 cursor-pointer px-12 py-6 gap-x-4 ${
        tagValue === "deposited"
          ? "bg-blue-main"
          : tagValue === "settled"
          ? "bg-green-main"
          : "bg-red-main"
      } ${rounded ? "!rounded-100" : ""} ${wrapperClassnames || ""}`}
    >
      <span className={`text-14 text-white font-m leading-20 ${tagValueClassnames || ""}`}>
        {translateStatus(tagValue)}
      </span>
    </div>
  );
}

export default SettlementStatusTag;
