export function determineResidenceTypeFromUrl(asPath: string) {
  const residenceType = asPath.startsWith("/search/city")
    ? "suit"
    : asPath.startsWith("/boomgardi")
    ? "boomgardi"
    : asPath.startsWith("/hotel")
    ? "hotel"
    : undefined;

  return residenceType;
}
