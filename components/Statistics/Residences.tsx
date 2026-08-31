import CustomRating from "components/General/Rating/CustomRating";
import PageTitle from "components/General/PageTitle";
import UnHappyMessage from "components/General/UnHappyMessage";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import moment from "moment-jalaali";
import { useQuery } from "@tanstack/react-query";
import { getResidencesStatistics } from "api/ResidencesStatistics";
import DropDown from "components/General/core/DropDown";
import { TinyLoader } from "components/General/Loader/TinyLoader";
import { useRouter } from "next/router";
import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import {
  IServerResidence,
  IServerRoom,
  getResidencesList,
} from "@/api/Residences/getResidencesList";
import dynamic from "next/dynamic";
const PieChart = dynamic(
  () => import("react-minimal-pie-chart").then((module) => module.PieChart),
  {
    ssr: true,
  }
);

function ScoreItem({ name, score, customMb }: { name: string; score: number; customMb?: string }) {
  return (
    <div className={`flex items-center justify-between ${customMb || ""}`}>
      <p className="text-12 leading-21 text-black font-l">{name}</p>
      <div className="flex items-center gap-x-2">
        <p className="text-12 leading-21 text-black font-l">{`(${faDigits(score)})`}</p>
        <Image
          src={"/assets/non-icomoon-icons/full-star.svg"}
          width={12}
          height={12}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
    </div>
  );
}

function Cart({
  value,
  title,
  subText,
  imgSrc,
  iconSrc,
}: {
  value: number | string;
  title: string;
  subText: string;
  imgSrc?: string;
  iconSrc?: string;
}) {
  return (
    <div className="flex items-center gap-x-12">
      <div className="bg-gray-F5F9FF w-56 h-56 flex items-center justify-center relative">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            className="rounded-4"
            fill
            sizes="100vw"
            style={{
              objectFit: "cover",
            }}
          />
        ) : (
          <i className={`${iconSrc} text-28 text-black`} />
        )}
      </div>
      <div className="">
        <p className="text-14 leading-24 text-black font-r mb-8">{title}</p>
        <p className="text-14 leading-24 text-black font-r">{subText}</p>
      </div>
    </div>
  );
}

interface IMonthPoint {
  month: string;
  nights: number;
  income: number;
  reservations: number;
  views: number;
}

interface IResidencesStatistics {
  average_income: number;
  cleaning_rate: number;
  confirmed_reserves: number;
  delivery_rate: number;
  greeting_rate: number;
  integrity_rate: number;
  location_rate: number;
  quality_rate: number;
  rejected_reserves: number;
  reviews_count: number;
  succeed_reserves: number;
  total_days: number;
  total_income: number;
  total_reserves: number;

  // Added when the backend learned to answer them. All optional, so a stale
  // cached response cannot crash the page.
  average_rating?: number;
  rating_spread?: Record<string, number>;
  cancelled_reserves?: number;
  pending_reserves?: number;
  expired_reserves?: number;
  favourites?: number;
  views?: { last_year: number; last_month: number; tracking_since: string | null };
  nights?: { total: number; last_year: number; last_month: number };
  income?: { total: number; monthly_average: number; last_year: number };
  monthly?: IMonthPoint[];
  daily?: { date: string; nights: number; views: number }[];
}

const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const faDigits = (v: string | number) =>
  String(v).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

/**
 * The Jalali month index of a `YYYY-MM` key.
 *
 * Mid-month, so the conversion cannot land on the neighbouring month at a
 * boundary — the 1st of a Gregorian month is sometimes the previous Jalali one.
 */
function jMonthOf(key: string): number {
  return moment(key + "-15", "YYYY-MM-DD").jMonth();
}

/** «۱۲٫۴ م» — a chart label has no room for nine digits. */
function shortMoney(n: number): string {
  if (n >= 1_000_000_000) return faDigits(Math.round(n / 100_000_000) / 10) + " میلیارد";
  if (n >= 1_000_000) return faDigits(Math.round(n / 100_000) / 10) + " م";
  if (n >= 1_000) return faDigits(Math.round(n / 1000)) + " هزار";
  return faDigits(n);
}

