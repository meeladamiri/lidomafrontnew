interface I_ResLocationWithoutBreadCrumb {
  className: string;
  province: string;
  city: string;
  neighborhood?: string;
}

function ResLocationWithoutBreadCrumb({
  className,
  province,
  city,
  neighborhood,
}: I_ResLocationWithoutBreadCrumb) {
  return (
    <>
      <p
        className={`text-12 leading-14 text-gray-#57585C font-r OnlyOneLineAndEndWithElipsis ${className}`}
      >
        {province} ، {city}
        {!!neighborhood ? ` ، ${neighborhood}` : null}
      </p>
    </>
  );
}

export default ResLocationWithoutBreadCrumb;
