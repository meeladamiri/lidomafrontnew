import moment from "moment-jalaali";

export function determineSelectability(
  startDate: moment.Moment,
  currentDate: moment.Moment,
  filledDays: moment.Moment[],
  alreadyReservedDays: moment.Moment[]
) {
  // if (currentDate.isBefore(startDate)) return false;

  const pointer = startDate.clone().add(1, "day");

  let canBeSeleceted = true;
  // let numberOfReservedDaysOrFilledDays = 0;
  let numberOfReservedDaysOrFilledDaysVisited = 0;
  while (
    pointer.isSameOrBefore(currentDate) &&
    !!canBeSeleceted
    // && (
    //   numberOfReservedDaysOrFilledDays
    // )
  ) {
    if (numberOfReservedDaysOrFilledDaysVisited >= 1) {
      canBeSeleceted = false;
    } else {
      if (
        filledDays.find((day) => day.isSame(pointer)) ||
        alreadyReservedDays.find((day) => day.isSame(pointer))
      ) {
        numberOfReservedDaysOrFilledDaysVisited = numberOfReservedDaysOrFilledDaysVisited + 1;
        pointer.add(1, "day");
        // canBeSeleceted = false;
      } else {
        pointer.add(1, "day");
      }
    }
  }

  // while
  return canBeSeleceted;
}

// export function immediateFilledOrReservedDateOfSelecetdRangesFirstPoint(
//   selecetdRangesFirstPoint: moment.Moment,
//   filledDays: moment.Moment[],
//   alreadyReservedDays: moment.Moment[]
// ) {
//   let immediateFirstMatch = null;
//   const point = selecetdRangesFirstPoint.clone();

//   let i = 0;

//   // Possible inifinite loop --> in case there is no 'already reserved date' or 'filled date'.
//   // So, we limit this 'while' loop for at most 93 (3*31) iterations.
//   // Why 93? bcz the largest range the user can see in this app, is 3 months in row.
//   // And the biggest month has 31 days. so to fullfil all possibilities we go with 3 * 31 = 93;
//   while (!immediateFirstMatch && i < 93) {
//     if (
//       !!filledDays.find((el) => el.isSame(point)) ||
//       !!alreadyReservedDays.find((el) => el.isSame(point))
//     ) {
//       immediateFirstMatch = point.clone();
//     } else {
//       point.add(1, "day");
//       i = i + 1;
//     }
//   }

//   return immediateFirstMatch;
// }
