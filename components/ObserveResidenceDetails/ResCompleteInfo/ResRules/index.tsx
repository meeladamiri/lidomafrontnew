import { IObserveResidenceData } from "@/interfaces/observe_residence";
// import GoToFlash from "../../../General/GoToFlash";
// import { useState } from "react";
// import dynamic from "next/dynamic";
// import Image from "next/image";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import { Textarea } from "@/components/General/core/Textarea";

// const ResidenceRulesModal = dynamic(() => import("./ResidenceRulesModal"), {
//   ssr: true,
// });

function ResRules() {
  const { data } = useGetObserveResidence();
  // const [showResidenceRulesModal, setShowResidenceRulesModal] = useState<boolean>(false);

  const resp: IObserveResidenceData = data?.params;
  const rules = resp?.rules;
  const checkin_from = resp?.residence_info.checkin_from;
  const checkin_to = resp?.residence_info.checkin_to;
  const checkout = resp?.residence_info.checkout;
  const extra_rules = resp?.residence_info.extra_rules;
  const min_reservable_days = resp?.residence_info.min_reservable_days;

  const rulesData = [
    {
      // icon: <i className="icon-BirthCertificate text-24 text-black" />,
      text:
        rules.find(
          (el) =>
            el.category === "مقررات اقامتگاه" && el.name === "همراه داشتن مدارک محرمیت الزامیست"
        )?.value === "بله"
          ? "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی است."
          : // : "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی نیست.",
            "",
    },
    // {
    //   // icon: <i className="icon-Timer text-24 text-black" />,
    //   text:
    //     checkin_from?.[0] && checkin_to?.[0]
    //       ? ` زمان تحویل از ${checkin_from[0]} تا ${checkin_to[0]}`
    //       : "",
    // },
    // {
    //   // icon: <i className="icon-Timer text-24 text-black" />,
    //   text: checkout?.[0] ? `زمان تخلیه : ${checkout[0]}` : "",
    // },
    {
      // icon: (
      //   <Image
      //     src="/assets/non-icomoon-icons/panje.svg"
      //     width={24}
      //     height={24}
      //     alt=""
      //     style={{
      //       maxWidth: "100%",
      //       height: "auto",
      //     }}
      //   />
      // ),
      text:
        rules.find(
          (el) => el.category === "مقررات اقامتگاه" && el.name === "ورود حیوان خانگی مجاز باشد."
        )?.value === "بله"
          ? ""
          : "آوردن حیوانات خانگی به این اقامتگاه ممنوع است.",
    },
    {
      // icon: (
      //   <Image
      //     src="/assets/non-icomoon-icons/smoke.svg"
      //     width={24}
      //     height={24}
      //     alt=""
      //     style={{
      //       maxWidth: "100%",
      //       height: "auto",
      //     }}
      //   />
      // ),
      text:
        rules.find(
          (el) => el.category === "مقررات اقامتگاه" && el.name === "استعمال دخانیات مجاز باشد"
        )?.value === "بله"
          ? ""
          : "استعمال دخانیات مجاز نمی باشد",
    },
    {
      // icon: (
      //   <Image
      //     src="/assets/non-icomoon-icons/celebration.svg"
      //     width={24}
      //     height={24}
      //     alt=""
      //     style={{
      //       maxWidth: "100%",
      //       height: "auto",
      //     }}
      //   />
      // ),
      text:
        rules.find(
          (el) => el.category === "مقررات اقامتگاه" && el.name === "برگزاری مراسم مجاز می باشد."
        )?.value === "بله"
          ? ""
          : "برگزاری مراسم مجاز نمی باشد",
    },
    {
      // icon: (
      //   <Image
      //     src="/assets/non-icomoon-icons/group_off.svg"
      //     width={24}
      //     height={24}
      //     alt=""
      //     style={{
      //       maxWidth: "100%",
      //       height: "auto",
      //     }}
      //   />
      // ),
      text:
        rules.find(
          (el) =>
            el.category === "مقررات اقامتگاه" && el.name === "پذیرش مهمان در هر ساعت از شبانه روز"
        )?.value === "بله"
          ? "پذیرش مهمان در هر ساعت از شبانه روز"
          : "",
    },
    {
      // icon: <i className="icon-Reserve text-24 text-black" />,
      text: !!min_reservable_days
        ? `حداقل تعداد روز رزرو این اقامتگاه ${min_reservable_days} روز است`
        : "",
    },
  ];

  return (
    <div id="resRules" className="md:col-span-6 col-span-full">
      <h3 className="pb-20">مقررات اقامتگاه</h3>
      <div className="pb-24">
        {rulesData.map((item, idx) => {
          if (!item.text) return;

          return (
            <div className="flex items-center gap-x-6 mb-16 last:mb-0" key={idx}>
              <i className="icon-Dot text-13 text-black"></i>
              <p className="text-13 leading-16 font-r text-black">{item.text}</p>
            </div>
          );
        })}
        {!!JSON.parse(extra_rules || "{}")?.desc && (
          <div className="mt-16 border-t-1 border-solid border-[rgba(28,52,84,0.26)]"></div>
        )}
        {!!JSON.parse(extra_rules || "{}")?.desc && (
          <div className="mt-16">
            <Textarea
              name="host-specific-rules"
              label="قوانین مختص میزبان"
              readonly={true}
              customValue={JSON.parse(extra_rules || "{}")?.desc}
              labelClassname="!text-14 !leading-20 !text-black !font-r"
              rows={4}
              // textareaClassnames="border-none typical-gray-bg"
            />
          </div>
        )}
      </div>

      {/* {!!showResidenceRulesModal && (
        <ResidenceRulesModal
          isModalOpen={showResidenceRulesModal}
          handleClose={() => setShowResidenceRulesModal(false)}
          data={[
            {
              icon: <i className="icon-BirthCertificate text-24 text-black" />,
              text:
                rules.find(
                  (el) =>
                    el.category === "مقررات اقامتگاه" &&
                    el.name === "همراه داشتن مدارک محرمیت الزامیست"
                )?.value === "بله"
                  ? "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی است."
                  : // : "همراه داشتن شناسنامه زوجین (مدارک محرمیت) برای تحویل اقامتگاه الزامی نیست.",
                    "",
            },
            {
              icon: <i className="icon-Timer text-24 text-black" />,
              text:
                checkin_from[0] && checkin_to[0]
                  ? ` زمان تحویل از ${checkin_from[0]} تا ${checkin_to[0]}`
                  : "",
            },
            {
              icon: <i className="icon-Timer text-24 text-black" />,
              text: checkout[0] ? `زمان تخلیه : ${checkout[0]}` : "",
            },
            {
              icon: (
                <Image
                  src="/assets/non-icomoon-icons/panje.svg"
                  width={24}
                  height={24}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              ),
              text:
                rules.find(
                  (el) =>
                    el.category === "مقررات اقامتگاه" &&
                    el.name === "ورود حیوان خانگی مجاز می باشد."
                )?.value === "بله"
                  ? ""
                  : "آوردن حیوانات خانگی به این اقامتگاه ممنوع است.",
            },
            {
              icon: (
                <Image
                  src="/assets/non-icomoon-icons/smoke.svg"
                  width={24}
                  height={24}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              ),
              text:
                rules.find(
                  (el) =>
                    el.category === "مقررات اقامتگاه" && el.name === "استعمال دخانیات مجاز می باشد"
                )?.value === "بله"
                  ? ""
                  : "استعمال دخانیات مجاز نمی باشد",
            },
            {
              icon: (
                <Image
                  src="/assets/non-icomoon-icons/celebration.svg"
                  width={24}
                  height={24}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              ),
              text:
                rules.find(
                  (el) =>
                    el.category === "مقررات اقامتگاه" && el.name === "برگزاری مراسم مجاز می باشد."
                )?.value === "بله"
                  ? ""
                  : "برگزاری مراسم مجاز نمی باشد",
            },
            {
              icon: (
                <Image
                  src="/assets/non-icomoon-icons/group_off.svg"
                  width={24}
                  height={24}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              ),
              text:
                rules.find(
                  (el) =>
                    el.category === "مقررات اقامتگاه" &&
                    el.name === "پذیرش مهمان در هر ساعت از شبانه روز"
                )?.value === "بله"
                  ? "پذیرش مهمان در هر ساعت از شبانه روز"
                  : "",
            },
            {
              icon: <i className="icon-Reserve text-24 text-black" />,
              text: !!min_reservable_days
                ? `حداقل تعداد روز رزرو این اقامتگاه ${min_reservable_days} روز است`
                : "",
            },
          ]}
          hostSpecificRules={JSON.parse(extra_rules || "{}")?.desc || ""}
          childFreePriceText={"هزینه اقامت یک کودک زیر 5 سال رایگان است"} // TODO
        />
      )} */}
    </div>
  );
}

export default ResRules;
