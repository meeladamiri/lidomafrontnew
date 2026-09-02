import { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button } from "components/General/core/Button";
import RoundedTabs from "components/General/core/RoundedTabs";
import { useState } from "react";
import MakeEmptyForm from "./MakeEmptyForm";
import NoChangeForm from "./NoChangeForm";
import type { FastChoice } from "./index";

function EditCalendarBottomSheet({
  handleSmoothClose,
  noChange_formik,
  makeEmpty_formik,
  handleFillingCalendarDates,
  fastChoice,
  setFastChoice,
}: {
  handleSmoothClose: THandleSmoothClose;
  noChange_formik: any;
  makeEmpty_formik: any;
  handleFillingCalendarDates: () => Promise<void>;
  fastChoice: FastChoice;
  setFastChoice: (choice: FastChoice) => void;
}) {
  const [activeTab, setActiveTab] = useState<number>(2); // Let 'بدون تغییر' be the default (Figma)

  return (
    <div>
      <p className="flex items-center gap-x-6 text-14 leading-24 text-primary-dark font-r mb-16">
        <i className="icon-Calendar text-20 text-primary-dark" />
        پر یا خالی کردن تقویم
      </p>

      <div className="w-full">
        <RoundedTabs
          type="brand"
          activeIndex={activeTab}
          onChange={(idx: number) => {
            setActiveTab(idx);
          }}
          data={[
            {
              tabLabel: `پر شود`,
              tabIndex: 0,
            },
            {
              tabLabel: `خالی شود`,
              tabIndex: 1,
            },
            {
              tabLabel: `بدون تغییر`,
              tabIndex: 2,
            },
          ]}
        />
      </div>

      <div>
        {activeTab === 0 ? null : activeTab === 1 ? (
          <div className="mt-12">
            <MakeEmptyForm makeEmpty_formik={makeEmpty_formik} />
          </div>
        ) : (
          // activeTab === 2
          <div className="mt-12">
            <NoChangeForm noChange_formik={noChange_formik} />
          </div>
        )}
      </div>

      {/*
        «رزرو آنی» for the same selection, in the same shape as the block
        above it. Three choices rather than a switch, because the third one —
        «بدون تغییر» — is the default and the important one: a host opening
        this to reprice a weekend must not silently change how those nights
        get booked.
      */}
      {/*
        Greyed out while «پر شود» is selected: a night that is filled cannot
        be booked at all, so whether it would have been booked instantly is
        not a question with an answer.
      */}
      <div
        className={`mt-20 pt-20 border-t border-gray-F3F5F7 transition-opacity ${
          activeTab === 0 ? "opacity-40 pointer-events-none" : ""
        }`}
        aria-hidden={activeTab === 0}
      >
        <p className="flex items-center gap-x-6 text-14 leading-24 text-black font-r mb-12">
          <i className="icon-Flash text-20 text-black" />
          رزرو آنی روزهای انتخاب شده
        </p>
        <div className="w-full">
          <RoundedTabs
            activeIndex={fastChoice === "on" ? 0 : fastChoice === "off" ? 1 : 2}
            onChange={(idx: number) => setFastChoice(idx === 0 ? "on" : idx === 1 ? "off" : "none")}
            data={[
              { tabLabel: `فعال`, tabIndex: 0 },
              { tabLabel: `غیرفعال`, tabIndex: 1 },
              { tabLabel: `بدون تغییر`, tabIndex: 2 },
            ]}
          />
        </div>
      </div>

      <p className="text-12 leading-21 text-black font-l mt-24 text-center">
        بعد از اعمال همه تغییرات ، بر روی <span className="font-m">&quot;ذخیره&quot;</span> کلیک
        کنید
      </p>

      <div className="grid grid-cols-3 gap-x-12 mt-32">
        <div className="col-span-1">
          <Button isFullWidth color="grey" onClick={handleSmoothClose}>
            انصراف
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            isFullWidth
            // type="submit"
            disabled={
              // activeTab === 0
              //   ? false
              //   : activeTab === 1
              //   ? JSON.stringify(makeEmpty_formik?.values) ===
              //     JSON.stringify(makeEmpty_formik?.initialValues)
              //   : JSON.stringify(noChange_formik?.values) ===
              //     JSON.stringify(noChange_formik?.initialValues)
              false
            }
            onClick={() => {
              if (activeTab === 0) {
                return handleFillingCalendarDates();
              } else if (activeTab === 1) {
                makeEmpty_formik?.handleSubmit();
              } else {
                // activeTab === 2
                noChange_formik?.handleSubmit();
              }
            }}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EditCalendarBottomSheet;
