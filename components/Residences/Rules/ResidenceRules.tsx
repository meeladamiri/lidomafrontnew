import ModalHeader from "components/General/core/ModalHeader";
import Image from "next/image";
import { useRouter } from "next/router";

interface IRuleItem {
  icon: JSX.Element;
  name: string;
}

const RuleItem = ({ icon, name }: IRuleItem) => {
  return (
    <div className="flex items-start gap-x-12 mb-16 last:mb-0">
      <div className="flex items-center">{icon}</div>
      <p className="text-14 leading-30 text-zilgara font-r">{name}</p>
    </div>
  );
};

function ResidenceRules() {
  const router = useRouter();

  return (
    <div>
      <div className="mb-16">
        <ModalHeader headerTitle={"مقررات اقامتگاه"} onBackClick={() => router.back()} />
      </div>

      <div className="px-20">
        <div>
          <RuleItem
            icon={<i className="text-18 text-black icon-Timer" />}
            name={`زمان تحویل از : 2 بعد از ظهر تا : 12 ظهر`}
          />
          <RuleItem
            icon={<i className="text-18 text-black icon-Timer -scale-x-100" />}
            name={`زمان تخلیه : 12 ظهر`}
          />
          <RuleItem
            icon={
              <Image
                src="/assets/non-icomoon-icons/panje.svg"
                width={18}
                height={16}
                alt=""
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            }
            name={`آوردن حیوانات خانگی به این اقامتگاه ممنوع است.`}
          />
          <RuleItem
            icon={<i className="text-18 text-black icon-BirthCertificate" />}
            name={`همراه داشتن شناسنامه زوجین برای تحویل اقامتگاه الزامی است.`}
          />
        </div>

        <div className="mt-16 text-center p-12 text-12 leading-18 text-black font-r rounded-6 border-1 border-dashed border-gray-C4CAD3">
          هزینه اقامت یک کودک زیر 5 سال رایگان است
        </div>
      </div>
    </div>
  );
}

export default ResidenceRules;