/**
 * Twelve bars, in divs.
 *
 * Deliberately not a chart library: this is one series over twelve points on a
 * page that already ships react-minimal-pie-chart for its one donut.
 */
function MonthBars({
  points,
  format,
  emptyText,
}: {
  points: { key: string; label: string; value: number }[];
  format: (n: number) => string;
  emptyText: string;
}) {
  const max = Math.max(...points.map((p) => p.value), 0);

  if (max === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-12 leading-21 text-gray-959FA7 font-l">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-x-4 h-[120px]" dir="ltr">
      {points.map((p) => (
        <div key={p.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
          <span className="text-9 leading-12 text-gray-959FA7 mb-2 whitespace-nowrap">
            {p.value > 0 ? format(p.value) : ""}
          </span>
          <div
            title={p.label + ": " + format(p.value)}
            style={{ height: Math.max(2, (p.value / max) * 100) + "%" }}
            className={"w-full rounded-t-4 " + (p.value > 0 ? "bg-primary-main" : "bg-gray-E5E5E6")}
          />
          <span className="text-9 leading-12 text-gray-959FA7 mt-4 truncate w-full text-center">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResidencesStatistics() {
  const router = useRouter();
  const [data, setData] = useState<IResidencesStatistics>();

  const [residencesList, setResidencesList] = useState<IServerResidence[]>();

  const [selectedResidenceValue, setSelectedResidenceValue] = useState(0); // will be id of residence
  const [eligibleRoomsToBeListed, setEligibleRoomsToBeListed] = useState<IServerRoom[]>();

  const {
    data: residencesData,
    isSuccess: residencesIsSuccess,
    isLoading: residencesIsLoading,
  } = useQuery(["getResidencesList"], () => getResidencesList());

  const {
    isSuccess,
    isLoading,
    data: statisticsData,
  } = useQuery(["getResidencesStatistics", selectedResidenceValue], () =>
    getResidencesStatistics(selectedResidenceValue || "all")
  );

  useEffect(() => {
    if (!!statisticsData) {
      // console.log(
      //   "In success of getResidencesStatistics, data is: ",
      //   statisticsData
      // );
      setData(statisticsData?.params);
    }
  }, [statisticsData]);

  useEffect(() => {
    if (!!residencesData) {
      if (residencesData?.status === "success") {
        const allResidences: IServerResidence[] = residencesData?.params?.residences;
        setResidencesList(allResidences);

        // setAllRoomsList(parsedData?.params?.rooms);

        const allRooms: IServerRoom[] = residencesData?.params?.rooms;
        setEligibleRoomsToBeListed(
          allRooms.filter(
            (room) => allResidences.find((res) => res.id === room.parent_id)?.res_type !== "suit"
          )
        );
      }
    }
  }, [residencesData]);

  function getMeanScore() {
    // `average_rating` is the mean of the per-review averages the backend
    // stores. Averaging the six category means instead weights a category
    // nobody scored the same as one everybody did.
    if (data?.average_rating) return data.average_rating;

    const scoresSum =
      (data?.location_rate || 0) +
      (data?.cleaning_rate || 0) +
      (data?.quality_rate || 0) +
      (data?.integrity_rate || 0) +
      (data?.greeting_rate || 0) +
      (data?.delivery_rate || 0);

    const meanScore = scoresSum / 6;

    return Number(meanScore.toFixed(1));
  }

  useEffect(() => {
    if (router.isReady) {
      if (router.query.residenceId) {
        setSelectedResidenceValue(Number(router.query.residenceId));
      }
    }
  }, [router?.isReady, router?.query?.residenceId]);

  return (
    <div className="pb-40 ">
      <PageTitle
        title="آمار اقامتگاه ها"
        icon={<i className="icon-Amaar text-24" />}
        containerClassname="mb-16"
      />

      {residencesIsLoading ? (
        <TinyLoader />
      ) : (
        <>
          <div className="mb-28">
            {((!!residencesList && !!residencesList.length) ||
              (!!eligibleRoomsToBeListed && !!eligibleRoomsToBeListed.length)) && (
              <DropDown
                currntValue={selectedResidenceValue}
                onChange={(e, value) => {
                  // setSelectedResidenceValue(value as number);
                  router.push(`/statistics/residences?residenceId=${value}`);
                }}
              >
                {[
                  <Cart
                    key={new Date().getMilliseconds()}
                    value={0}
                    title={"انتخاب همه اقامتگاه ها"}
                    subText={`${
                      (residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) || [])
                        .length + (eligibleRoomsToBeListed || []).length
                    } اقامتگاه`}
                    iconSrc={"icon-LocationHome"}
                  />,
                  ...(
                    residencesList?.filter((r) => r.state === ResidenceStates_enum.ACTIVE) || []
                  )?.map((residence: any, index: number) => {
                    return (
                      <Cart
                        key={index}
                        value={residence?.id}
                        title={residence?.name}
                        subText={`کد اقامتگاه : ${residence?.reference}`}
                        imgSrc={residence?.image_url}
                        // type={ResidenceTypes_enum.PRODUCT}
                      />
                    );
                  }),
                  ...(eligibleRoomsToBeListed || []).map((room: any, index: number) => {
                    return (
                      <Cart
                        key={index}
                        value={room.id}
                        title={room.name}
                        subText={`کد اتاق : ${room.id}`}
                        imgSrc={room.image_url}
                        // type={ResidenceTypes_enum.ROOM}
                      />
                    );
                  }),
                ]}
              </DropDown>
            )}
          </div>

          {/* "Has this listing done anything yet" — checked against the numbers
              that mean activity, not against every key. The payload now also
              carries objects and arrays (views, monthly, income), which are
              truthy even when empty, so `Object.values(...).every(...)` would
              silently never be true again and a brand-new host would be shown
              a page of zeros instead of being told there is nothing yet. */}
          {!!data &&
          ![
            data.total_reserves,
            data.total_days,
            data.total_income,
            data.reviews_count,
            data.favourites ?? 0,
            data.views?.last_year ?? 0,
          ].some(Boolean) ? (
            <div className="pt-64">
              <UnHappyMessage title="هنوز آماری ثبت نشده !" iconSrc="/assets/No-residance.svg" />
            </div>
          ) : (
            <>
              <PageTitle
                title="آمار رزرو"
                icon={<i className="icon-Reserve text-24" />}
                containerClassname="mb-16"
              />
              <div className="p-16 grid grid-cols-3 gap-x-21 rounded-10 typical-gray-bg">
                <div className="col-span-2">
                  <div className="flex items-center justify-between gap-x-8 text-black text-12 leading-21 font-m mb-24">
                    <p>تعداد کل درخواست های رزرو</p>
                    <p>{faDigits(data?.total_reserves ?? 0)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-x-8 text-black text-12 leading-21 font-r mb-8">
                    <div className="flex items-center gap-x-8">
                      <div className="w-16 h-16 rounded-full bg-primary-main" />
                      <p>تعداد رزرو های تأیید شده</p>
                    </div>

                    <p>{faDigits(data?.confirmed_reserves ?? 0)}</p>
                  </div>

                  <div className="flex items-center justify-between gap-x-8 text-black text-12 leading-21 font-r mb-8">
                    <div className="flex items-center gap-x-8">
                      <div className="w-16 h-16 rounded-full bg-warning" />
                      <p>تعداد رزرو های رد شده</p>
                    </div>
                    <p>{faDigits(data?.rejected_reserves ?? 0)}</p>
                  </div>

                  {/* Cancellations used to be counted as rejections, which
                      reads as "you turned these down" when it usually means
                      the guest cancelled. Separate numbers, separate rows. */}
                  <div className="flex items-center justify-between gap-x-8 text-black text-12 leading-21 font-r mb-8">
                    <div className="flex items-center gap-x-8">
                      <div className="w-16 h-16 rounded-full bg-[#FF6B6B]" />
                      <p>تعداد رزرو های لغو شده</p>
                    </div>
                    <p>{faDigits(data?.cancelled_reserves ?? 0)}</p>
                  </div>

                  {!!data?.pending_reserves && (
                    <div className="flex items-center justify-between gap-x-8 text-black text-12 leading-21 font-r mb-8">
                      <div className="flex items-center gap-x-8">
                        <div className="w-16 h-16 rounded-full bg-gray-C4CAD3" />
                        <p>در انتظار تایید شما</p>
                      </div>
                      <p>{faDigits(data?.pending_reserves ?? 0)}</p>
                    </div>
                  )}
                </div>
                <div className="col-span-1">
                  <div className="w-full h-full">
                    <PieChart
                      animate
                      animationDuration={500}
                      animationEasing="ease-out"
                      data={[
                        {
                          title: "Rejected",
                          value: (data?.rejected_reserves || 0) + (data?.cancelled_reserves || 0),
                          color: "#FFC120",
                        },
                        {
                          title: "Accepted",
                          value: data?.confirmed_reserves || 0,
                          color: "#03D6BB",
                        },
                      ]}
                      lineWidth={25}
                      startAngle={270}
                      label={({ x, y, dx, dy, dataEntry }) => {
                        if (dataEntry.title === "Accepted") {
                          return (
                            <text
                              x={x}
                              y={y}
                              dx={dx}
                              dy={dy}
                              dominantBaseline="central"
                              textAnchor="middle"
                              style={{
                                fontSize: "16px",
                                fontFamily: "sans-serif",
                              }}
                            >
                              <tspan
                                x={x}
                                y={y}
                                dx={dx}
                                dy={-10}
                                className="text-14 leading-24 font-m text-black"
                              >
                                ٪{faDigits(Math.round(dataEntry.percentage))}
                              </tspan>
                              <tspan
                                x={x}
                                y={y}
                                dx={dx}
                                dy={15}
                                className="text-10 font-r text-black"
                              >
                                تایید رزرو
                              </tspan>
                            </text>
                          );
                        }
                        return null;
                      }}
                      labelPosition={0}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-10 mt-12 mb-28">
                <div className="p-12 flex items-center gap-x-8 justify-center rounded-6 typical-gray-bg">
                  <span className="text-12 leading-21 text-black font-r">رزرو های قطعی : </span>
                  <span className="text-14 leading-24 text-black font-m">
                    {faDigits(data?.succeed_reserves ?? 0)}
                  </span>
                </div>

                <div className="p-12 flex items-center gap-x-8 justify-center rounded-6 typical-gray-bg">
                  <span className="text-12 leading-21 text-black font-r">تعداد شب رزرو :</span>
                  <span className="text-14 leading-24 text-black font-m">{faDigits(data?.total_days ?? 0)}</span>
                </div>
              </div>
              <PageTitle
                title="آمار درآمد"
                icon={<i className="icon-Pay text-24" />}
                containerClassname="mb-16"
              />
              <div className="p-16 rounded-10 mb-26 typical-gray-bg">
                <div className="flex items-center justify-between pb-12 border-b-1 border-solid border-[rgba(28,52,84,0.26)]">
                  <p className="text-16 font-r text-black">درآمد کل اقامتگاه</p>
                  <p className="text-16 font-m text-black">
                    {(data?.total_income ?? 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>

                <div className="flex items-center justify-between pt-12">
                  <p className="text-16 font-r text-black">میانگین درآمد در ماه</p>
                  <p className="text-16 font-m text-black">
                    {(data?.average_income ?? 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>
              </div>
              {!!data?.monthly?.length && (
                <>
                  <div className="p-16 rounded-10 mb-26 typical-gray-bg">
                    <p className="text-14 leading-24 text-black font-m mb-12">
                      درآمد ماهانه — ۱۲ ماه اخیر
                    </p>
                    <MonthBars
                      points={data.monthly.map((m) => ({
                        key: m.month,
                        label: JALALI_MONTHS[jMonthOf(m.month)],
                        value: m.income,
                      }))}
                      format={shortMoney}
                      emptyText="در ۱۲ ماه اخیر درآمدی ثبت نشده"
                    />
                  </div>

                  <div className="p-16 rounded-10 mb-26 typical-gray-bg">
                    <p className="text-14 leading-24 text-black font-m mb-12">
                      شب اقامت ماهانه — ۱۲ ماه اخیر
                    </p>
                    <MonthBars
                      points={data.monthly.map((m) => ({
                        key: m.month,
                        label: JALALI_MONTHS[jMonthOf(m.month)],
                        value: m.nights,
                      }))}
                      format={(n) => faDigits(n)}
                      emptyText="در ۱۲ ماه اخیر شب اقامتی ثبت نشده"
                    />
                  </div>
                </>
              )}

              <PageTitle
                title="بازدید و علاقه‌مندی"
                icon={<i className="icon-See text-24" />}
                containerClassname="mb-16"
              />
              <div className="p-16 rounded-10 mb-26 typical-gray-bg">
                <div className="grid grid-cols-3 gap-x-10 mb-12">
                  <div className="text-center">
                    <p className="text-20 leading-32 text-black font-m">
                      {faDigits(data?.views?.last_month ?? 0)}
                    </p>
                    <p className="text-12 leading-21 text-gray-959FA7 font-l">بازدید ۳۰ روز اخیر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-20 leading-32 text-black font-m">
                      {faDigits(data?.views?.last_year ?? 0)}
                    </p>
                    <p className="text-12 leading-21 text-gray-959FA7 font-l">بازدید ۱۲ ماه اخیر</p>
                  </div>
                  <div className="text-center">
                    <p className="text-20 leading-32 text-black font-m">
                      {faDigits(data?.favourites ?? 0)}
                    </p>
                    <p className="text-12 leading-21 text-gray-959FA7 font-l">
                      افزودن به علاقه‌مندی
                    </p>
                  </div>
                </div>

                {/* Said plainly, because a flat line here would otherwise read
                    as "nobody visits your listing". */}
                <p className="text-11 leading-18 text-gray-959FA7 font-l pt-10 border-t-1 border-solid border-[rgba(28,52,84,0.16)]">
                  شمارش بازدید به‌تازگی راه افتاده است. ماه‌های پیش از شروع شمارش اندازه‌گیری
                  نشده‌اند.
                </p>

                {!!data?.monthly?.length && (
                  <div className="mt-14">
                    <MonthBars
                      points={data.monthly.map((m) => ({
                        key: m.month,
                        label: JALALI_MONTHS[jMonthOf(m.month)],
                        value: m.views,
                      }))}
                      format={(n) => faDigits(n)}
                      emptyText="هنوز بازدیدی شمرده نشده"
                    />
                  </div>
                )}
              </div>

              <PageTitle
                title="میانگین امتیاز"
                icon={<i className="icon-Star text-24" />}
                containerClassname="mb-16"
              />
              <div className="p-12 typical-gray-bg grid grid-cols-12 gap-x-10 rounded-12">
                <div className="col-span-5 pl-10 border-l-1 border-l-[]">
                  <p className="text-48 leading-84 text-black text-center mb-4">{faDigits(getMeanScore())}</p>
                  <div className="flex justify-center">
                    <CustomRating percentage={getMeanScore()} />
                  </div>

                  <p className="text-14 leading-24 text-black font-l mb-12 text-center">
                    میانگین امتیاز
                  </p>
                  {data?.reviews_count !== 0 && (
                    <div className="bg-white py-4 px-12 rounded-8 text-14 leading-24 text-black font-m text-center">
                      {faDigits(data?.reviews_count ?? 0)} نظر ثبت شده
                    </div>
                  )}
                </div>
                <div className="col-span-7 flex flex-col justify-between">
                  <ScoreItem name="موقعیت مکانی" score={data?.location_rate || 0} customMb="mb-4" />
                  <ScoreItem
                    name="نظافت اقامتگاه"
                    score={data?.cleaning_rate || 0}
                    customMb="mb-4"
                  />
                  <ScoreItem
                    name="کیفیت نسبت به نرخ"
                    score={data?.quality_rate || 0}
                    customMb="mb-4"
                  />
                  <ScoreItem name="صحت مطالب" score={data?.integrity_rate || 0} customMb="mb-4" />
                  <ScoreItem
                    name="برخورد میزبان"
                    score={data?.greeting_rate || 0}
                    customMb="mb-4"
                  />
                  <ScoreItem name="نحوه تحویل" score={data?.delivery_rate || 0} />
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ResidencesStatistics;
