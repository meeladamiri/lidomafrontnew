import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
// import { LinkButton } from "components/General/core/Button";
// import ReadonlyCancelRuleItem from "@/components/Residences/CancelRule/ReadonlyCancelRuleItem";
import Checkout, { WithFullname, WithKeyValue } from "components/General/Checkout";
import moment from "moment-jalaali";
import PolicyItem from "../ReserveCancellationPolicy/PolicyItem";

function MakeTitle({ title }: { title: string }) {
  return <p className="text-18 leading-31 text-black font-m">{title}</p>;
}

function MakeKey({ keyy, className }: { keyy: string; className?: string }) {
  return <p className={`text-16 leading-28 text-black font-l ${className || ""}`}>{keyy}</p>;
}

function MakeValue({ value, className }: { value: string; className?: string }) {
  return <p className={`text-16 leading-28 text-black font-m ${className || ""}`}>{value}</p>;
}

interface IFactorData {
  reserveCode: string | number;
  entranceDate: string;
  entranceDay: string;
  exitDate: string;
  exitDay: string;
  mainGuestsN: number;
  extraGuestsN?: number;
  duration: number;
  checkoutData: (WithFullname | WithKeyValue)[];
  checkoutTotal: number;
  reserveTotalDiscountAmount: number;
  remainingAmount: number;
  paidAmount: number;
  hostName: string;
  hostPhone: string;
  hostImage?: string;
  guestName: string;
  guestPhone: string;
  guestImage?: string;
  resImage: string;
  resName: string;
  roomName: string | undefined;
  province: string;
  city: string;
  fullAddress: string;
  resLat: number | string;
  resLong: number | string;
  bedRoomsN?: number;
  bedsN?: number;
  standardCapacity: number;
  maxCapacity: number;
  rules: { icon: JSX.Element; text: string }[];
  cancelReserveTitle: string;
  before_start_time: number;
  full_return_time: number;
  host_share_future_nights: number;
  host_share_past_nights: number;
  host_share_total_amount: number;
}

