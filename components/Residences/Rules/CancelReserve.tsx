import ModalHeader from "components/General/core/ModalHeader";
import { useRouter } from "next/router";

interface IRuleItem {
  name: string;
  value: string;
}

const RuleItem = ({ name, value }: IRuleItem) => {
  return (
    <div className="text-14 leading-30 text-black mb-12 last:mb-0">
      <p className="font-m inline">{name}</p>
      <p className="font-r inline">{value}</p>
    </div>
  );
};

function CancelReserveRules() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-16">
        <ModalHeader headerTitle={"قوانین لغو رزرو"} onBackClick={() => router.back()} />
      </div>

      <div className="px-20">
        <div>
          <RuleItem
            name={`تا قبل از 19 شهریور (ساعت 11) : `}
            value={`کل اجاره‌بها پس از کسر ۱۰ درصد کارمزد لغو به میهمان بازپرداخت می‌شود.`}
          />
          <RuleItem
            name={`از 19 شهریور (ساعت 11) به بعد : `}
            value={`اجاره شب اول و 10 درصد شب‌ های باقیمانده کسر می‌گردد.`}
          />
        </div>
      </div>
    </div>
  );
}

export default CancelReserveRules;
