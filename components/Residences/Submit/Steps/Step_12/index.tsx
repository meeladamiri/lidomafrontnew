import { ResidenceAmenity } from "@/interfaces/Residences/Submit";
import {
  IExtraRule,
  IRule_ForSubmitApi,
  ISelectedRulesData,
  ISpecifiedRulesOfResComingFromApi,
  IStaticRule,
} from "@/interfaces/Residences/Submit/Steps/Step_12";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Select } from "components/General/core/Select";
import { Textarea } from "components/General/core/Textarea";
import Counter from "components/General/Counter";
import Divider from "components/General/Divider";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { Hours } from "constants/Hours";
import { useEffect, useState } from "react";
import SwitchItem from "./SwitchItem";
import StepTitle from "../../StepTitle";
import { useRouter } from "next/router";
import { Button } from "@/components/General/core/Button";
import BottomActionsWrapper from "../../BottomActions/BottomActionsWrapper";
import { submitStep } from "@/api/SubmitResidence";
import exception from "@/utilities/exception";
import { EXCEPTIONTYPES, defaultError } from "@/constants/enums/exception_types";
import { getAmenities } from "@/api/Residences/getAmenities";
import { useResidenceDraft } from "../../useWizard";

function Step12() {
  const router = useRouter();
  const [allStaticRules, setAllStaticRules] = useState<IStaticRule[]>([]);

  const [selectedRulesData, setSelectedRulesData] = useState<ISelectedRulesData[]>([]);
  const [minReservableDays, setMinReservableDays] = useState<number>(1);
  const [additionalRules, setAdditionalRules] = useState<string>("");
  const [selectedCheckinFrom, setSelectedCheckinFrom] = useState<string>("14:00");
  const [selectedCheckinTo, setSelectedCheckinTo] = useState<string>("17:00");
  const [selectedCheckoutTime, setSelectedCheckoutTime] = useState<string>("12:00");

  const {
    isLoading: getResidenceSubmittedDataIsLaoding,
    data: residenceSubmittedData,
    refetch,
  } = useResidenceDraft();

  useEffect(() => {
    if (!!residenceSubmittedData) {
      if (residenceSubmittedData?.status === "success") {
        const info: ISpecifiedRulesOfResComingFromApi =
          residenceSubmittedData?.params?.residence_info;

        setMinReservableDays(info?.min_reservable_days || 1);
        setSelectedCheckinFrom(info?.checkin_from || "");
        setSelectedCheckinTo(info?.checkin_to || "");
        setSelectedCheckoutTime(info?.checkout || "12:00");

        let extra_rules_data: IExtraRule | null = null;
        if (!!info?.extra_rules) {
          const extraRules: IExtraRule = JSON.parse(info?.extra_rules);

          extra_rules_data = extraRules;
        }

        const selected_rules_data: ISelectedRulesData[] = info.rules.map((rule) => ({
          id: rule.id,
          name: rule.name,
          category: rule.category,
          userDesc: !!extra_rules_data ? (extra_rules_data?.[rule?.id] as any)?.desc || "" : "",
          checked: true,
        }));

        setSelectedRulesData(selected_rules_data);

        if (!!extra_rules_data?.desc) {
          setAdditionalRules((extra_rules_data?.desc as string) || "");
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [residenceSubmittedData]);

  const { isLoading: getAmenitiesIsLoading, data: amenitiesData } = useQuery(["getAmenities"], () =>
    getAmenities()
  );

  useEffect(() => {
    if (!!amenitiesData) {
      if (amenitiesData?.status === "success") {
        const allAmenities: ResidenceAmenity[] = amenitiesData?.params?.amenities;

        const residenceAllStaticRules = allAmenities?.filter(
          (el) => el.category === "مقررات اقامتگاه" && el.name !== "مقررات اقامتگاه"
        );

        const residenceAllStaticRules_Mapped = residenceAllStaticRules.map((el) => ({
          id: el.id,
          name: el.name,
          icon_url: el.icon_url,
          category: "مقررات اقامتگاه",
        }));

        setAllStaticRules(residenceAllStaticRules_Mapped);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amenitiesData]);

  const submitStep12Mutation = useMutation(
    ({
      rules,
      productId,
      checkin_from,
      checkin_to,
      checkout,
      min_reservable_days,
      desc,
    }: {
      rules: IRule_ForSubmitApi[];
      productId: number;
      checkin_from: string; // ex: "12:00"
      checkin_to: string; // ex: "12:00"
      checkout: string; // ex: "12:00"
      min_reservable_days: number;
      desc: string;
    }) => {
      return submitStep({
        step: 12,
        productId,
        data: {
          rules,
          checkin_from: checkin_from,
          checkin_to: checkin_to,
          checkout: checkout,
          min_reservable_days: min_reservable_days,
          desc,
        },
      });
    },
    {
      onSuccess: (data) => {
        if (data?.status === "success") {
          refetch();
          router.push(`?step=${13}&productId=${data?.params?.product_id}`);
        } else {
          exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
        }
      },
    }
  );

  function onSubmitClick() {
    submitStep12Mutation.mutate({
      productId: Number(router?.query?.productId as string),
      rules: selectedRulesData
        .filter((el) => !!el.checked)
        .map((el) => ({
          id: el.id,
          extra_rules: !!el.userDesc ? { desc: el.userDesc } : "",
        })),
      checkin_from: selectedCheckinFrom || "",
      checkin_to: selectedCheckinTo || "",
      checkout: selectedCheckoutTime,
      min_reservable_days: minReservableDays,
      desc: additionalRules,
    });
  }

  return getResidenceSubmittedDataIsLaoding || getAmenitiesIsLoading ? (
    <TinyLoader />
  ) : (
    <>
      <div className="pb-120 md:pb-[130px]">
        <StepTitle wrapperClassname="mb-24 mt-16 md:mt-0" />

        <div className="">
          <p className="text-16 md:text-14 leading-28 md:leading-20 text-black font-m md:font-r mb-24">
            قوانین و مقررات اقامتگاه خود را مشخص کنید
          </p>

          <div>
            {allStaticRules?.map((staticRule: IStaticRule, index: number) => {
              return (
                <div
                  key={staticRule.id}
                  className="first:mt-0 mt-12 pb-12 last:pb-0 border-b-1 border-solid border-b-[rgba(28,52,84,0.26)] last:border-b-none"
                >
                  <SwitchItem
                    itemName={staticRule.name}
                    itemText={staticRule.name}
                    UserDescAboutRes={
                      selectedRulesData.find((el) => el.id === staticRule.id)?.userDesc || ""
                    }
                    onChangeUserDescAboutRes={(text) => {
                      setSelectedRulesData((prev) => {
                        return [
                          ...prev.filter((r) => r.id !== staticRule.id),
                          {
                            ...prev.find((item) => item.id === staticRule.id),
                            userDesc: text,
                          } as ISelectedRulesData,
                        ];
                      });
                    }}
                    isChecked={!!selectedRulesData.find((el) => el.id === staticRule.id)?.checked}
                    onToggle={(checked: boolean) => {
                      setSelectedRulesData((prev) => [
                        ...prev.filter((r) => r.name !== staticRule.name),
                        {
                          category: "مقررات اقامتگاه",
                          id: staticRule.id,
                          name: staticRule.name,
                          userDesc: prev.find((el) => el.id === staticRule.id)?.userDesc || "",
                          iconUrl: staticRule.icon_url,
                          checked: !!checked,
                        },
                      ]);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-24 mb-24">
            <Textarea
              name="additionalRules"
              label="افزودن قوانین بیشتر"
              customValue={additionalRules}
              customOnChange={(value) => setAdditionalRules(value)}
              rows={4}
              placeholder="مثال : درصورت تعیین حداقل 2 شب اقامت، درخواست رزرو برای 1 شب اقامت قابل ثبت نخواهد بود."
            />
          </div>
        </div>

        <Divider />

        <div className="py-24 flex items-center justify-between ">
          <p className="text-16 leading-28 text-black font-m">حداقل روز رزرو</p>

          <div className="w-[107px]">
            <Counter
              inputName={`minReservableDays`}
              counterMinimum={1}
              customValue={minReservableDays}
              onInc={() => setMinReservableDays((prev) => prev + 1)}
              onDec={() => setMinReservableDays((prev) => prev - 1)}
            />
          </div>
        </div>

        <Divider />

        <div className="pt-24">
          <div className="mb-24">
            <p className="text-12 leading-21 text-black font-r mb-8">ساعت ورود مهمان</p>

            <div className="grid grid-cols-11 gap-x-8">
              <div className="col-span-5">
                <Select
                  name={"checkin-from"}
                  placeholder={"انتخاب کنید"}
                  data={Hours.map((hour, i) => hour)}
                  value={selectedCheckinFrom}
                  onChange={(value) => {
                    setSelectedCheckinFrom(value);
                  }}
                />
              </div>
              <div className="col-span-1 flex items-center justify-center">تا</div>
              <div className="col-span-5">
                <Select
                  name={"checkin-to"}
                  placeholder={"انتخاب کنید"}
                  data={Hours.map((hour, i) => hour)}
                  value={selectedCheckinTo}
                  onChange={(value) => {
                    setSelectedCheckinTo(value);
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <Select
              name={"checkout-time"}
              labelText="ساعت خروج مهمان"
              placeholder={"انتخاب کنید"}
              data={Hours.map((hour, i) => hour)}
              value={selectedCheckoutTime}
              onChange={(value) => {
                setSelectedCheckoutTime(value);
              }}
            />
          </div>
        </div>
      </div>

      <BottomActionsWrapper isSaving={submitStep12Mutation.isLoading} onClickOfSubmitStep={() => onSubmitClick()}>
        <Button
          isLoading={submitStep12Mutation.isLoading}
          loadingText="در حال ذخیره…"
          leftIcon={<i className="icon-FlashLeft text-24 text-white hidden md:block" />}
          isFullWidth
          onClick={onSubmitClick}
        >
          ذخیره و ادامه
        </Button>
      </BottomActionsWrapper>
    </>
  );
}

export default Step12;
