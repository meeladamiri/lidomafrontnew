export function getAllUniqueSelectedDays_Array(
  selectedIndividualDays: moment.Moment[],
  selectedRanges: [moment.Moment, moment.Moment | null][]
) {
  // NOTE_1: For now, it is possible for the user to select days in a way that 'selectedIndividualDays' and 'selectedRanges'
  //         will have overlapping days in common. This results in wrong calculation of 'numberOfAllSelectedDays', if there is overlap between these two.
  //         To fixed this, I am trying to format 'Moment.moment' objects in 'selectedIndividualDays' and 'selectedRanges' and the remove repeated days by
  //         taking advantage of 'Set' in JS.
  // NOTE_2: If in future, the developer prevents user from selecting a range which include a 'selectedIndividualDay',
  //         This solution still works.

  const selectedIndividualDays_formatted = selectedIndividualDays.map((item) =>
    item.format("jYYYY/jMM/jDD")
  );

  const selectedRanges_formatted = selectedRanges.map((el) => {
    const arr = [];

    let currntDay: moment.Moment = el[0].clone();

    while (currntDay.isSameOrBefore(el[1])) {
      arr.push(currntDay.format("jYYYY/jMM/jDD"));
      currntDay.add(1, "day");
    }

    //   console.log("arr", arr);

    return arr;
  });

  const selectedRanges_formatted_flettened = selectedRanges_formatted.flat(1);

  // console.log("selectedRanges_formatted_flettened", selectedRanges_formatted_flettened);

  const allUniqueSelectedDays_Set = new Set([
    ...selectedIndividualDays_formatted,
    ...selectedRanges_formatted_flettened,
  ]);

  const allUniqueSelectedDays_Array = [...allUniqueSelectedDays_Set];

  return allUniqueSelectedDays_Array;
}
