import { useState } from "react";
import dynamic from "next/dynamic";
const SidebarWrapper = dynamic(() => import("@/components/General/Sidebar/SidebarWrapper"), {
  ssr: true,
});
const CalendarItemBox = dynamic(
  () => import("./CalendarItemBox").then((module) => module.CalendarItemBox),
  {
    ssr: true,
  }
);
const SidebarCommonBody = dynamic(
  () => import("../General/Sidebar/SidebarCommonBody").then((module) => module.SidebarCommonBody),
  {
    ssr: true,
  }
);
const SidebarCommonHeader = dynamic(
  () =>
    import("../General/Sidebar/SidebarCommonHeader").then((module) => module.SidebarCommonHeader),
  {
    ssr: true,
  }
);

function TextsSection({ mainText, subText }: { mainText: string; subText: string }) {
  return (
    <div>
      <p className="text-14 leading-24 text-black font-r mb-12">{mainText}</p>
      <p className="text-10 leading-17 text-black font-l">{subText}</p>
    </div>
  );
}

function CalendarHelp() {
  const [isCalendarSidebarHelpOpen, setIsCalendarSidebarHelpOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center gap-x-4 cursor-pointer"
        onClick={() => setIsCalendarSidebarHelpOpen(true)}
      >
        <i className="icon-Warning text-info text-18" />
        <p className="text-12 leading-21 text-info font-m">راهنمای تقویم</p>
      </div>

      {!!isCalendarSidebarHelpOpen && (
        <SidebarWrapper
          isSidebarOpen={isCalendarSidebarHelpOpen}
          setIsSidebarOpen={setIsCalendarSidebarHelpOpen}
          content={({ handleSidebarClose }) => (
            <div className="h-full">
              <SidebarCommonHeader
                headerText="راهنمای تقویم"
                onClose={() => handleSidebarClose()}
              />

              <SidebarCommonBody>
                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={22}
                      discountP={0}
                      isFastReserve={false}
                      isPeakDay={false}
                      isOffDay={false}
                      isAlreadyReserved={false}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={true}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection mainText="روزهای گذشته" subText="روزهای سپری شده در تقویم" />
                </div>

                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={13}
                      discountP={0}
                      isFastReserve={false}
                      isPeakDay={false}
                      isOffDay={false}
                      isAlreadyReserved={false}
                      isFilled={true}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection mainText="پر شده" subText="روزهایی که تقویم خود را بسته اید" />
                </div>

                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={25}
                      discountP={6}
                      isFastReserve={false}
                      isPeakDay={false}
                      isOffDay={false}
                      isAlreadyReserved={false}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection mainText="تخفیف دار" subText="روزهایی که دارای تخفیف هستند" />
                </div>

                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={17}
                      discountP={0}
                      isFastReserve={false}
                      isPeakDay={false}
                      isOffDay={false}
                      isAlreadyReserved={true}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection
                    mainText="رزرو شده"
                    subText="روزهایی که در لیدوماتریپ رزرو شده اند"
                  />
                </div>

                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={16}
                      discountP={0}
                      isFastReserve={false}
                      isPeakDay={false}
                      isOffDay={true}
                      isAlreadyReserved={false}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection
                    mainText="ایام تعطیل"
                    subText="روزهایی که در تقویم رسمی کشور تعطیل اند"
                  />
                </div>

                <div className="flex items-center gap-x-16 mb-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={28}
                      discountP={0}
                      isFastReserve={true}
                      isPeakDay={false}
                      isOffDay={false}
                      isAlreadyReserved={false}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 0,
                        week_price: 15500,
                        weekend_price: 15500,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection mainText="رزرو آنی" subText="روزهای با قابلیت رزرو آنی" />
                </div>

                <div className="flex items-center gap-x-16">
                  <div className="w-42">
                    <CalendarItemBox
                      dateNumber={22}
                      discountP={0}
                      isFastReserve={false}
                      isPeakDay={true}
                      isOffDay={false}
                      isAlreadyReserved={false}
                      isFilled={false}
                      noCoOperation={false}
                      isPassedDay={false}
                      prices={{
                        peak_price: 15500,
                        week_price: 0,
                        weekend_price: 0,
                      }}
                      specialDateInfo={{ is: false, specialDay_price: 0 }}
                    />
                  </div>

                  <TextsSection
                    mainText="ایام پیک"
                    subText="روزهای با ترافیک بالای مسافرت، مانند نوروز"
                  />
                </div>
              </SidebarCommonBody>
            </div>
          )}
        />
      )}
    </>
  );
}

export default CalendarHelp;
