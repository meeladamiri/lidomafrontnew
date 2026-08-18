import moment from "moment-jalaali";

export function isInvalidDateToBeChosen(
  startDate: moment.Moment,
  endDate: moment.Moment,
  alreadyReservedDays: moment.Moment[],
  filledDays: moment.Moment[]
) {
  const pointer = startDate.clone();

  while (pointer.isBefore(endDate)) {
    const isAlreadyReserved = alreadyReservedDays.find((date) => date.isSame(pointer));
    const isFilledDay = filledDays.find((day) => day.isSame(pointer));

    if (!!isAlreadyReserved || !!isFilledDay) return true;

    pointer.add(1, "day");
  }

  return false;
}
