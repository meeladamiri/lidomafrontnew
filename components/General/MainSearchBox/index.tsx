import { Dispatch, SetStateAction, useEffect, useId, useRef, useState } from "react";
import moment from "moment-jalaali";
import { useRouter } from "next/router";
import OutsideClickHandler from "@/utilities/OutsideClickHandler";
import { Button } from "../core/Button";
import dynamic from "next/dynamic";
import { useGetPersianCityname } from "Hooks/SearchPages/useGetPersianCityname";
import DestinationCombobox, { DestinationChoice } from "./DestinationCombobox";

const SelectNumberOfPeople = dynamic(() => import("@/components/Home/SelectNumberOfPeople"), {
  ssr: true,
});
const DoubleCalendar = dynamic(() => import("@/components/Calendar/DoubleCalendar"), {
  ssr: false,
});

moment.loadPersian({ dialect: "persian-modern" });
moment.locale("fa-IR");

type Panel = "destination" | "dates" | "guests" | null;

/**
 * The hero search box.
 *
 * This is a real `<form>` with `action="/search"` and `method="get"`, which is
 * doing three jobs at once:
 *
 *  - Enter submits. The old version was a stack of `div`s with `onClick`
 *    handlers, so pressing Enter in the destination field did nothing at all.
 *  - Without JavaScript it still works: the destination input is named `id`,
 *    which is the same parameter `/search` reads, so a plain GET lands on real
 *    results (`/search?id=shiraz&guests_count=4`).
 *  - Google's sitelinks searchbox looks for a genuine search form, and the
 *    `SearchAction` markup on the home page now describes this one.
 *
 * With JavaScript the submit handler upgrades the destination to the canonical
 * `/search/<slug>` URL — the one the SEO pages are built on — instead of the
 * query-string form.
 */
