import moment from "moment-jalaali";

export function getPeakDays(
  peak_days: [
    string, // start of range --> ex: "2023/03/01"
    string // end of range --> ex: "2023/03/07"
  ][]
) {
  const allPeakDays: moment.Moment[] = [];

  for (const item of peak_days) {
    const start = moment(item[0], "YYYY-M-D");
    const end = moment(item[1], "YYYY-M-D");

    const pointer = start.clone();

    while (pointer.isSameOrBefore(end)) {
      allPeakDays.push(pointer.clone());

      pointer.add(1, "day");
    }
  }

  return allPeakDays;
}
