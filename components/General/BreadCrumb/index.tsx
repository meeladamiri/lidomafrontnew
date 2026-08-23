import Link from "next/link";

function BreadCrumb({
  proviceName,
  cityName,
  cityEn,
  proviceEn,
  neighborhood,
  resPureNameAlone,
  residenceId,
}: {
  cityEn: string;
  proviceEn: string;
  proviceName: string;
  cityName: string;
  neighborhood: string;
  resPureNameAlone: string; // for boomgardi, pass boomgardi_name;
  residenceId: number;
}) {
  return (
    <>
      <li>
        <Link passHref href="/" prefetch={false}>
          لیدوماتریپ
        </Link>
      </li>
      /
      <li>
        <Link passHref href={`/search/${proviceEn}`} prefetch={false}>
          {proviceName}
        </Link>
      </li>
      /
      <li>
        <Link passHref href={`/search/${cityEn}`} prefetch={false}>
          {cityName}
        </Link>
      </li>
      {/* one separator per segment — the previous markup emitted "/" twice,
          showing "شیراز / / نام اقامتگاه" */}
      {!!neighborhood && (
        <>
          /<li>{neighborhood}</li>
        </>
      )}
      {!!resPureNameAlone && (
        <>
          /<li>{resPureNameAlone}</li>
        </>
      )}
    </>
  );
}

export default BreadCrumb;
