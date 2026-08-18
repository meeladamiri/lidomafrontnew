export function getPropertyPageUrl({
  residenceId,
  startDate,
  endDate,
  guestsCount,
}: {
  residenceId: number;
  startDate?: string;
  endDate?: string;
  guestsCount?: string;
}) {
  return `/rentals/${residenceId}${
    startDate && endDate ? `?start=${startDate}&end=${endDate}` : ""
  }${
    guestsCount && startDate && endDate
      ? `&guests_count=${guestsCount}`
      : guestsCount
      ? `?guests_count=${guestsCount}`
      : ""
  }`;
}
