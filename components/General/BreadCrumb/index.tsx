import Link from "next/link";

/**
 * The residence page's trail: لیدوماتریپ › استان › شهر › محله › نام اقامتگاه.
 *
 * Every step is conditional. The province and city used to render
 * unconditionally, so a listing missing either produced an empty link and a
 * dangling separator — "لیدوماتریپ / / / نام اقامتگاه". (They were always
 * missing, in fact: the mapper behind them was reading a field the backend
 * does not send. See api/observe.ts.)
 */
function BreadCrumb({
  proviceName,
  cityName,
  cityEn,
  proviceEn,
  neighborhood,
  resPureNameAlone,
}: {
  cityEn: string;
  proviceEn: string;
  proviceName: string;
  cityName: string;
  neighborhood: string;
  resPureNameAlone: string; // for boomgardi, pass boomgardi_name;
  residenceId: number;
}) {
  const linkClass =
    "inline-flex min-h-[32px] items-center rounded-8 px-8 text-13 leading-20 font-r text-gray-6C6A7D transition-colors hover:bg-gray-F5F5F7 hover:text-primary-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main";
  const plainClass =
    "inline-flex min-h-[32px] items-center px-8 text-13 leading-20 font-r text-gray-6C6A7D";

  const steps: { key: string; node: JSX.Element }[] = [
    {
      key: "home",
      node: (
        <Link passHref href="/" prefetch={false} className={`group ${linkClass} gap-x-6`}>
          <i
            aria-hidden="true"
            className="icon-Home text-16 text-gray-B0AFBC transition-colors group-hover:text-primary-main"
          />
          لیدوماتریپ
        </Link>
      ),
    },
  ];

  if (proviceName && proviceEn) {
    steps.push({
      key: "province",
      node: (
        <Link passHref href={`/search/${proviceEn}`} prefetch={false} className={linkClass}>
          {proviceName}
        </Link>
      ),
    });
  }

  if (cityName && cityEn) {
    steps.push({
      key: "city",
      node: (
        <Link passHref href={`/search/${cityEn}`} prefetch={false} className={linkClass}>
          {cityName}
        </Link>
      ),
    });
  }

  if (neighborhood) {
    steps.push({ key: "neighborhood", node: <span className={plainClass}>{neighborhood}</span> });
  }

  if (resPureNameAlone) {
    steps.push({
      key: "residence",
      node: (
        // The page you are already on: named for assistive tech, not a link.
        <span
          aria-current="page"
          className="inline-flex min-h-[32px] max-w-[240px] items-center truncate rounded-8 bg-primary-main bg-opacity-[6%] px-10 text-13 leading-20 font-m text-black"
          title={resPureNameAlone}
        >
          {resPureNameAlone}
        </span>
      ),
    });
  }

  return (
    <>
      {steps.map((step, i) => (
        <li key={step.key} className="flex items-center">
          {step.node}
          {i < steps.length - 1 && (
            // The chevron points right-to-left, the way the line is read.
            <i aria-hidden="true" className="icon-FlashLeft mx-2 text-16 text-gray-CACFD3" />
          )}
        </li>
      ))}
    </>
  );
}

export default BreadCrumb;
