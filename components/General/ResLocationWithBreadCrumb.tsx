import BreadCrumb from "./BreadCrumb";

interface IResLocationWithBreadCrumb {
  province: string;
  cityEn: string;
  proviceEn: string;
  city: string;
  neighborhood: string;
  resPureNameAlone: string; // for boomgardi, pass boomgardi_name;
  residenceId: number;
}

function ResLocationWithBreadCrumb({
  province,
  city,
  cityEn,
  proviceEn,
  neighborhood,
  resPureNameAlone,
  residenceId,
}: IResLocationWithBreadCrumb) {
  return (
    <nav aria-label="مسیر صفحه" className="inline-flex max-w-full">
      <ol className="flex flex-wrap items-center gap-y-2">
        <BreadCrumb
          cityName={city}
          cityEn={cityEn}
          proviceEn={proviceEn}
          neighborhood={neighborhood}
          proviceName={province}
          resPureNameAlone={resPureNameAlone}
          residenceId={residenceId}
        />
      </ol>
    </nav>
  );
}

export default ResLocationWithBreadCrumb;
