import { useQuery } from "@tanstack/react-query";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { IAmenity_ExtraFeature, ResidenceAmenity } from "interfaces/Residences/Submit";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ISelectedRulesData, IStaticRule } from "@/interfaces/Residences/Submit/Steps/Step_12";
import SwitchItem from "components/Residences/Submit/Steps/Step_12/SwitchItem";
import { Textarea } from "@/components/General/core/Textarea";
import { Select } from "@/components/General/core/Select";
import { Hours } from "@/constants/Hours";
import Counter from "@/components/General/Counter";
import Divider from "@/components/General/Divider";
import CancelRuleItem from "../../CancelRule/CancelRuleItem";
import { CancellationPolicy_enum } from "@/constants/enums/cancellation_policy";
import EditableCancelRuleItem from "../../CancelRule/EditableCancelRuleItem";
import { ICustomPolicyInitialValues } from "@/interfaces/Residences/Submit/Steps/Step_13";
import PageTitle from "@/components/General/PageTitle";
import { getAmenities } from "@/api/Residences/getAmenities";

const facilityDetailsBottomSheetInitV: {
  show: boolean;
  data: {
    facilityName: string;
    facilityId: number;
    extraFeatures: IAmenity_ExtraFeature[];
  };
} = {
  show: false,
  data: {
    facilityName: "",
    facilityId: 0,
    extraFeatures: [],
  },
};

const reserveCommission = 10;
const cancelCommission = 10;

interface IEditResidenceRules {
  selectedRulesData: ISelectedRulesData[];
  setSelectedRulesData: Dispatch<SetStateAction<ISelectedRulesData[]>>;
  additionalRules: string;
  setAdditionalRules: Dispatch<SetStateAction<string>>;
  minReservableDays: number;
  setMinReservableDays: Dispatch<SetStateAction<number>>;
  selectedCheckinFrom: string;
  setSelectedCheckinFrom: Dispatch<SetStateAction<string>>;
  selectedCheckinTo: string;
  setSelectedCheckinTo: Dispatch<SetStateAction<string>>;
  selectedCheckoutTime: string;
  setSelectedCheckoutTime: Dispatch<SetStateAction<string>>;
  customPolicyFormik: any;
  selectedCancelPolicy: CancellationPolicy_enum | undefined;
  setSelectedCancelPolicy: Dispatch<SetStateAction<CancellationPolicy_enum | undefined>>;
  setCustomPolicyInitialValues: Dispatch<SetStateAction<ICustomPolicyInitialValues>>;
}

