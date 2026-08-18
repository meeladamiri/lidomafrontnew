
export function getNumberOfSelectedResidencesOrRooms({
  selectedResidences,
  selectedRooms,
}: {
  selectedResidences: string | string[];
  selectedRooms: string | string[];
}) {
  let numberOfSelectedResidencesOrRooms = 0
  if(typeof selectedResidences === "string" || typeof selectedRooms === "string") {
    numberOfSelectedResidencesOrRooms = numberOfSelectedResidencesOrRooms + 1
  }
  else(
    numberOfSelectedResidencesOrRooms = selectedResidences.length + selectedRooms.length
  )
  
  return numberOfSelectedResidencesOrRooms
}