const FactorDesign = React.forwardRef<HTMLDivElement, { data: IFactorData }>((props, ref) => {
  const { data } = props;
  const [residenceImage, setResidenceImage] = useState(data?.resImage);
  // console.log("props", props);

  return (
    <div id="factorElement" ref={ref}>
      <div className="flex flex-col gap-y-24 bg-white p-64">
        {/* header */}
        <div className="flex items-center justify-between">
          <p className="text-24 leading-41 text-black font-b">فاکتور رزرو اقامتگاه</p>

          {/* <div className="flex items-center gap-x-24">
            <Link passHref href={"https://lidomatrip.com/"} prefetch={false}>
              <Image
                src={"/assets/logos/Lidoma-logo2.svg"}
                width={131}
                height={32}
                alt="لوگو لیدوماتریپ"
              />
            </Link>

            <p className="text-18 leading-31 text-black font-r">
              .پلتفرم یکپارچه رزرو آنلاین اقامتگاه در سراسر ایران، اقامت خوشی را برایتان آرزومند است
            </p>
          </div> */}
        </div>

        {/* body */}
        <div className="grid grid-cols-14 gap-x-24 grow">
          {/* right section */}
          <div className="col-span-4 border-1 border-solid border-primary-main rounded-tl-24 rounded-bl-24 flex rounded-tr-20 rounded-br-20">
            <div
              className="px-16 py-24 bg-primary-main rounded-tr-20 rounded-br-20 flex items-center gap-x-24"
              style={{ writingMode: "vertical-rl" }}
            >
              <Link passHref href={"https://lidomatrip.com/"} prefetch={false}>
                <Image
                  src={"/assets/logos/Logo-white-reverse-landscape.svg"}
                  width={32}
                  height={131}
                  alt="لوگو لیدوماتریپ"
                />
              </Link>

              <p className="text-18 leading-31 text-white font-r">
                .پلتفرم یکپارچه رزرو آنلاین اقامتگاه در سراسر ایران، اقامت خوشی را برایتان آرزومند
                است
              </p>
            </div>

            <div className="px-16 py-24 grow">
              <div className="pb-24 px-24 border-b-1 border-solid border-b-gray-D2D2D7 mb-24">
                <div className="mb-24">
                  <MakeTitle title="مشخصات رزرو" />
                </div>

                <div className="grid grid-cols-2 gap-y-12">
                  <div className="col-span-1">
                    <MakeKey keyy="کد رزرو :" />
                  </div>

                  <div className="col-span-1">
                    <MakeKey keyy="تاریخ صدور فاکتور :" />
                  </div>

                  <div className="col-span-1 w-fit px-12 py-4 bg-gray-F8F8F8 rounded-8">
                    <MakeValue value={data.reserveCode.toString()} />
                  </div>

                  <div className="col-span-1">
                    <MakeValue value={moment(new Date()).format("jYYYY/jMM/jDD")} />
                  </div>
                </div>
              </div>

              <div className="pb-24 px-24 border-b-1 border-solid border-b-gray-D2D2D7 mb-24">
                <div className="grid grid-cols-2 gap-y-12 mb-24">
                  <div className="col-span-1">
                    <MakeKey keyy="تاریخ ورود :" />
                  </div>

                  <div className="col-span-1">
                    <MakeKey keyy="تاریخ خروج :" />
                  </div>

                  <div className="col-span-1">
                    <div className="pl-46 mb-4 flex items-center justify-between">
                      <MakeValue value={data.entranceDate} />
                      <i className="icon-CalendarFlash text-24 text-black" />
                    </div>

                    <p className="text-14 leading-24 text-black font-l">{data.entranceDay}</p>
                  </div>

                  <div className="col-span-1">
                    <div className="mb-4">
                      <MakeValue value={data.exitDate} />
                    </div>

                    <p className="text-14 leading-24 text-black font-l">{data.exitDay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-12">
                  <div className="col-span-1">
                    <MakeKey keyy="تعداد نفرات :" />
                  </div>

                  <div className="col-span-1">
                    <MakeKey keyy="مدت اقامت :" />
                  </div>

                  <div className="col-span-1 flex items-center gap-x-4">
                    <MakeValue value={`${data.mainGuestsN} نفر`} />

                    {!!data.extraGuestsN && (
                      <p className="text-14 leading-20 text-gray-959FA7 font-r">
                        + {data.extraGuestsN} نفر اضافه
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <MakeValue value={`${data.duration} شب`} />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-24">
                  <MakeTitle title="جزئیات هزینه" />
                </div>

                <div>
                  <Checkout
                    data={data.checkoutData || []}
                    total={data.checkoutTotal}
                    showTotal={false}
                    n_of_discounted_special_days={0}
                    n_of_discounted_peak_days={0}
                    n_of_discounted_weekends={0}
                    n_of_discounted_normaldays={0}
                    totalDiscountAmount={data.reserveTotalDiscountAmount}
                  />

                  <div className="pt-12 mt-12 border-t-1 border-dashed border-t-gray-D2D2D7">
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-10 leading-18 font-r text-black">مجموع صورتحساب :</p>
                      <p className="text-12 leading-21 font-m text-black">
                        {data.checkoutTotal?.toLocaleString()} تومان
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-10 leading-18 font-r text-black">جمع مبلغ پرداخت شده :</p>
                      <p className="text-12 leading-21 font-m text-black">
                        {data.paidAmount?.toLocaleString()} تومان
                      </p>
                    </div>
                    <div className="flex items-center justify-between mb-8">
                      <p className="text-10 leading-18 font-r text-black">
                        مبلغ مانده جهت تحویل به میزبان :
                      </p>
                      <p className="text-12 leading-21 font-m text-black">
                        {data.remainingAmount?.toLocaleString()} تومان
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* left section */}
          <div className="col-span-10 flex flex-col">
            {/* top section */}
            <div className="py-24 px-24 border-1 border-solid border-gray-D2D2D7 rounded-24 grid grid-cols-2 mb-16">
              <div className="col-span-1 border-l-1 border-dashed border-gray-D2D2D7">
                <div className="mb-40">
                  <MakeTitle title="مشخصات میزبان" />
                </div>

                <div className="flex items-start gap-x-24">
                  <div className="w-64 h-64 shrink-0 relative">
                    {!!data.hostImage && (
                      <Image
                        src={
                          // data.hostImage ||
                          "/assets/default-profile.svg"
                        }
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-full"
                        alt="آواتار میزبان"
                      />
                    )}
                  </div>

                  <div className="grow grid grid-cols-2 gap-y-12">
                    <div className="col-span-1">
                      <MakeKey keyy="نام و نام خانوادگی :" />
                    </div>

                    <div className="col-span-1">
                      <MakeKey keyy="شماره موبایل :" />
                    </div>

                    <div className="col-span-1">
                      <MakeValue value={data.hostName} />
                    </div>

                    <div className="col-span-1">
                      <MakeValue value={data.hostPhone} className="text-info" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 pr-40">
                <div className="mb-40">
                  <MakeTitle title="مشخصات مهمان" />
                </div>

                <div className="flex items-start gap-x-24">
                  <div className="w-64 h-64 shrink-0 relative">
                    {!!data.guestImage && (
                      <Image
                        src={
                          // data.guestImage ||
                          "/assets/default-profile.svg"
                        }
                        fill
                        style={{ objectFit: "cover" }}
                        className="rounded-full"
                        alt="آواتار مهمان"
                      />
                    )}
                  </div>

                  <div className="grow grid grid-cols-2 gap-y-12">
                    <div className="col-span-1">
                      <MakeKey keyy="نام و نام خانوادگی :" />
                    </div>

                    <div className="col-span-1">
                      <MakeKey keyy="شماره موبایل :" />
                    </div>

                    <div className="col-span-1">
                      <MakeValue value={data.guestName} />
                    </div>

                    <div className="col-span-1">
                      <MakeValue value={data.guestPhone} className="text-info" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* middle section */}
            <div className="py-24 px-24 border-1 border-solid border-gray-D2D2D7 rounded-24 grow">
              <MakeTitle title="مشخصات اقامتگاه" />

              <div className="mt-24 pb-16 border-b-1 border-dashed border-b-gray-D2D2D7 mb-24 flex items-start gap-x-12">
                <div className="relative shrink-0 w-[249px] h-[249px]">
                  {!!data.resImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <Image
                      className="rounded-12"
                      src={residenceImage}
                      fill
                      style={{ objectFit: "cover" }}
                      alt=""
                      priority
                      // unoptimized
                      onError={() => setResidenceImage("/assets/res-placeholder.jpg")}
                      // crossOrigin="anonymous"
                    />
                  )}
                </div>

                <div className="grow">
                  <div className="flex gap-x-60 mb-12">
                    <div className="shrink-0">
                      <MakeKey keyy="نام اقامتگاه :" />

                      <div className="mt-12">
                        <MakeValue value={data.resName} />
                      </div>
                    </div>

                    {!!data.roomName && (
                      <div className="grow">
                        <MakeKey keyy="نام اتاق :" />

                        <div className="mt-12">
                          <MakeValue value={data.roomName} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <MakeKey keyy="آدرس :" />

                    <div className="mt-12 mb-12 text-14 leading-21 text-black font-r">
                      {data.province} - {data.city}
                    </div>

                    <MakeValue value={data.fullAddress} />

                    {/* {!!data.resLat && !!data.resLong && (
                      <LinkButton
                        // href={`google.navigation:q=${latToGo},${longToGo}`}
                        href={`google.navigation:q=${data.resLat},${data.resLong}`}
                        leftIcon={<i className="icon-FlashLeft text-24 text-black" />}
                        className="!pl-16 !pr-24 !py-10 mt-12"
                        color="grey"
                      >
                        مسیریابی روی نقشه
                      </LinkButton>
                    )} */}
                  </div>
                </div>
              </div>

              <div className="pb-16 border-b-1 border-dashed border-b-gray-D2D2D7 mb-24 flex gap-x-80">
                {!!data.bedRoomsN && (
                  <div className="">
                    <MakeKey keyy="تعداد اتاق خواب :" />

                    <div className="mt-12">
                      <MakeValue value={`${data.bedRoomsN} اتاق خواب`} />
                    </div>
                  </div>
                )}

                {!!data.bedsN && (
                  <div className="">
                    <MakeKey keyy="تعداد تخت خواب :" />

                    <div className="mt-12">
                      <MakeValue value={`${data.bedsN} تخت خواب`} />
                    </div>
                  </div>
                )}

                <div className="">
                  <MakeKey keyy="ظرفیت استاندارد :" />

                  <div className="mt-12">
                    <MakeValue value={`${data.standardCapacity} نفر`} />
                  </div>
                </div>

                <div className="">
                  <MakeKey keyy="حداکثر ظرفیت :" />

                  <div className="mt-12">
                    <MakeValue value={`${data.maxCapacity} نفر`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="col-span-1 border-l-1 border-dashed border-l-gray-D2D2D7 pl-24">
                  <MakeTitle title="مقررات اقامتگاه" />

                  <div className="mt-24">
                    {/* <ul className="text-16 leading-40 font-r text-black list-disc list-inside">
                      <li>زمان تحویل اقامتگاه: از ساعت 2 بعد از ظهر تا ساعت 12ظهر</li>
                      <li>زمان تخلیه اقامتگاه: ساعت 12ظهر</li>
                      <li> آوردن حیوانات خانگی به این اقامتگاه ممنوع است.</li>
                      <li>
                        استعمال دخانیات (سیگار, قلیان, ...) در فضاهای داخلی اقامتگاه ممنوع است.
                      </li>
                    </ul> */}

                    {data.rules.map((item, idx) => {
                      if (!item.text) return;

                      return (
                        <div className="flex items-center gap-x-8 mb-16 last:mb-0" key={idx}>
                          {item.icon}
                          <p className="text-14 leading-30 font-r text-zilgara">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="col-span-1 pr-24">
                  <MakeTitle title="قوانین لغو رزرو" />

                  <div className="mt-24">
                    {/* <ReadonlyCancelRuleItem
                      // mainTitle={data.cancelReserveTitle}
                      mainTitle="سیاست متعادل"
                      // fullReturnTime={!!data?.full_return_time ? Number(data?.full_return_time) : 0}
                      fullReturnTime={72}
                      beforeStartTime={
                        !!data?.before_start_time ? Number(data?.before_start_time) : 0
                      }
                      hostShareTotalAmount={
                        !!data?.host_share_total_amount ? Number(data?.host_share_total_amount) : 0
                      }
                      hostSharePastNights={
                        !!data?.host_share_past_nights ? Number(data?.host_share_past_nights) : 0
                      }
                      hostShareFutureNights={
                        !!data?.host_share_future_nights
                          ? Number(data?.host_share_future_nights)
                          : 0
                      }
                    /> */}
                    <PolicyItem
                      befor24="کسر مبلغ شب اول رزرو + 20% مابقی شب ها"
                      befor72="کسر 20% از مبلغ کل رزرو"
                      entry="کسر مبلغ دو شب اول رزرو (علاوه بر شب های سپری شده) و 20% از مابقی شب ها"
                      longtermReserve="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
                      peakDays="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-16">
            <p className="text-20 leading-34 text-black font-l">
              شماره تماس اضطراری پشتیبانی سایت :
            </p>
            <p className="text-20 leading-34 text-black font-m">09918003540</p>
          </div>

          <div className="flex items-center gap-x-60">
            <Link
              prefetch={false}
              passHref
              className="flex items-center gap-x-14"
              href="mailto:info@lidomatrip.com"
            >
              <p className="text-24 leading-40 text-black font-m">info@lidomatrip.com</p>

              <Image src="/assets/non-icomoon-icons/black-sms.svg" width={32} height={32} alt="" />
            </Link>

            <Link
              passHref
              prefetch={false}
              className="flex items-center gap-x-14"
              href={"https://lidomatrip.com/"}
              target="_blank"
            >
              <p className="text-24 leading-40 text-black font-m">www.lidomatrip.com</p>

              <Image src="/assets/non-icomoon-icons/web.svg" width={31} height={32} alt="" />
            </Link>

            <Link
              prefetch={false}
              passHref
              className="flex items-center gap-x-14"
              href={`tel:02191070021`}
            >
              <p className="text-36 leading-[60px] text-black font-b">021-91070021</p>

              <Image src="/assets/non-icomoon-icons/black-call.svg" width={31} height={31} alt="" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

FactorDesign.displayName = "Search";

export default FactorDesign;