function MainSearchBox({
  containerClassname,
  fillInputsFromUrl = false,
  setShowMainSearchBox,
  noCoOperation,
}: {
  containerClassname?: string;
  fillInputsFromUrl?: boolean;
  setShowMainSearchBox?: Dispatch<SetStateAction<boolean>>;
  noCoOperation: boolean;
}) {
  const router = useRouter();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [panel, setPanel] = useState<Panel>(null);
  const destinationTriggerRef = useRef<any>();
  const datesTriggerRef = useRef<any>();
  const datesTriggerRef2 = useRef<any>();
  const guestsTriggerRef = useRef<any>();

  const [selectedRanges, setSelectedRanges] = useState<
    [
      moment.Moment, // start day of range
      moment.Moment | null // end day ('null' while only the start is picked)
    ][]
  >([]);
  const [dateToWorkWith, setDateToWorkWith] = useState<moment.Moment>(moment(new Date()));

  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);
  // The slug that goes in the URL, and the label the reader sees. They differ:
  // "شیراز" is shown, "shiraz" is what the canonical URL uses.
  const [destinationSlug, setDestinationSlug] = useState<string>("");
  const [destinationText, setDestinationText] = useState<string>("");
  // A residence match navigates to its own page rather than to a search.
  const [destinationHref, setDestinationHref] = useState<string | undefined>();

  const persianCityName = useGetPersianCityname();

  useEffect(() => {
    if (!fillInputsFromUrl) return;

    if (router?.query?.id) {
      setDestinationSlug(router.query.id as string);
      setDestinationText(persianCityName);
    }

    const start_day = router?.query?.start; // ex: "1401/12/24"
    const end_day = router?.query?.end;

    if (start_day && end_day) {
      setSelectedRanges([[moment(start_day, "jYYYY/jMM/jDD"), moment(end_day, "jYYYY/jMM/jDD")]]);
    } else {
      setSelectedRanges([]);
    }

    setNumberOfPeople(router?.query?.guests_count ? Number(router.query.guests_count) : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fillInputsFromUrl, router]);

  const hasRange = selectedRanges.length === 1 && !!selectedRanges[0][1];
  const startValue = hasRange ? selectedRanges[0][0].format("jYYYY/jMM/jDD") : "";
  const endValue = hasRange ? (selectedRanges[0][1] as moment.Moment).format("jYYYY/jMM/jDD") : "";

  const closePanel = () => setPanel(null);

  /** Escape closes whatever is open, from anywhere in the form. */
  const onFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape" && panel) {
      e.stopPropagation();
      setPanel(null);
    }
  };

  const submit = () => {
    closePanel();
    if (setShowMainSearchBox) setShowMainSearchBox(false);

    // A residence was picked from the suggestions — go to it directly.
    if (destinationHref) {
      router.push(destinationHref);
      return;
    }

    // Free text is a legitimate destination: the backend matches Persian place
    // names, so a reader who typed "شیراز" and hit Enter without touching the
    // list still gets Shiraz. Previously this searched the whole country.
    const destination = (destinationSlug || destinationText).trim();

    const params = new URLSearchParams();
    if (hasRange) {
      params.set("start", startValue);
      params.set("end", endValue);
    }
    if (numberOfPeople) params.set("guests_count", String(numberOfPeople));

    const query = params.toString();
    const path = destination ? `/search/${encodeURIComponent(destination)}` : "/search";
    router.push(query ? `${path}?${query}` : path);
  };

  const panelIsOpen = panel !== null;

  const fieldBase = "transition-all duration-200 text-right w-full";
  const activeField =
    "rounded-full shadow-[0px_8px_24px_rgba(24,39,58,0.15)] bg-white hover:!bg-white";

  return (
    <form
      ref={formRef}
      role="search"
      aria-label="جستجوی اقامتگاه"
      action="/search"
      method="get"
      onKeyDown={onFormKeyDown}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      id="MainSearchBox"
      className={`
          max-w-[888px] bg-white mx-auto rounded-full shadow-[0px_4px_24px_rgba(24,39,58,0.08)] group/wrapper
          transition-all duration-200
          ${panelIsOpen ? "!bg-gray-airbnb" : ""}
          ${containerClassname || ""}
        `}
    >
      <div className="grid grid-cols-10 relative">
        {/* ---- destination ---- */}
        <div
          ref={destinationTriggerRef}
          className={`
              group py-12 pr-40 col-span-3 relative
              ${fieldBase}
              hover:bg-gray-airbnb
              rounded-tr-full rounded-br-full hover:rounded-tl-full hover:rounded-bl-full
              focus-within:rounded-full
              ${panel === "destination" ? activeField : ""}
            `}
        >
          <div
            className={`
                border-solid border-l-gray-C4CAD3 border-l-1 flex items-center gap-x-16 group-hover:border-l-none
                ${panel === "destination" ? "border-l-none" : ""}
              `}
          >
            <div className="w-full pl-8">
              <label
                id={`${uid}-destination-label`}
                htmlFor={`${uid}-destination`}
                className="block text-14 leading-20 text-black font-r mb-8 cursor-text"
              >
                شهر یا اقامتگاه مورد نظر
              </label>

              <DestinationCombobox
                inputId={`${uid}-destination`}
                labelId={`${uid}-destination-label`}
                // `id` is the parameter /search reads, so a no-JS GET submit
                // lands on real results instead of an empty page.
                inputName="id"
                value={destinationText}
                open={panel === "destination"}
                setOpen={(v) => setPanel(v ? "destination" : null)}
                onChange={(v) => {
                  setDestinationText(v);
                  // Typing after picking invalidates the pick.
                  setDestinationSlug("");
                  setDestinationHref(undefined);
                }}
                onSelect={(choice: DestinationChoice) => {
                  setDestinationSlug(choice.slug);
                  setDestinationHref(choice.href);
                  if (!choice.href) setPanel("dates");
                }}
                onSubmitFreeText={() => formRef.current?.requestSubmit()}
                placeholder="انتخاب مقصد"
                inputClassName="text-14 leading-20 text-black font-m placeholder:text-12 placeholder:leading-16 placeholder:font-r placeholder:text-gray-959FA7"
              />
            </div>
          </div>
        </div>

        {/* ---- dates ---- */}
        <div className="col-span-4">
          <div className="grid grid-cols-10">
            <button
              type="button"
              ref={datesTriggerRef}
              aria-expanded={panel === "dates"}
              aria-controls={`${uid}-dates`}
              aria-haspopup="dialog"
              onClick={() => setPanel((p) => (p === "dates" ? null : "dates"))}
              className={`
                  col-span-5 py-12 pr-16 flex items-center gap-x-16
                  ${fieldBase}
                  hover:bg-gray-airbnb hover:rounded-full
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:rounded-full
                  ${panel === "dates" && selectedRanges.length === 0 ? activeField : ""}
                `}
            >
              <span className="grow block">
                <span className="block text-14 leading-20 text-black font-r mb-8">تاریخ رفت</span>
                <span
                  className={
                    selectedRanges.length >= 1
                      ? "text-14 leading-20 text-black font-m"
                      : "text-12 leading-16 text-gray-959FA7 font-r"
                  }
                >
                  {selectedRanges.length >= 1
                    ? selectedRanges[0][0].format("jYYYY/jMM/jDD")
                    : "انتخاب تاریخ"}
                </span>
              </span>
            </button>

            <button
              type="button"
              ref={datesTriggerRef2}
              aria-expanded={panel === "dates"}
              aria-controls={`${uid}-dates`}
              aria-haspopup="dialog"
              onClick={() => setPanel((p) => (p === "dates" ? null : "dates"))}
              className={`
                  col-span-5 py-12 flex items-center pr-12
                  ${fieldBase}
                  hover:bg-gray-airbnb hover:rounded-full
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:rounded-full
                  ${panel === "dates" && selectedRanges.length === 1 ? activeField : ""}
                `}
            >
              <span className="grow pl-4 block">
                <span className="block text-14 leading-20 text-black font-r mb-8">تاریخ برگشت</span>
                <span
                  className={
                    hasRange
                      ? "text-14 leading-20 text-black font-m"
                      : "text-12 leading-16 text-gray-959FA7 font-r"
                  }
                >
                  {hasRange ? endValue : "انتخاب تاریخ"}
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* ---- guests + submit ---- */}
        <div
          className={`
group pl-12 py-12 col-span-3 hover:bg-gray-airbnb
rounded-tl-full rounded-bl-full hover:rounded-tr-full hover:rounded-br-full
transition-all duration-200
${panel === "guests" ? `${activeField} rounded-tr-full rounded-br-full` : ""}
`}
        >
          <div
            className={`
flex items-center justify-between
border-r-1 border-solid border-r-gray-C4CAD3 pr-16 group-hover:border-r-transparent
${panel === "guests" ? "border-r-transparent" : ""}
`}
          >
            <button
              type="button"
              ref={guestsTriggerRef}
              aria-expanded={panel === "guests"}
              aria-controls={`${uid}-guests`}
              aria-haspopup="dialog"
              onClick={() => setPanel((p) => (p === "guests" ? null : "guests"))}
              className="flex items-center gap-x-16 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:rounded-12"
            >
              <span className="block">
                <span className="block text-14 leading-20 text-black font-r mb-8">تعداد نفرات</span>
                <span
                  className={
                    numberOfPeople
                      ? "text-14 leading-20 text-black font-m"
                      : "text-12 leading-16 text-gray-959FA7 font-r"
                  }
                >
                  {numberOfPeople ? `${numberOfPeople} نفر` : "چند نفر هستید ؟"}
                </span>
              </span>
            </button>

            <button
              type="submit"
              className={`
       w-[44px] h-[44px] rounded-full flex items-center gap-x-12 bg-primary-main cursor-pointer
       overflow-x-hidden shrink-0
       transition-all duration-200
       hover:w-[123px] hover:pl-24 hover:pr-16 hover:justify-start
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-main
       ${panelIsOpen ? "!w-[123px] pl-24 pr-16" : "justify-center pr-12"}
`}
            >
              <i aria-hidden="true" className="icon-Search text-white text-24" />
              <span
                className={`
         text-16 leading-24 text-white font-m whitespace-nowrap
         transition-all duration-200
         ${panelIsOpen ? "w-auto" : "w-0"}
       `}
              >
                جستجو
              </span>
              {/* The label is always available to assistive tech, even while the
                  button is collapsed to an icon. */}
              <span className="sr-only">جستجو</span>
            </button>
          </div>
        </div>

        {/* Dates and guests ride along as hidden fields so a no-JS submit keeps
            them. The destination is the visible input above. */}
        {hasRange && (
          <>
            <input type="hidden" name="start" value={startValue} />
            <input type="hidden" name="end" value={endValue} />
          </>
        )}
        {!!numberOfPeople && <input type="hidden" name="guests_count" value={numberOfPeople} />}

        {panel === "destination" && (
          <OutsideClickHandler
            handleClick={closePanel}
            exceptionElementsRef={[destinationTriggerRef]}
          >
            <span />
          </OutsideClickHandler>
        )}

        {panel === "dates" && (
          <div
            id={`${uid}-dates`}
            role="dialog"
            aria-label="انتخاب تاریخ"
            className="absolute z-2 right-0 left-0 -bottom-8 translate-y-full"
          >
            <DoubleCalendar
              showDoubleCalendar
              setShowDoubleCalendar={(v: any) => setPanel(v ? "dates" : null)}
              selectedRanges={selectedRanges}
              setSelectedRanges={setSelectedRanges}
              dateToWorkWith={dateToWorkWith}
              setDateToWorkWith={setDateToWorkWith}
              discounted_days={[]}
              fast_days={[]}
              filled_dates={[]}
              noCoOperation={noCoOperation}
              peak_dates={[]}
              reserved_dates={[]}
              special_dates={[]}
              prices={{
                extra_guests_price: 0,
                monthly_discount: 0,
                peak_price: 0,
                week_price: 0,
                weekend_price: 0,
                weekly_discount: 0,
              }}
              onlyShowCalendarDateNumber={true}
              canOnlySelectOneRange={true}
              onSelectOfRangeEndCb={() => setPanel("guests")}
              outsideClickHandlerExceptionRefs={[datesTriggerRef, datesTriggerRef2]}
              showHeader={false}
              bottomActions={
                <div className="mt-16 flex items-center justify-between">
                  <Button
                    color="grey"
                    onClick={() => {
                      if (selectedRanges.length === 0) {
                        setPanel("guests");
                      } else {
                        setSelectedRanges([]);
                      }
                    }}
                  >
                    {selectedRanges.length === 0 ? "رد شدن" : "پاک کردن"}
                  </Button>

                  <Button
                    variant="outlined"
                    color="grey"
                    disabled={!hasRange}
                    onClick={() => {
                      if (hasRange) setPanel(null);
                    }}
                  >
                    تأیید تاریخ
                  </Button>
                </div>
              }
            />
          </div>
        )}

        {panel === "guests" && (
          <OutsideClickHandler handleClick={closePanel} exceptionElementsRef={[guestsTriggerRef]}>
            <div
              id={`${uid}-guests`}
              role="dialog"
              aria-label="تعداد نفرات"
              className="absolute left-0 -bottom-8 translate-y-full w-[296px] z-2"
            >
              <SelectNumberOfPeople
                numberOfPeople={numberOfPeople}
                setNumberOfPeople={setNumberOfPeople}
              />
            </div>
          </OutsideClickHandler>
        )}
      </div>
    </form>
  );
}

export default MainSearchBox;
