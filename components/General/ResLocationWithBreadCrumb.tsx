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
    <nav aria-label="مسیر صفحه">
      <ol className={`flex items-center text-13 leading-16 text-gray-B1B2B4 font-r gap-x-4`}>
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