const EditResidenceRules = ({
  selectedRulesData,
  setSelectedRulesData,
  additionalRules,
  setAdditionalRules,
  minReservableDays,
  setMinReservableDays,
  selectedCheckinFrom,
  setSelectedCheckinFrom,
  selectedCheckinTo,
  setSelectedCheckinTo,
  selectedCheckoutTime,
  setSelectedCheckoutTime,
  customPolicyFormik,
  selectedCancelPolicy,
  setSelectedCancelPolicy,
  setCustomPolicyInitialValues,
}: IEditResidenceRules) => {
  const [allStaticRules, setAllStaticRules] = useState<IStaticRule[]>([]);

  // Possible to be dynamic in the future. That's why i used state for it.
  const [easyGoingValues, setEasyGoingValues] = useState({
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 10,
  });
  const [balancedValues, setBalancedValues] = useState({
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 10,
  });
  const [strictValues, setStrictValues] = useState({
    fullReturnTime: 72,
    beforeStartTime: 24,
    hostShareTotalAmount: 20,
    hostSharePastNights: 100,
    hostShareFutureNights: 10,
  });

  const [customValues, setCustomValues] = useState({
    fullReturnTime: null,
    beforeStartTime: null,
    hostShareTotalAmount: null,
    hostSharePastNights: null,
    hostShareFutureNights: null,
  });

  const [facilityDetailsBottomSheet, setFacilityDetailsBottomSheet] = useState(
    facilityDetailsBottomSheetInitV
  );

  const { isLoading: getAmenitiesIsLoading, data: amenitiesData } = useQuery(["getAmenities"], () =>
    getAmenities()
  );

  useEffect(() => {
    if (!!amenitiesData) {
      // console.log(`getAmenities data`, amenitiesData);

      if (amenitiesData?.status === "success") {
        const allAmenities: ResidenceAmenity[] = amenitiesData?.params?.amenities;

        // console.log("allAmenities", allAmenities);
        const residenceAllStaticRules = allAmenities?.filter(
          (el) => el.category === "مقررات اقامتگاه" && el.name !== "مقررات اقامتگاه"
        );
        // console.log("residenceAllStaticRules", residenceAllStaticRules);

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

  return (
    <div className="">
      {getAmenitiesIsLoading ? (
        <TinyLoader />
      ) : (
        <>
          <p className="text-16 leading-28 text-black font-m mb-24">
            قوانین و مقررات اقامتگاه خود را مشخص کنید
          </p>

          {/*  */}
          <div className="mb-24">
            <div className="">
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

            <Divider />

            <div className="py-24 flex items-center justify-between">
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

          <Divider />

          <div className="mt-24">
            <PageTitle
              title="قوانین لغو رزرو"
              icon={
                <Image
                  width={24}
                  height={24}
                  src={"/assets/non-icomoon-icons/cancel.svg"}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              }
              containerClassname="mb-24"
            />

            <p className="text-16 leading-28 text-black font-m mb-16">
              قوانین و مقررات اقامتگاه خود را مشخص کنید
            </p>

            <div>
              <div className="mb-16">
                <CancelRuleItem
                  mainTitle={CancellationPolicy_enum.EASYGOING}
                  //
                  // fullReturnTime={easyGoingValues.fullReturnTime}
                  // beforeStartTime={easyGoingValues.beforeStartTime}
                  // hostShareTotalAmount={easyGoingValues.hostShareTotalAmount}
                  // hostSharePastNights={easyGoingValues.hostSharePastNights}
                  // hostShareFutureNights={easyGoingValues.hostShareFutureNights}
                  firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
                  firstDesc={`پرداخت کامل وجه با کسر کارمزد سایت`}
                  secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
                  secondDesc={`سهم میزبان : کسر مبلغ شب اول`}
                  thirdTitle={`از روز ورود تا خروج مهمان`}
                  thirdDesc={`سهم میزبان : 100% مبلغ شب های سپری شده + %10 مبلغ شب های باقیمانده`}
                  //
                  reserveCommission={reserveCommission}
                  cancelCommission={cancelCommission}
                  isSelected={selectedCancelPolicy === CancellationPolicy_enum.EASYGOING}
                  onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.EASYGOING)}
                />
              </div>

              <div className="mb-16">
                <CancelRuleItem
                  mainTitle={CancellationPolicy_enum.BALANCED}
                  //
                  // fullReturnTime={balancedValues.fullReturnTime}
                  // beforeStartTime={balancedValues.beforeStartTime}
                  // hostShareTotalAmount={balancedValues.hostShareTotalAmount}
                  // hostSharePastNights={balancedValues.hostSharePastNights}
                  // hostShareFutureNights={balancedValues.hostShareFutureNights}
                  firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
                  firstDesc={`سهم میزبان : %10 کل مبلغ رزرو`}
                  secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
                  secondDesc={`سهم میزبان : کسر مبلغ شب اول + %10 شب های باقی مانده`}
                  thirdTitle={`از روز ورود تا خروج مهمان`}
                  thirdDesc={`سهم میزبان : 100% مبلغ شب های سپری شده + %20 مبلغ شب های باقیمانده`}
                  //
                  reserveCommission={reserveCommission}
                  cancelCommission={cancelCommission}
                  isSelected={selectedCancelPolicy === CancellationPolicy_enum.BALANCED}
                  onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.BALANCED)}
                />
              </div>

              <div className="mb-16">
                <CancelRuleItem
                  mainTitle={CancellationPolicy_enum.STRICT}
                  //
                  // fullReturnTime={strictValues.fullReturnTime}
                  // beforeStartTime={strictValues.beforeStartTime}
                  // hostShareTotalAmount={strictValues.hostShareTotalAmount}
                  // hostSharePastNights={strictValues.hostSharePastNights}
                  // hostShareFutureNights={strictValues.hostShareFutureNights}
                  firstTitle={`تا 72 ساعت قبل از ورود مهمان`}
                  firstDesc={`سهم میزبان : %20 کل مبلغ رزرو`}
                  secondTitle={`تا 24 ساعت قبل از ورود مهمان`}
                  secondDesc={`سهم میزبان : کسر مبلغ دو شب اول + %20 شب های باقی مانده`}
                  thirdTitle={`از روز ورود تا خروج مهمان`}
                  thirdDesc={`هیچ مبلغی به مسافر عودت داده نخواهد شد`}
                  //
                  reserveCommission={reserveCommission}
                  cancelCommission={cancelCommission}
                  isSelected={selectedCancelPolicy === CancellationPolicy_enum.STRICT}
                  onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.STRICT)}
                />
              </div>

              <div className="">
                <EditableCancelRuleItem
                  mainTitle={CancellationPolicy_enum.CUSTOM}
                  //
                  fullReturnTime={customValues.fullReturnTime}
                  beforeStartTime={customValues.beforeStartTime}
                  hostShareTotalAmount={customValues.hostShareTotalAmount}
                  hostSharePastNights={customValues.hostSharePastNights}
                  hostShareFutureNights={customValues.hostShareFutureNights}
                  //
                  reserveCommission={reserveCommission}
                  cancelCommission={cancelCommission}
                  isSelected={selectedCancelPolicy === CancellationPolicy_enum.CUSTOM}
                  onSelect={() => setSelectedCancelPolicy(CancellationPolicy_enum.CUSTOM)}
                  formik={customPolicyFormik}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditResidenceRules;
