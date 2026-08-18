import Moment from "moment-jalaali";
import { getAllUniqueSelectedDays_Array } from "./calendar/getAllUniqueSelectedDays_Array";

Moment.loadPersian({ dialect: "persian-modern" });
Moment.locale("fa-IR");

export function durationToHuman(duration: any) {
  return Moment.duration(duration, "seconds").humanize();
}

export function momentToJalaliWithTime(moment = new (Moment as any)()) {
  return moment.format("hh:mm - jYYYY/jMM/jDD");
}

export function momentToJalaliWithTime2(moment = new (Moment as any)()) {
  return moment.format("jYYYY/jMM/jDD - hh:mm");
}

export function momentToJalaliWithTime3(moment = new (Moment as any)()) {
  return moment.format("HH:mm - jYYYY/jMM/jDD");
}

export function momentToJalali(moment: moment.Moment) {
  return moment.format("jYYYY/jMM/jDD");
}

export function momentToSpecialJalali(moment = new (Moment as any)()) {
  return moment.format("dddd jD jMMMM jYYYY ، HH:mm");
}

export function momentToRegular(moment = new (Moment as any)()) {
  return moment.format("YYYY/MM/DD");
}

export function momentToRegularWithTime(moment = new (Moment as any)()) {
  return moment.format("hh:mm - YYYY/MM/DD");
}

export function momentToReqgularTime(moment = new (Moment as any)()) {
  return moment.format("hh:mm");
}

export function momentToReqgularTimeWithSecound(moment = new (Moment as any)()) {
  return moment.format("hh:mm:ss");
}

export function momentToRegularWithTimeSwapped(moment = new (Moment as any)()) {
  return moment.format("jYYYY-jMM-jDD hh:mm:ss");
}

export function momentToFullYearNumberFullMonthname(moment = new (Moment as any)()) {
  return moment.format("jMMMM jYYYY");
}

export function momentToFullYearNumberFullMonthnameWithDayNumber(moment = new (Moment as any)()) {
  return moment.format("jDD jMMMM jYYYY");
}

export function miladiToJalali(date?: string | Date | moment.Moment) {
  return momentToJalali(Moment(date));
}

export function miladiToJalaliSpecial(date: string) {
  return momentToSpecialJalali(Moment(date));
}

export function miladiToJalaliReqgularTime(date: string) {
  return momentToReqgularTime(Moment(date));
}

export function miladiToJalaliWithTime(date: string) {
  return momentToJalaliWithTime(Moment(date));
}

export function miladiToJalaliWithTime2(date: string) {
  return momentToJalaliWithTime2(Moment(date));
}

export function miladiToJalaliWithTimeSwapped(date: string) {
  return momentToRegularWithTimeSwapped(Moment(date));
}

export function miladiToJalaliFullYearNumberFullMonthname(date: string | Date | moment.Moment) {
  return momentToFullYearNumberFullMonthname(Moment(date));
}

export function miladiToJalaliFullYearNumberFullMonthnameWithDayNumber(
  date: string | Date | moment.Moment
) {
  return momentToFullYearNumberFullMonthnameWithDayNumber(Moment(date));
}

export function dateToMoment(date: string) {
  return new (Moment as any)(date);
}

export function getNumberOfDaysFromD1ToD2BothInclusive(d1: moment.Moment, d2: moment.Moment) {
  const daysFromBeginingOfRangeTillEndOfRangeBothInclusive_Arr = getAllUniqueSelectedDays_Array(
    [],
    [[d1, d2]]
  );

  return daysFromBeginingOfRangeTillEndOfRangeBothInclusive_Arr.length;
}

export function getDiffFromNowUnix(time: any) {
  const now = new (Moment as any)();
  return time - now.unix();
}

export const getFirstDayOfMonthInShamsiAbbr = (moment: string | Date | moment.Moment) => {
  if (!moment) moment = new (Moment as any)();

  return Moment(moment).startOf("jMonth").format("dd");
};

export const getFirstDayOfMonthInShamsiFull = (moment = new (Moment as any)()) => {
  return Moment(moment).startOf("jMonth").format("dddd");
};

export const getNumberOfDaysInMonth = (moment: string | Date | moment.Moment) => {
  if (!moment) moment = new (Moment as any)();

  const dateArray: string[] = miladiToJalali(moment).split("/");
  const shamsiYear: string = dateArray[0];
  const shamsiMonth: string = dateArray[1];

  return Moment.jDaysInMonth(
    Number(shamsiYear),
    Number(shamsiMonth) - 1 // In Js, months are indexed from 0;
  );
};

export const isLeapYear = (moment = new (Moment as any)()) => {
  return Moment.jIsLeapYear(Number(miladiToJalali(moment).split("/")[0]));
};

// Another way;
// export const getNumberOfDaysInMonth = (moment = new (Moment as any)()) => {
//   const dateArray: string[] = miladiToJalali(moment).split("/");
//   // const shamsiYear: string = dateArray[0];
//   const shamsiMonth: string = dateArray[1];

//   const isLeap = isLeapYear(moment);

//   if (isLeap && Number(shamsiMonth) === 12) return 30;
//   else if (!isLeap && Number(shamsiMonth) === 12) return 29;
//   else {
//     if (Number(shamsiMonth) < 7) return 31;
//     else return 30;
//   }
// };
